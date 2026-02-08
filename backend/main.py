import os
import uvicorn
import boto3
import json
import logging
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from google.cloud import firestore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash-001')

# --- DB SETUP ---
try:
    db = firestore.Client()
except:
    db = None
    logger.warning("⚠️ Using In-Memory Storage")

mem_store = {}

def get_db_ref(user_id):
    if db: return db.collection("kubemind_users").document(user_id)
    return None

def get_conns(user_id):
    if db:
        doc = get_db_ref(user_id).get()
        if doc.exists: return doc.to_dict().get("connections", {})
    return mem_store.get(user_id, {})

def save_conns(user_id, data):
    if db: get_db_ref(user_id).set({"connections": data}, merge=True)
    else: mem_store[user_id] = data

def get_aws_session(user_id):
    c = get_conns(user_id).get("aws", {})
    if not c.get("access_key"): return None
    return boto3.Session(
        aws_access_key_id=c["access_key"],
        aws_secret_access_key=c["secret_key"],
        region_name=c["region"]
    )

# --- CLOUD CONTEXT FETCHER ---
def fetch_full_cloud_context(user_id):
    context = []
    aws = get_aws_session(user_id)
    
    if not aws:
        return "⚠️ No Cloud Accounts Connected."

    # 1. EC2
    try:
        ec2 = aws.client('ec2')
        resp = ec2.describe_instances()
        for r in resp['Reservations']:
            for i in r['Instances']:
                name = next((t['Value'] for t in i.get('Tags', []) if t['Key'] == 'Name'), i['InstanceId'])
                context.append(f"[EC2] {name} ({i['InstanceId']}) | Status: {i['State']['Name']} | Type: {i['InstanceType']}")
    except Exception as e:
        context.append(f"[EC2 Error] {str(e)}")

    # 2. S3
    try:
        s3 = aws.client('s3')
        resp = s3.list_buckets()
        for b in resp['Buckets']:
            context.append(f"[S3] Bucket: {b['Name']} | Created: {b['CreationDate']}")
    except Exception as e:
        context.append(f"[S3 Error] {str(e)}")

    # 3. RDS
    try:
        rds = aws.client('rds')
        resp = rds.describe_db_instances()
        for db in resp['DBInstances']:
            context.append(f"[RDS] DB: {db['DBInstanceIdentifier']} | Status: {db['DBInstanceStatus']}")
    except: pass

    return "\n".join(context) if context else "No resources found."

class ChatRequest(BaseModel):
    message: str
    context: str = ""

class ConnectionRequest(BaseModel):
    access_key: str = None
    secret_key: str = None
    region: str = "us-east-1"

# --- ENDPOINTS ---

@app.post("/api/connect/{provider}")
async def connect(provider: str, creds: ConnectionRequest, x_user_id: str = Header("default_user")):
    curr = get_conns(x_user_id)
    curr[provider] = creds.dict()
    save_conns(x_user_id, curr)
    return {"status": "success"}

@app.delete("/api/connect/{provider}")
async def disconnect(provider: str, x_user_id: str = Header("default_user")):
    curr = get_conns(x_user_id)
    if provider in curr:
        del curr[provider]
        save_conns(x_user_id, curr)
    return {"status": "disconnected"}

@app.delete("/api/nuke_user")
async def nuke_user(x_user_id: str = Header("default_user")):
    if db: get_db_ref(x_user_id).delete()
    if x_user_id in mem_store: del mem_store[x_user_id]
    return {"status": "nuked"}

@app.get("/api/resources")
async def get_resources(x_user_id: str = Header("default_user")):
    res = []
    aws = get_aws_session(x_user_id)
    if aws:
        try:
            ec2 = aws.client('ec2')
            resp = ec2.describe_instances()
            for r in resp['Reservations']:
                for i in r['Instances']:
                    name = next((t['Value'] for t in i.get('Tags', []) if t['Key'] == 'Name'), i['InstanceId'])
                    res.append({"id": i['InstanceId'], "name": name, "type": i['InstanceType'], "provider": "aws", "region": aws.region_name, "status": i['State']['Name'], "cost": 0.0})
        except: pass
    return res

@app.post("/api/chat")
async def chat(request: ChatRequest, x_user_id: str = Header("default_user")):
    cloud_data = fetch_full_cloud_context(x_user_id)
    
    system_prompt = f"""
    You are Kubemind, an Autonomous Cloud Architect.
    
    LIVE USER CLOUD DATA:
    {cloud_data}
    
    INSTRUCTIONS:
    1. **Natural Language**: Answer questions about resources in plain English text/tables.
    2. **Actions**: Return JSON ONLY for START, STOP, CREATE, DELETE commands.
    
    JSON FORMAT:
    {{"service": "ec2|s3|rds", "action": "STOP|START|CREATE", "id": "resource_id_or_name"}}
    """
    
    try:
        ai_resp = model.generate_content(f"{system_prompt}\nUser Query: {request.message}").text
        
        # --- ROBUST ACTION HANDLER ---
        if "{" in ai_resp and "action" in ai_resp:
            try:
                json_str = ai_resp[ai_resp.find("{"):ai_resp.rfind("}")+1]
                cmd = json.loads(json_str)
                
                # FIX: Try multiple keys to find the ID (Defensive Coding)
                target_id = cmd.get('id') or cmd.get('instance_id') or cmd.get('name') or cmd.get('resource_id')
                
                # Check for Create action (might not have ID yet)
                if not target_id and cmd['action'] not in ['CREATE']:
                     return {"response": "❌ Error: AI identified the action but missed the Resource ID."}

                aws = get_aws_session(x_user_id)
                if not aws: return {"response": "⚠️ AWS not connected."}

                # >>> EC2 <<<
                if cmd['service'] == 'ec2':
                    client = aws.client('ec2')
                    if cmd['action'] == 'STOP':
                        client.stop_instances(InstanceIds=[target_id])
                        return {"response": f"✅ **Stopping** instance `{target_id}`..."}
                    elif cmd['action'] == 'START':
                        client.start_instances(InstanceIds=[target_id])
                        return {"response": f"✅ **Starting** instance `{target_id}`..."}
                    elif cmd['action'] == 'TERMINATE':
                         client.terminate_instances(InstanceIds=[target_id])
                         return {"response": f"🗑️ **Terminated** instance `{target_id}`."}

                # >>> S3 <<<
                elif cmd['service'] == 's3':
                    client = aws.client('s3')
                    if cmd['action'] == 'CREATE':
                        # Create requires name, usually in 'id' or 'name' field
                        client.create_bucket(Bucket=target_id) 
                        return {"response": f"🪣 **Created** S3 Bucket `{target_id}`."}
                    elif cmd['action'] == 'DELETE':
                        client.delete_bucket(Bucket=target_id)
                        return {"response": f"🗑️ **Deleted** S3 Bucket `{target_id}`."}

            except Exception as e:
                return {"response": f"❌ Action Failed: {str(e)}"}
        
        return {"response": ai_resp, "suggestions": []}

    except Exception as e:
        return {"response": f"System Error: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
