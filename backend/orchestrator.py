import google.generativeai as genai
import os
import uuid
from typing import Dict, Any, Optional
from datetime import datetime

from agent.prompt_engine import get_system_prompt, parse_agent_response, validate_action_data
from providers.aws_handler import execute_aws_action
from providers.gcp_handler import execute_gcp_action
from providers.azure_handler import execute_azure_action
from utils.logger import setup_logger

logger = setup_logger()

class CloudOrchestrator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key: raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        # UPDATED: Fixed model name for your specific API tier
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
        self.pending_actions = {}
        logger.info("CloudOrchestrator initialized successfully")
    
    async def process_request(self, query: str, credentials: Dict[str, Any], auto_approve: bool = False) -> Dict[str, Any]:
        try:
            cloud_context = self._build_cloud_context(credentials)
            system_prompt = get_system_prompt(cloud_context)
            full_prompt = f"{system_prompt}\n\nUser Query: {query}"
            
            response = self.model.generate_content(full_prompt)
            parsed = parse_agent_response(response.text)
            
            if not parsed["is_action"]:
                return {"success": True, "message": parsed["message"], "action_taken": None, "results": None, "requires_approval": False}
            
            action_data = parsed["action_data"]
            is_valid, error_msg = validate_action_data(action_data)
            
            if not is_valid:
                return {"success": False, "message": f"Invalid action: {error_msg}", "action_taken": None, "results": None, "requires_approval": False}
            
            requires_approval = action_data.get("requires_approval", True)
            
            if requires_approval and not auto_approve:
                action_id = str(uuid.uuid4())
                self.pending_actions[action_id] = {"action_data": action_data, "credentials": credentials, "created_at": datetime.now().isoformat(), "query": query}
                return {"success": True, "message": parsed["message"], "action_taken": action_data, "results": None, "requires_approval": True, "action_id": action_id}
            
            results = await self._execute_action(action_data, credentials)
            return {"success": results.get("success", True), "message": parsed["message"], "action_taken": action_data, "results": results, "requires_approval": False}
            
        except Exception as e:
            logger.error(f"Error in process_request: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}", "action_taken": None, "results": None, "requires_approval": False}
    
    async def _execute_action(self, action_data: Dict[str, Any], credentials: Dict[str, Any]) -> Dict[str, Any]:
        provider = action_data["provider"]
        try:
            if provider == "AWS":
                if not credentials.get("aws", {}).get("access_key"): return {"success": False, "error": "AWS credentials not provided"}
                return execute_aws_action(action_data, credentials["aws"])
            elif provider == "GCP":
                if not credentials.get("gcp", {}).get("jsonKey"): return {"success": False, "error": "GCP credentials not provided"}
                return execute_gcp_action(action_data, credentials["gcp"])
            elif provider == "AZURE":
                if not credentials.get("azure", {}).get("clientId"): return {"success": False, "error": "Azure credentials not provided"}
                return execute_azure_action(action_data, credentials["azure"])
            else:
                return {"success": False, "error": f"Unsupported provider: {provider}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _build_cloud_context(self, credentials: Dict[str, Any]) -> Dict[str, Any]:
        context = {"available_clouds": [], "timestamp": datetime.now().isoformat()}
        if credentials.get("aws", {}).get("access_key"): context["available_clouds"].append("AWS")
        if credentials.get("gcp", {}).get("jsonKey"): context["available_clouds"].append("GCP")
        if credentials.get("azure", {}).get("clientId"): context["available_clouds"].append("Azure")
        return context