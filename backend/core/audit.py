import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def log_action(user_id, provider, action, resource, status="PENDING_APPROVAL"):
    """
    Logs every action to the database for security and FinOps auditing.
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "provider": provider,
        "action": action,
        "resource": resource,
        "status": status
    }
    logger.info(f"🛡️ AUDIT LOG: {log_entry}")
    # In a real setup, save `log_entry` to Firestore/DB here.
    return log_entry
