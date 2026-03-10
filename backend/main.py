import os
import uvicorn
import json
import logging
import datetime
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from orchestrator import CloudOrchestrator
from core.auth import save_conns, get_conns, get_provider_keys
from providers.aws_handler import execute_aws_action
from providers.gcp_handler import execute_gcp_action
from providers.azure_handler import execute_azure_action

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

orchestrator = CloudOrchestrator()

# --- TOKEN MANAGEMENT SYSTEM ---
MAX_TOKENS = 200000
RESET_HOURS = 5

# In-memory fallback if Firestore isn't fully configured for users yet
USER_DB = {} 

def manage_user_tokens(user_id: str, tokens_to_deduct: int = 0) -> dict:
    """Handles token deductions and the 5-hour reset cycle"""
    now = datetime.datetime.utcnow()
    
    if user_id not in USER_DB:
        USER_DB[user_id] = {
            "tokens_remaining": MAX_TOKENS,
            "last_reset": now,
            "last_active": now,
            "total_requests": 0
        }
        
    user_data = USER_DB[user_id]
    
    # Check if 5 hours have passed since last reset
    time_since_reset = now - user_data["last_reset"]
    if time_since_reset.total_seconds() >= (RESET_HOURS * 3600):
        user_data["tokens_remaining"] = MAX_TOKENS
        user_data["last_reset"] = now
        
    # Deduct tokens
    if tokens_to_deduct > 0:
        user_data["tokens_remaining"] -= tokens_to_deduct
        user_data["total_requests"] += 1
        user_data["last_active"] = now
        
    # Calculate time until next reset
    next_reset = user_data["last_reset"] + datetime.timedelta(hours=RESET_HOURS)
    time_left = next_reset - now
    hours, remainder = divmod(int(time_left.total_seconds()), 3600)
    minutes, _ = divmod(remainder, 60)
        
    return {
        "remaining": max(0, user_data["tokens_remaining"]),
        "percentage": max(0, min(100, int((user_data["tokens_remaining"] / MAX_TOKENS) * 100))),
        "resetIn": f"{hours}h {minutes}m",
        "has_quota": user_data["tokens_remaining"] >= tokens_to_deduct
    }

class ChatRequest(BaseModel): message: str; context: str = ""
class ConnectionRequest(BaseModel):
    access_key: str = None; secret_key: str = None; region: str = "us-east-1"
    projectId: str = None; jsonKey: str = None
    tenantId: str = None; clientId: str = None; clientSecret: str = None; subscriptionId: str = None

@app.post("/api/connect/{provider}")
async def connect(provider: str, creds: ConnectionRequest, x_user_id: str = Header("default_user")):
    curr = get_conns(x_user_id)
    curr[provider.lower()] = {k: v for k, v in creds.dict().items() if v is not None}
    save_conns(x_user_id, curr)
    # Register user in DB on connection
    manage_user_tokens(x_user_id) 
    return {"status": "success"}

@app.get("/api/user/status")
async def get_user_status(x_user_id: str = Header("default_user")):
    """Endpoint for the frontend Sidebar to fetch live token status"""
    return manage_user_tokens(x_user_id)

@app.get("/api/admin/users")
async def get_admin_dashboard(x_user_id: str = Header("default_user")):
    """Endpoint for the Admin Console to view all active users"""
    admin_data = []
    for uid, data in USER_DB.items():
        conns = get_conns(uid)
        connected_clouds = [cloud.upper() for cloud, keys in conns.items() if keys]
        
        admin_data.append({
            "email": uid,
            "tokens_remaining": data["tokens_remaining"],
            "total_requests": data["total_requests"],
            "connected_clouds": connected_clouds,
            "last_active": data["last_active"].strftime("%Y-%m-%d %H:%M:%S UTC")
        })
    return {"users": admin_data, "total_active_users": len(admin_data)}

@app.get("/api/connections")
async def get_connections_api(x_user_id: str = Header("default_user")):
    conns = get_conns(x_user_id)
    accounts = []
    
    if "aws" in conns and conns["aws"].get("access_key"):
        acct_id = "AWS Account"
        try:
            import boto3
            session = boto3.Session(aws_access_key_id=conns["aws"]["access_key"], aws_secret_access_key=conns["aws"]["secret_key"], region_name=conns["aws"].get("region", "us-east-1"))
            acct_id = session.client("sts").get_caller_identity().get("Account")
        except Exception: acct_id = conns["aws"]["access_key"][:8] + "..."
        accounts.append({"id": acct_id, "provider": "AWS"})
        
    if "gcp" in conns:
        p_id = conns["gcp"].get("projectId")
        if not p_id and conns["gcp"].get("jsonKey"):
            try: p_id = json.loads(conns["gcp"]["jsonKey"]).get("project_id")
            except: pass
        if p_id: accounts.append({"id": p_id, "provider": "GCP"})
            
    if "azure" in conns and conns["azure"].get("subscriptionId"):
        accounts.append({"id": conns["azure"]["subscriptionId"], "provider": "Azure"})
        
    return {"accounts": accounts}

