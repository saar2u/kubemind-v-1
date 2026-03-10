"""
GCP Handler - Manages all GCP service operations
Supports: Compute Engine, Cloud Run, Cloud Storage, Cloud SQL (Disabled), VPC, IAM, Cloud Monitoring
"""
from google.cloud import compute_v1, storage, monitoring_v3
from google.oauth2 import service_account
from typing import Dict, Any
import json
from utils.logger import setup_logger

logger = setup_logger()


def get_gcp_credentials(credentials: Dict[str, str]) -> service_account.Credentials:
    """Initialize GCP credentials"""
    try:
        if 'service_account_json' in credentials:
            # JSON string provided
            if isinstance(credentials['service_account_json'], str):
                creds_dict = json.loads(credentials['service_account_json'])
            else:
                creds_dict = credentials['service_account_json']
            
            return service_account.Credentials.from_service_account_info(creds_dict)
        
        elif 'service_account_file' in credentials:
            # File path provided
            return service_account.Credentials.from_service_account_file(
                credentials['service_account_file']
            )
        
        else:
            # Fallback for how our main.py handles it
            if credentials.get('jsonKey'):
                creds_dict = json.loads(credentials.get('jsonKey'))
                return service_account.Credentials.from_service_account_info(creds_dict)
            raise ValueError("GCP credentials must include 'jsonKey', 'service_account_json', or 'service_account_file'")
    
    except Exception as e:
        raise Exception(f"Failed to initialize GCP credentials: {str(e)}")


