import logging
from google.cloud import firestore

logger = logging.getLogger(__name__)

try:
    db = firestore.Client()
except Exception:
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

def get_provider_keys(user_id, provider):
    return get_conns(user_id).get(provider.lower(), {})