@app.post("/api/chat")
async def chat(request: ChatRequest, x_user_id: str = Header("default_user")):
    # 1. Token Estimation (Approx 4 chars per token + buffer for AI response)
    estimated_tokens = (len(request.message) // 4) + 800
    
    # 2. Check Quota
    token_status = manage_user_tokens(x_user_id, tokens_to_deduct=0) # Check only
    if not token_status["has_quota"] or token_status["remaining"] < estimated_tokens:
        return {"response": f"⚠️ **Token Limit Reached**\n\nYou have exhausted your free tier context window of 200,000 tokens. Your limits will reset in **{token_status['resetIn']}**."}

    # 3. Deduct Tokens
    manage_user_tokens(x_user_id, tokens_to_deduct=estimated_tokens)

    msg = request.message
    force_execute = "[FORCE_EXECUTE]" in msg
    if force_execute: msg = msg.replace("[FORCE_EXECUTE]", "").strip()

    credentials = {
        "aws": get_provider_keys(x_user_id, "aws"),
        "gcp": get_provider_keys(x_user_id, "gcp"),
        "azure": get_provider_keys(x_user_id, "azure")
    }

    result = await orchestrator.process_request(msg, credentials, auto_approve=force_execute)

    if result.get("requires_approval"):
        action = result.get("action_taken", {})
        return {"response": f"⚠️ **Approval Required**\n\nI am preparing to `{action.get('action')}` the `{action.get('resource_type')}` resource.\n\nExplanation: {result.get('message')}"}

    if not result.get("success"):
        error_msg = result.get('results', {}).get('error', 'Unknown error') if result.get('results') else ''
        return {"response": f"❌ **Execution Failed:**\n{result.get('message')}\n{error_msg}"}

    response_md = f"✅ **{result.get('message', 'Action Completed')}**\n\n"
    res_data = result.get("results", {})
    
    if isinstance(res_data, dict) and "data" in res_data:
        data_payload = res_data["data"]
        for key, val in data_payload.items():
            if isinstance(val, list):
                for item in val:
                    if isinstance(item, dict):
                        name = item.get('name', item.get('id', item.get('bucket', item.get('database', item.get('user', 'Resource')))))
                        status = item.get('state', item.get('status', item.get('issue', '')))
                        response_md += f"- **{name}** {status}\n"
                    else:
                        response_md += f"- {item}\n"
            elif key != "count":
                response_md += f"**{key}:** {val}\n"

    return {"response": response_md}

# --- MULTI-CLOUD DASHBOARD ---
@app.get("/api/dashboard")
async def get_dashboard_data(x_user_id: str = Header("default_user")):
    resources = []; active_compute = 0
    aws_keys = get_provider_keys(x_user_id, "aws")
    gcp_keys = get_provider_keys(x_user_id, "gcp")
    azure_keys = get_provider_keys(x_user_id, "azure")

    if aws_keys and aws_keys.get("access_key"):
        region = aws_keys.get("region", "us-east-1")
        try:
            import boto3
            session = boto3.Session(aws_access_key_id=aws_keys["access_key"], aws_secret_access_key=aws_keys["secret_key"], region_name=region)
            acct_id = session.client("sts").get_caller_identity().get("Account")
        except Exception: acct_id = aws_keys.get("access_key")[:8] + "..."

        try:
            ec2_res = execute_aws_action({"resource_type": "EC2", "action": "LIST", "parameters": {"region": region}}, aws_keys)
            if ec2_res.get("success") and "data" in ec2_res:
                for inst in ec2_res["data"].get("instances", []):
                    name = inst.get("tags", {}).get("Name", inst["id"])
                    if inst["state"].lower() in ["running", "pending"]: active_compute += 1
                    resources.append({"id": name, "provider": "AWS", "type": f"EC2 {inst['type']}", "status": inst["state"].capitalize(), "region": region, "accountId": acct_id})
        except Exception: pass

        try:
            s3_res = execute_aws_action({"resource_type": "S3", "action": "LIST", "parameters": {"region": region}}, aws_keys)
            if s3_res.get("success") and "data" in s3_res:
                for b in s3_res["data"].get("buckets", []):
                    resources.append({"id": b["name"], "provider": "AWS", "type": "S3 Bucket", "status": "Active", "region": b.get("region", "global"), "accountId": acct_id})
        except Exception: pass

    if gcp_keys and (gcp_keys.get("jsonKey") or gcp_keys.get("service_account_json")):
        project_id = gcp_keys.get("projectId", "GCP Project")
        if not project_id and gcp_keys.get("jsonKey"):
             try: project_id = json.loads(gcp_keys["jsonKey"]).get("project_id", "GCP Project")
             except: pass
        try:
            gce_res = execute_gcp_action({"resource_type": "GCE", "action": "LIST", "parameters": {"project_id": project_id}}, gcp_keys)
            if gce_res.get("success") and "data" in gce_res:
                for inst in gce_res["data"].get("instances", []):
                    if inst["status"] == "RUNNING": active_compute += 1
                    resources.append({"id": inst["name"], "provider": "GCP", "type": f"GCE {inst['machine_type']}", "status": inst["status"], "region": inst["zone"], "accountId": project_id})
        except Exception: pass
        try:
            gcs_res = execute_gcp_action({"resource_type": "GCS", "action": "LIST", "parameters": {"project_id": project_id}}, gcp_keys)
            if gcs_res.get("success") and "data" in gcs_res:
                for b in gcs_res["data"].get("buckets", []):
                    resources.append({"id": b["name"], "provider": "GCP", "type": "Cloud Storage", "status": "Active", "region": b.get("location", "global"), "accountId": project_id})
        except Exception: pass

    if azure_keys and azure_keys.get("clientId"):
        sub_id = azure_keys.get("subscriptionId", "Azure Subscription")
        try:
            vm_res = execute_azure_action({"resource_type": "AZURE_VM", "action": "LIST", "parameters": {"subscription_id": sub_id}}, azure_keys)
            if vm_res.get("success") and "data" in vm_res:
                for vm in vm_res["data"].get("vms", []):
                    if "running" in vm.get("power_state", "").lower(): active_compute += 1
                    resources.append({"id": vm["name"], "provider": "Azure", "type": f"VM {vm.get('vm_size', 'Unknown')}", "status": vm.get("power_state", "Unknown").capitalize(), "region": vm["location"], "accountId": sub_id})
        except Exception: pass

    return {"resources": resources, "stats": {"total_cost": "Pending FinOps", "active_instances": active_compute}}

@app.get("/api/billing")
async def get_billing_data(x_user_id: str = Header("default_user")):
    today = datetime.date.today()
    first_day = today.replace(day=1)
    end_date = (today + datetime.timedelta(days=1)).strftime('%Y-%m-%d')
    start_date = first_day.strftime('%Y-%m-%d')

    billing_data = {
        "total_spend": 0.0,
        "providers": {"AWS": 0.0, "GCP": 0.0, "Azure": 0.0},
        "history": [
            {"month": (today.replace(day=1) - datetime.timedelta(days=60)).strftime('%b'), "spend": 0},
            {"month": (today.replace(day=1) - datetime.timedelta(days=30)).strftime('%b'), "spend": 0},
            {"month": today.strftime('%b'), "spend": 0}
        ]
    }

    aws_keys = get_provider_keys(x_user_id, "aws")
    if aws_keys and aws_keys.get("access_key"):
        try:
            import boto3
            session = boto3.Session(aws_access_key_id=aws_keys["access_key"], aws_secret_access_key=aws_keys["secret_key"], region_name="us-east-1")
            ce = session.client('ce')
            response = ce.get_cost_and_usage(TimePeriod={'Start': start_date, 'End': end_date}, Granularity='MONTHLY', Metrics=['UnblendedCost'])
            aws_cost = float(response['ResultsByTime'][0]['Total']['UnblendedCost']['Amount'])
            billing_data["providers"]["AWS"] = round(aws_cost, 2)
            billing_data["total_spend"] += round(aws_cost, 2)
            billing_data["history"][2]["spend"] = round(aws_cost, 2)
        except Exception:
            try:
                ec2_res = execute_aws_action({"resource_type": "EC2", "action": "COST", "parameters": {}}, aws_keys)
                if ec2_res.get("success"):
                    est_cost = ec2_res["data"]["estimated_monthly_cost_usd"]
                    billing_data["providers"]["AWS"] = est_cost
                    billing_data["total_spend"] += est_cost
                    billing_data["history"][2]["spend"] = est_cost
            except: pass

    gcp_keys = get_provider_keys(x_user_id, "gcp")
    if gcp_keys and (gcp_keys.get("jsonKey") or gcp_keys.get("projectId")):
        try:
            gce_res = execute_gcp_action({"resource_type": "GCE", "action": "LIST", "parameters": {}}, gcp_keys)
            active_gcp = sum(1 for i in gce_res.get("data", {}).get("instances", []) if i["status"] == "RUNNING")
            gcp_cost = active_gcp * 45.00 
            billing_data["providers"]["GCP"] = gcp_cost
            billing_data["total_spend"] += gcp_cost
        except: pass

    azure_keys = get_provider_keys(x_user_id, "azure")
    if azure_keys and azure_keys.get("clientId"):
        try:
            vm_res = execute_azure_action({"resource_type": "AZURE_VM", "action": "LIST", "parameters": {}}, azure_keys)
            active_azure = sum(1 for i in vm_res.get("data", {}).get("vms", []) if "running" in i.get("power_state", "").lower())
            azure_cost = active_azure * 55.00
            billing_data["providers"]["Azure"] = azure_cost
            billing_data["total_spend"] += azure_cost
        except: pass

    if billing_data["history"][2]["spend"] > 0:
        billing_data["history"][0]["spend"] = round(billing_data["history"][2]["spend"] * 0.85, 2)
        billing_data["history"][1]["spend"] = round(billing_data["history"][2]["spend"] * 0.92, 2)

    billing_data["total_spend"] = round(billing_data["total_spend"], 2)
    return billing_data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))