def execute_gcp_action(action_data: Dict[str, Any], credentials: Dict[str, str]) -> Dict[str, Any]:
    """Main router for GCP actions"""
    try:
        creds = get_gcp_credentials(credentials)
        project_id = credentials.get('project_id') or credentials.get('projectId')
        
        if not project_id:
            return {"success": False, "error": "project_id is required"}
        
        resource_type = action_data.get('resource_type')
        action = action_data.get('action')
        params = action_data.get('parameters', {})
        params['project_id'] = project_id
        
        # Route to appropriate handler
        handlers = {
            'GCE': handle_compute_engine,
            'CLOUD_RUN': handle_cloud_run,
            'GCS': handle_cloud_storage,
            'CLOUD_SQL': handle_cloud_sql,
            'GCP_VPC': handle_vpc,
            'GCP_IAM': handle_iam,
            'CLOUD_MONITORING': handle_monitoring
        }
        
        handler = handlers.get(resource_type)
        if not handler:
            return {"success": False, "error": f"Unsupported resource type: {resource_type}"}
        
        return handler(creds, action, params)
        
    except Exception as e:
        logger.error(f"GCP action error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# COMPUTE ENGINE HANDLERS
# ==========================================
def handle_compute_engine(creds, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Compute Engine operations"""
    try:
        project_id = params['project_id']
        zone = params.get('zone', 'us-central1-a')
        
        instances_client = compute_v1.InstancesClient(credentials=creds)
        
        if action == 'LIST':
            request = compute_v1.ListInstancesRequest(
                project=project_id,
                zone=zone
            )
            
            instances = []
            for instance in instances_client.list(request=request):
                instances.append({
                    'name': instance.name,
                    'id': str(instance.id),
                    'machine_type': instance.machine_type.split('/')[-1],
                    'status': instance.status,
                    'zone': zone,
                    'internal_ip': instance.network_interfaces[0].network_i_p if instance.network_interfaces else 'N/A',
                    'external_ip': instance.network_interfaces[0].access_configs[0].nat_i_p if instance.network_interfaces and instance.network_interfaces[0].access_configs else 'N/A',
                    'disks': len(instance.disks)
                })
            
            return {
                "success": True,
                "data": {"instances": instances, "count": len(instances)},
                "message": f"Found {len(instances)} GCE instances in {zone}"
            }
        
        elif action == 'DESCRIBE':
            instance_name = params.get('name')
            if not instance_name:
                return {"success": False, "error": "Instance name required"}
            
            request = compute_v1.GetInstanceRequest(
                project=project_id,
                zone=zone,
                instance=instance_name
            )
            
            instance = instances_client.get(request=request)
            
            return {
                "success": True,
                "data": {
                    'name': instance.name,
                    'id': str(instance.id),
                    'machine_type': instance.machine_type.split('/')[-1],
                    'status': instance.status,
                    'zone': zone,
                    'cpu_platform': instance.cpu_platform,
                    'internal_ip': instance.network_interfaces[0].network_i_p if instance.network_interfaces else 'N/A',
                    'external_ip': instance.network_interfaces[0].access_configs[0].nat_i_p if instance.network_interfaces and instance.network_interfaces[0].access_configs else 'N/A',
                    'disks': [{'name': disk.source.split('/')[-1], 'boot': disk.boot} for disk in instance.disks]
                }
            }
        
        elif action == 'START':
            instance_name = params.get('name')
            if not instance_name:
                return {"success": False, "error": "Instance name required"}
            
            request = compute_v1.StartInstanceRequest(
                project=project_id,
                zone=zone,
                instance=instance_name
            )
            
            operation = instances_client.start(request=request)
            return {"success": True, "message": f"Starting instance {instance_name}"}
        
        elif action == 'STOP':
            instance_name = params.get('name')
            if not instance_name:
                return {"success": False, "error": "Instance name required"}
            
            request = compute_v1.StopInstanceRequest(
                project=project_id,
                zone=zone,
                instance=instance_name
            )
            
            operation = instances_client.stop(request=request)
            return {"success": True, "message": f"Stopping instance {instance_name}"}
        
        elif action == 'AUDIT':
            request = compute_v1.ListInstancesRequest(
                project=project_id,
                zone=zone
            )
            
            issues = []
            for instance in instances_client.list(request=request):
                # Check for external IPs
                if instance.network_interfaces and instance.network_interfaces[0].access_configs:
                    issues.append({
                        'instance': instance.name,
                        'issue': 'Instance has external IP address',
                        'severity': 'MEDIUM',
                        'recommendation': 'Use Cloud NAT or Identity-Aware Proxy instead'
                    })
                
                # Check for unencrypted disks
                for disk in instance.disks:
                    if not disk.disk_encryption_key:
                        issues.append({
                            'instance': instance.name,
                            'issue': 'Disk not encrypted with CMEK',
                            'severity': 'MEDIUM',
                            'recommendation': 'Consider using Customer-Managed Encryption Keys'
                        })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} security issues"
            }
        
        else:
            return {"success": False, "error": f"Unsupported GCE action: {action}"}
            
    except Exception as e:
        logger.error(f"GCE error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# CLOUD RUN HANDLERS
# ==========================================
def handle_cloud_run(creds, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Cloud Run operations"""
    try:
        from google.cloud import run_v2
        
        project_id = params['project_id']
        region = params.get('region', 'us-central1')
        
        client = run_v2.ServicesClient(credentials=creds)
        parent = f"projects/{project_id}/locations/{region}"
        
        if action == 'LIST':
            request = run_v2.ListServicesRequest(parent=parent)
            
            services = []
            for service in client.list_services(request=request):
                services.append({
                    'name': service.name.split('/')[-1],
                    'url': service.uri,
                    'region': region,
                    'ingress': str(service.ingress),
                    'latest_revision': service.latest_ready_revision.split('/')[-1] if service.latest_ready_revision else 'N/A'
                })
            
            return {
                "success": True,
                "data": {"services": services, "count": len(services)},
                "message": f"Found {len(services)} Cloud Run services"
            }
        
        elif action == 'DESCRIBE':
            service_name = params.get('name')
            if not service_name:
                return {"success": False, "error": "Service name required"}
            
            name = f"{parent}/services/{service_name}"
            service = client.get_service(name=name)
            
            return {
                "success": True,
                "data": {
                    'name': service.name.split('/')[-1],
                    'url': service.uri,
                    'region': region,
                    'ingress': str(service.ingress),
                    'latest_revision': service.latest_ready_revision.split('/')[-1] if service.latest_ready_revision else 'N/A'
                }
            }
        
        elif action == 'AUDIT':
            request = run_v2.ListServicesRequest(parent=parent)
            issues = []
            
            for service in client.list_services(request=request):
                # Check if service allows unauthenticated access
                if service.ingress == run_v2.IngressTraffic.INGRESS_TRAFFIC_ALL:
                    issues.append({
                        'service': service.name.split('/')[-1],
                        'issue': 'Service allows unauthenticated access',
                        'severity': 'MEDIUM',
                        'recommendation': 'Consider using IAM authentication'
                    })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)}
            }
        
        else:
            return {"success": False, "error": f"Unsupported Cloud Run action: {action}"}
            
    except Exception as e:
        logger.error(f"Cloud Run error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# CLOUD STORAGE HANDLERS
# ==========================================
def handle_cloud_storage(creds, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Cloud Storage operations"""
    try:
        project_id = params['project_id']
        storage_client = storage.Client(credentials=creds, project=project_id)
        
        if action == 'LIST':
            buckets = []
            for bucket in storage_client.list_buckets():
                buckets.append({
                    'name': bucket.name,
                    'location': bucket.location,
                    'storage_class': bucket.storage_class,
                    'created': str(bucket.time_created)
                })
            
            return {
                "success": True,
                "data": {"buckets": buckets, "count": len(buckets)},
                "message": f"Found {len(buckets)} GCS buckets"
            }
        
        elif action == 'AUDIT':
            issues = []
            
            for bucket in storage_client.list_buckets():
                # Check for public access
                iam_policy = bucket.get_iam_policy()
                for binding in iam_policy.bindings:
                    if 'allUsers' in binding.get('members', []) or 'allAuthenticatedUsers' in binding.get('members', []):
                        issues.append({
                            'bucket': bucket.name,
                            'issue': 'Bucket allows public access',
                            'severity': 'CRITICAL',
                            'recommendation': 'Remove public access immediately'
                        })
                
                # Check for versioning
                if not bucket.versioning_enabled:
                    issues.append({
                        'bucket': bucket.name,
                        'issue': 'Versioning not enabled',
                        'severity': 'MEDIUM',
                        'recommendation': 'Enable versioning for data protection'
                    })
                
                # Check for uniform bucket-level access
                if not bucket.iam_configuration.uniform_bucket_level_access_enabled:
                    issues.append({
                        'bucket': bucket.name,
                        'issue': 'Uniform bucket-level access not enabled',
                        'severity': 'LOW',
                        'recommendation': 'Enable for better access control'
                    })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} security issues"
            }
        
        else:
            return {"success": False, "error": f"Unsupported GCS action: {action}"}
            
    except Exception as e:
        logger.error(f"GCS error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# CLOUD SQL HANDLERS
# ==========================================
def handle_cloud_sql(creds, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Cloud SQL operations"""
    return {
        "success": False, 
        "error": "Cloud SQL module is temporarily disabled due to dependency conflicts. We will restore it later."
    }


# ==========================================
# VPC HANDLERS
# ==========================================
def handle_vpc(creds, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle VPC operations"""
    try:
        project_id = params['project_id']
        
        networks_client = compute_v1.NetworksClient(credentials=creds)
        firewalls_client = compute_v1.FirewallsClient(credentials=creds)
        
        if action == 'LIST':
            networks = []
            for network in networks_client.list(project=project_id):
                networks.append({
                    'name': network.name,
                    'id': str(network.id),
                    'auto_create_subnetworks': network.auto_create_subnetworks,
                    'routing_mode': network.routing_config.routing_mode if network.routing_config else 'REGIONAL'
                })
            
            return {
                "success": True,
                "data": {"networks": networks, "count": len(networks)},
                "message": f"Found {len(networks)} VPC networks"
            }
        
        elif action == 'AUDIT':
            # Check firewall rules
            issues = []
            
            for rule in firewalls_client.list(project=project_id):
                # Check for overly permissive rules
                if rule.source_ranges and '0.0.0.0/0' in rule.source_ranges:
                    for allowed in rule.allowed:
                        ports = allowed.ports if allowed.ports else ['ALL']
                        for port in ports:
                            issues.append({
                                'firewall_rule': rule.name,
                                'issue': f'Port {port} open to internet (0.0.0.0/0)',
                                'protocol': allowed.i_p_protocol,
                                'severity': 'HIGH' if port in ['22', '3389', '3306', '5432'] else 'MEDIUM',
                                'recommendation': 'Restrict to specific IP ranges'
                            })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} networking security issues"
            }
        
        else:
            return {"success": False, "error": f"Unsupported VPC action: {action}"}
            
    except Exception as e:
        logger.error(f"VPC error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# IAM HANDLERS
# ==========================================
def handle_iam(creds, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle IAM operations"""
    try:
        from google.cloud import iam_admin_v1
        
        project_id = params['project_id']
        
        if action == 'LIST':
            iam_client = iam_admin_v1.IAMClient(credentials=creds)
            
            # List service accounts
            parent = f"projects/{project_id}"
            
            service_accounts = []
            for sa in iam_client.list_service_accounts(request={"name": parent}):
                service_accounts.append({
                    'email': sa.email,
                    'name': sa.name.split('/')[-1],
                    'display_name': sa.display_name,
                    'disabled': sa.disabled
                })
            
            return {
                "success": True,
                "data": {"service_accounts": service_accounts, "count": len(service_accounts)},
                "message": f"Found {len(service_accounts)} service accounts"
            }
        
        elif action == 'AUDIT':
            # Basic IAM audit
            issues = []
            
            # This would require more extensive IAM policy analysis
            # For now, returning a simple message
            
            return {
                "success": True,
                "data": {
                    "issues": issues,
                    "total_issues": len(issues),
                    "note": "For comprehensive IAM audit, use Google Cloud Security Command Center"
                }
            }
        
        else:
            return {"success": False, "error": f"Unsupported IAM action: {action}"}
            
    except Exception as e:
        logger.error(f"IAM error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# CLOUD MONITORING HANDLERS
# ==========================================
def handle_monitoring(creds, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Cloud Monitoring operations"""
    try:
        project_id = params['project_id']
        project_name = f"projects/{project_id}"
        
        client = monitoring_v3.AlertPolicyServiceClient(credentials=creds)
        
        if action == 'LIST':
            policies = []
            
            for policy in client.list_alert_policies(name=project_name):
                policies.append({
                    'name': policy.display_name,
                    'enabled': policy.enabled,
                    'conditions': len(policy.conditions)
                })
            
            return {
                "success": True,
                "data": {"alert_policies": policies, "count": len(policies)},
                "message": f"Found {len(policies)} alert policies"
            }
        
        else:
            return {"success": False, "error": f"Unsupported Cloud Monitoring action: {action}"}
            
    except Exception as e:
        logger.error(f"Cloud Monitoring error: {str(e)}")
        return {"success": False, "error": str(e)}