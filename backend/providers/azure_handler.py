"""
Azure Handler - Manages all Azure service operations
Supports: VMs, Functions, Blob Storage, SQL Database, Cosmos DB, VNet, Entra ID, Azure Monitor
"""
from azure.identity import ClientSecretCredential, DefaultAzureCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.storage import StorageManagementClient
from azure.mgmt.sql import SqlManagementClient
from azure.mgmt.cosmosdb import CosmosDBManagementClient
from azure.mgmt.network import NetworkManagementClient
from azure.mgmt.monitor import MonitorManagementClient
from azure.mgmt.web import WebSiteManagementClient
from azure.storage.blob import BlobServiceClient
from typing import Dict, Any
from utils.logger import setup_logger

logger = setup_logger()


def get_azure_credential(credentials: Dict[str, str]):
    """Initialize Azure credentials"""
    try:
        if all(k in credentials for k in ['clientId', 'clientSecret', 'tenantId']):
            return ClientSecretCredential(
                tenant_id=credentials['tenantId'],
                client_id=credentials['clientId'],
                client_secret=credentials['clientSecret']
            )
        else:
            # Fallback to default credential
            return DefaultAzureCredential()
    except Exception as e:
        raise Exception(f"Failed to initialize Azure credentials: {str(e)}")


def execute_azure_action(action_data: Dict[str, Any], credentials: Dict[str, str]) -> Dict[str, Any]:
    """Main router for Azure actions"""
    try:
        credential = get_azure_credential(credentials)
        subscription_id = credentials.get('subscriptionId')
        
        if not subscription_id:
            return {"success": False, "error": "subscription_id is required"}
        
        resource_type = action_data.get('resource_type')
        action = action_data.get('action')
        params = action_data.get('parameters', {})
        params['subscription_id'] = subscription_id
        
        # Route to appropriate handler
        handlers = {
            'AZURE_VM': handle_virtual_machines,
            'AZURE_FUNCTION': handle_functions,
            'BLOB_STORAGE': handle_blob_storage,
            'AZURE_SQL': handle_sql_database,
            'COSMOS_DB': handle_cosmos_db,
            'VNET': handle_vnet,
            'ENTRA_ID': handle_entra_id,
            'AZURE_MONITOR': handle_monitor
        }
        
        handler = handlers.get(resource_type)
        if not handler:
            return {"success": False, "error": f"Unsupported resource type: {resource_type}"}
        
        return handler(credential, action, params)
        
    except Exception as e:
        logger.error(f"Azure action error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# VIRTUAL MACHINES HANDLERS
# ==========================================
def handle_virtual_machines(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Azure Virtual Machines operations"""
    try:
        subscription_id = params['subscription_id']
        compute_client = ComputeManagementClient(credential, subscription_id)
        
        if action == 'LIST':
            vms = []
            for vm in compute_client.virtual_machines.list_all():
                # Get instance view for power state
                instance_view = compute_client.virtual_machines.instance_view(
                    vm.id.split('/')[4],  # resource group
                    vm.name
                )
                
                power_state = 'unknown'
                for status in instance_view.statuses:
                    if status.code.startswith('PowerState/'):
                        power_state = status.code.split('/')[-1]
                
                vms.append({
                    'name': vm.name,
                    'id': vm.id,
                    'location': vm.location,
                    'vm_size': vm.hardware_profile.vm_size,
                    'os_type': vm.storage_profile.os_disk.os_type,
                    'power_state': power_state,
                    'resource_group': vm.id.split('/')[4],
                    'tags': vm.tags or {}
                })
            
            return {
                "success": True,
                "data": {"vms": vms, "count": len(vms)},
                "message": f"Found {len(vms)} Azure VMs"
            }
        
        elif action == 'DESCRIBE':
            vm_name = params.get('name')
            resource_group = params.get('resource_group')
            
            if not vm_name or not resource_group:
                return {"success": False, "error": "VM name and resource group required"}
            
            vm = compute_client.virtual_machines.get(resource_group, vm_name)
            instance_view = compute_client.virtual_machines.instance_view(resource_group, vm_name)
            
            power_state = 'unknown'
            for status in instance_view.statuses:
                if status.code.startswith('PowerState/'):
                    power_state = status.code.split('/')[-1]
            
            return {
                "success": True,
                "data": {
                    'name': vm.name,
                    'location': vm.location,
                    'vm_size': vm.hardware_profile.vm_size,
                    'os_type': vm.storage_profile.os_disk.os_type,
                    'power_state': power_state,
                    'network_interfaces': [nic.id.split('/')[-1] for nic in vm.network_profile.network_interfaces],
                    'tags': vm.tags or {}
                }
            }
        
        elif action == 'START':
            vm_name = params.get('name')
            resource_group = params.get('resource_group')
            
            if not vm_name or not resource_group:
                return {"success": False, "error": "VM name and resource group required"}
            
            async_start = compute_client.virtual_machines.begin_start(resource_group, vm_name)
            return {"success": True, "message": f"Starting VM {vm_name}"}
        
        elif action == 'STOP':
            vm_name = params.get('name')
            resource_group = params.get('resource_group')
            
            if not vm_name or not resource_group:
                return {"success": False, "error": "VM name and resource group required"}
            
            async_stop = compute_client.virtual_machines.begin_power_off(resource_group, vm_name)
            return {"success": True, "message": f"Stopping VM {vm_name}"}
        
        elif action == 'AUDIT':
            issues = []
            
            for vm in compute_client.virtual_machines.list_all():
                resource_group = vm.id.split('/')[4]
                
                # Check for public IPs
                for nic_ref in vm.network_profile.network_interfaces:
                    nic_name = nic_ref.id.split('/')[-1]
                    network_client = NetworkManagementClient(credential, subscription_id)
                    
                    try:
                        nic = network_client.network_interfaces.get(resource_group, nic_name)
                        for ip_config in nic.ip_configurations:
                            if ip_config.public_ip_address:
                                issues.append({
                                    'vm': vm.name,
                                    'issue': 'VM has public IP address',
                                    'severity': 'MEDIUM',
                                    'recommendation': 'Use Azure Bastion or VPN'
                                })
                    except:
                        pass
                
                # Check for unencrypted disks
                if vm.storage_profile.os_disk.encryption_settings is None:
                    issues.append({
                        'vm': vm.name,
                        'issue': 'OS disk not encrypted',
                        'severity': 'HIGH',
                        'recommendation': 'Enable Azure Disk Encryption'
                    })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} security issues"
            }
        
        else:
            return {"success": False, "error": f"Unsupported VM action: {action}"}
            
    except Exception as e:
        logger.error(f"Azure VM error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# AZURE FUNCTIONS HANDLERS
# ==========================================
def handle_functions(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Azure Functions operations"""
    try:
        subscription_id = params['subscription_id']
        web_client = WebSiteManagementClient(credential, subscription_id)
        
        if action == 'LIST':
            functions = []
            
            for app in web_client.web_apps.list():
                # Filter for function apps
                if app.kind and 'functionapp' in app.kind.lower():
                    functions.append({
                        'name': app.name,
                        'location': app.location,
                        'state': app.state,
                        'resource_group': app.id.split('/')[4],
                        'runtime': app.site_config.linux_fx_version if app.site_config else 'N/A',
                        'default_hostname': app.default_host_name
                    })
            
            return {
                "success": True,
                "data": {"function_apps": functions, "count": len(functions)},
                "message": f"Found {len(functions)} Function Apps"
            }
        
        elif action == 'AUDIT':
            issues = []
            
            for app in web_client.web_apps.list():
                if app.kind and 'functionapp' in app.kind.lower():
                    # Check HTTPS only
                    if not app.https_only:
                        issues.append({
                            'function_app': app.name,
                            'issue': 'HTTPS not enforced',
                            'severity': 'HIGH',
                            'recommendation': 'Enable HTTPS only'
                        })
                    
                    # Check managed identity
                    if not app.identity:
                        issues.append({
                            'function_app': app.name,
                            'issue': 'Managed identity not enabled',
                            'severity': 'MEDIUM',
                            'recommendation': 'Enable managed identity for secure access'
                        })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)}
            }
        
        else:
            return {"success": False, "error": f"Unsupported Functions action: {action}"}
            
    except Exception as e:
        logger.error(f"Azure Functions error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# BLOB STORAGE HANDLERS
# ==========================================
def handle_blob_storage(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Azure Blob Storage operations"""
    try:
        subscription_id = params['subscription_id']
        storage_client = StorageManagementClient(credential, subscription_id)
        
        if action == 'LIST':
            storage_accounts = []
            
            for account in storage_client.storage_accounts.list():
                storage_accounts.append({
                    'name': account.name,
                    'location': account.location,
                    'sku': account.sku.name,
                    'kind': account.kind,
                    'resource_group': account.id.split('/')[4],
                    'primary_endpoints': {
                        'blob': account.primary_endpoints.blob if account.primary_endpoints else None
                    }
                })
            
            return {
                "success": True,
                "data": {"storage_accounts": storage_accounts, "count": len(storage_accounts)},
                "message": f"Found {len(storage_accounts)} storage accounts"
            }
        
        elif action == 'AUDIT':
            issues = []
            
            for account in storage_client.storage_accounts.list():
                resource_group = account.id.split('/')[4]
                
                # Check HTTPS only
                if not account.enable_https_traffic_only:
                    issues.append({
                        'storage_account': account.name,
                        'issue': 'HTTPS not enforced',
                        'severity': 'HIGH',
                        'recommendation': 'Enable secure transfer (HTTPS only)'
                    })
                
                # Check public access
                if account.allow_blob_public_access:
                    issues.append({
                        'storage_account': account.name,
                        'issue': 'Public blob access allowed',
                        'severity': 'HIGH',
                        'recommendation': 'Disable public blob access'
                    })
                
                # Check encryption
                if not account.encryption or not account.encryption.services.blob.enabled:
                    issues.append({
                        'storage_account': account.name,
                        'issue': 'Blob encryption not enabled',
                        'severity': 'CRITICAL',
                        'recommendation': 'Enable blob encryption'
                    })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} security issues"
            }
        
        else:
            return {"success": False, "error": f"Unsupported Blob Storage action: {action}"}
            
    except Exception as e:
        logger.error(f"Blob Storage error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# SQL DATABASE HANDLERS
# ==========================================
def handle_sql_database(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Azure SQL Database operations"""
    try:
        subscription_id = params['subscription_id']
        sql_client = SqlManagementClient(credential, subscription_id)
        
        if action == 'LIST':
            databases = []
            
            # List all servers first
            for server in sql_client.servers.list():
                resource_group = server.id.split('/')[4]
                
                # List databases on each server
                for db in sql_client.databases.list_by_server(resource_group, server.name):
                    if db.name != 'master':  # Skip system database
                        databases.append({
                            'name': db.name,
                            'server': server.name,
                            'location': db.location,
                            'status': db.status,
                            'sku': db.sku.name if db.sku else 'N/A',
                            'resource_group': resource_group
                        })
            
            return {
                "success": True,
                "data": {"databases": databases, "count": len(databases)},
                "message": f"Found {len(databases)} SQL databases"
            }
        
        elif action == 'AUDIT':
            issues = []
            
            for server in sql_client.servers.list():
                resource_group = server.id.split('/')[4]
                
                # Check firewall rules
                for rule in sql_client.firewall_rules.list_by_server(resource_group, server.name):
                    if rule.start_ip_address == '0.0.0.0' and rule.end_ip_address == '255.255.255.255':
                        issues.append({
                            'server': server.name,
                            'issue': 'Firewall allows all IPs (0.0.0.0 - 255.255.255.255)',
                            'severity': 'CRITICAL',
                            'recommendation': 'Restrict to specific IP ranges'
                        })
                
                # Check for databases
                for db in sql_client.databases.list_by_server(resource_group, server.name):
                    if db.name != 'master':
                        # Check TDE (Transparent Data Encryption)
                        try:
                            tde = sql_client.transparent_data_encryptions.get(
                                resource_group, server.name, db.name
                            )
                            if tde.status != 'Enabled':
                                issues.append({
                                    'database': db.name,
                                    'server': server.name,
                                    'issue': 'Transparent Data Encryption not enabled',
                                    'severity': 'HIGH',
                                    'recommendation': 'Enable TDE'
                                })
                        except:
                            pass
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)}
            }
        
        else:
            return {"success": False, "error": f"Unsupported SQL Database action: {action}"}
            
    except Exception as e:
        logger.error(f"SQL Database error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# COSMOS DB HANDLERS
# ==========================================
def handle_cosmos_db(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Cosmos DB operations"""
    try:
        subscription_id = params['subscription_id']
        cosmos_client = CosmosDBManagementClient(credential, subscription_id)
        
        if action == 'LIST':
            accounts = []
            
            for account in cosmos_client.database_accounts.list():
                accounts.append({
                    'name': account.name,
                    'location': account.location,
                    'kind': account.kind,
                    'resource_group': account.id.split('/')[4],
                    'consistency_level': account.consistency_policy.default_consistency_level,
                    'enable_multiple_write_locations': account.enable_multiple_write_locations
                })
            
            return {
                "success": True,
                "data": {"cosmos_accounts": accounts, "count": len(accounts)},
                "message": f"Found {len(accounts)} Cosmos DB accounts"
            }
        
        elif action == 'AUDIT':
            issues = []
            
            for account in cosmos_client.database_accounts.list():
                # Check for public network access
                if account.public_network_access == 'Enabled':
                    issues.append({
                        'account': account.name,
                        'issue': 'Public network access enabled',
                        'severity': 'MEDIUM',
                        'recommendation': 'Consider using private endpoints'
                    })
                
                # Check for firewall rules
                if not account.ip_rules or len(account.ip_rules) == 0:
                    issues.append({
                        'account': account.name,
                        'issue': 'No firewall rules configured',
                        'severity': 'HIGH',
                        'recommendation': 'Configure IP firewall rules'
                    })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)}
            }
        
        else:
            return {"success": False, "error": f"Unsupported Cosmos DB action: {action}"}
            
    except Exception as e:
        logger.error(f"Cosmos DB error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# VNET HANDLERS
# ==========================================
def handle_vnet(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Virtual Network operations"""
    try:
        subscription_id = params['subscription_id']
        network_client = NetworkManagementClient(credential, subscription_id)
        
        if action == 'LIST':
            vnets = []
            
            for vnet in network_client.virtual_networks.list_all():
                vnets.append({
                    'name': vnet.name,
                    'location': vnet.location,
                    'resource_group': vnet.id.split('/')[4],
                    'address_space': vnet.address_space.address_prefixes,
                    'subnets': [subnet.name for subnet in vnet.subnets] if vnet.subnets else []
                })
            
            return {
                "success": True,
                "data": {"vnets": vnets, "count": len(vnets)},
                "message": f"Found {len(vnets)} Virtual Networks"
            }
        
        elif action == 'AUDIT':
            issues = []
            
            # Check NSGs (Network Security Groups)
            for nsg in network_client.network_security_groups.list_all():
                for rule in nsg.security_rules:
                    if rule.direction == 'Inbound' and rule.access == 'Allow':
                        if rule.source_address_prefix == '*' or rule.source_address_prefix == 'Internet':
                            port_info = f"{rule.destination_port_range}" if rule.destination_port_range else "multiple ports"
                            issues.append({
                                'nsg': nsg.name,
                                'rule': rule.name,
                                'issue': f'Inbound rule allows traffic from internet on {port_info}',
                                'severity': 'HIGH' if rule.destination_port_range in ['22', '3389', '3306', '5432'] else 'MEDIUM',
                                'recommendation': 'Restrict source to specific IPs'
                            })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} networking security issues"
            }
        
        else:
            return {"success": False, "error": f"Unsupported VNet action: {action}"}
            
    except Exception as e:
        logger.error(f"VNet error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# ENTRA ID (AAD) HANDLERS
# ==========================================
def handle_entra_id(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Entra ID (Azure Active Directory) operations"""
    try:
        from azure.graphrbac import GraphRbacManagementClient
        
        tenant_id = params.get('tenant_id')
        if not tenant_id:
            return {"success": False, "error": "tenant_id required for Entra ID operations"}
        
        # Note: GraphRbac is deprecated, use Microsoft Graph API in production
        graph_client = GraphRbacManagementClient(credential, tenant_id)
        
        if action == 'LIST':
            users = []
            
            for user in graph_client.users.list():
                users.append({
                    'display_name': user.display_name,
                    'user_principal_name': user.user_principal_name,
                    'mail': user.mail,
                    'object_id': user.object_id
                })
            
            return {
                "success": True,
                "data": {"users": users, "count": len(users)},
                "message": f"Found {len(users)} Entra ID users"
            }
        
        elif action == 'AUDIT':
            # Basic audit - for comprehensive audit, use Azure AD Identity Protection
            return {
                "success": True,
                "data": {
                    "note": "For comprehensive Entra ID security audit, use Azure AD Identity Protection and Conditional Access policies"
                }
            }
        
        else:
            return {"success": False, "error": f"Unsupported Entra ID action: {action}"}
            
    except Exception as e:
        logger.error(f"Entra ID error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# AZURE MONITOR HANDLERS
# ==========================================
def handle_monitor(credential, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Azure Monitor operations"""
    try:
        subscription_id = params['subscription_id']
        monitor_client = MonitorManagementClient(credential, subscription_id)
        
        if action == 'LIST':
            alerts = []
            
            for alert in monitor_client.metric_alerts.list_by_subscription():
                alerts.append({
                    'name': alert.name,
                    'location': alert.location,
                    'enabled': alert.enabled,
                    'severity': alert.severity,
                    'resource_group': alert.id.split('/')[4]
                })
            
            return {
                "success": True,
                "data": {"metric_alerts": alerts, "count": len(alerts)},
                "message": f"Found {len(alerts)} metric alerts"
            }
        
        else:
            return {"success": False, "error": f"Unsupported Azure Monitor action: {action}"}
            
    except Exception as e:
        logger.error(f"Azure Monitor error: {str(e)}")
        return {"success": False, "error": str(e)}