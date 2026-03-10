"""
AWS Handler - Manages all AWS service operations
Supports: EC2, Lambda, S3, RDS, DynamoDB, VPC, IAM, CloudWatch
"""
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any
from datetime import datetime
from utils.logger import setup_logger

logger = setup_logger()


def get_aws_session(credentials: Dict[str, str]) -> boto3.Session:
    """Initialize AWS session with provided credentials"""
    try:
        if not credentials.get('access_key'):
            raise ValueError("AWS access_key is required")
        
        if not credentials.get('secret_key'):
            raise ValueError("AWS secret_key is required")
        
        session = boto3.Session(
            aws_access_key_id=credentials.get('access_key'),
            aws_secret_access_key=credentials.get('secret_key'),
            region_name=credentials.get('region', 'us-east-1')
        )
        return session
    except Exception as e:
        raise Exception(f"Failed to create AWS session: {str(e)}")


def execute_aws_action(action_data: Dict[str, Any], credentials: Dict[str, str]) -> Dict[str, Any]:
    """Main router for AWS actions"""
    try:
        session = get_aws_session(credentials)
        resource_type = action_data.get('resource_type')
        action = action_data.get('action')
        params = action_data.get('parameters', {})
        
        # Route to appropriate handler
        handlers = {
            'EC2': handle_ec2,
            'LAMBDA': handle_lambda,
            'S3': handle_s3,
            'RDS': handle_rds,
            'DYNAMODB': handle_dynamodb,
            'VPC': handle_vpc,
            'IAM': handle_iam,
            'CLOUDWATCH': handle_cloudwatch
        }
        
        handler = handlers.get(resource_type)
        if not handler:
            return {"success": False, "error": f"Unsupported resource type: {resource_type}"}
        
        return handler(session, action, params)
        
    except Exception as e:
        logger.error(f"AWS action error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# EC2 HANDLERS
# ==========================================
def handle_ec2(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle EC2 operations"""
    try:
        region = params.get('region', 'us-east-1')
        ec2 = session.client('ec2', region_name=region)
        
        if action == 'LIST':
            response = ec2.describe_instances()
            instances = []
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    instances.append({
                        'id': instance['InstanceId'],
                        'type': instance['InstanceType'],
                        'state': instance['State']['Name'],
                        'launch_time': str(instance.get('LaunchTime', '')),
                        'private_ip': instance.get('PrivateIpAddress', 'N/A'),
                        'public_ip': instance.get('PublicIpAddress', 'N/A'),
                        'tags': {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
                    })
            return {
                "success": True,
                "data": {"instances": instances, "count": len(instances)},
                "message": f"Found {len(instances)} EC2 instances in {region}"
            }
            
        elif action == 'CREATE':
            # Use provided parameters, default to free-tier Amazon Linux 2023 if missing
            ami_id = params.get('ami', 'ami-0c101f26f147fa7fd') 
            instance_type = params.get('type', 't2.micro')
            
            response = ec2.run_instances(
                ImageId=ami_id,
                InstanceType=instance_type,
                MinCount=1,
                MaxCount=1
            )
            instance_id = response['Instances'][0]['InstanceId']
            return {
                "success": True, 
                "data": {"id": instance_id, "status": "Pending"}, 
                "message": f"Successfully launched EC2 instance {instance_id}."
            }
            
        elif action == 'DELETE':
            instance_id = params.get('id')
            if not instance_id:
                return {"success": False, "error": "Instance ID required for deletion."}
            
            ec2.terminate_instances(InstanceIds=[instance_id])
            return {
                "success": True, 
                "data": {"id": instance_id, "status": "Shutting-down"}, 
                "message": f"Successfully initiated termination for EC2 instance {instance_id}."
            }
        
        elif action == 'DESCRIBE':
            instance_id = params.get('id')
            if not instance_id:
                return {"success": False, "error": "Instance ID required"}
            
            response = ec2.describe_instances(InstanceIds=[instance_id])
            if not response['Reservations']:
                return {"success": False, "error": f"Instance {instance_id} not found"}
            
            instance = response['Reservations'][0]['Instances'][0]
            return {
                "success": True,
                "data": {
                    'id': instance['InstanceId'],
                    'type': instance['InstanceType'],
                    'state': instance['State']['Name'],
                    'ami': instance['ImageId'],
                    'vpc_id': instance.get('VpcId'),
                    'subnet_id': instance.get('SubnetId'),
                    'private_ip': instance.get('PrivateIpAddress'),
                    'public_ip': instance.get('PublicIpAddress'),
                    'security_groups': [sg['GroupName'] for sg in instance.get('SecurityGroups', [])],
                    'tags': {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
                }
            }
        
        elif action == 'START':
            instance_id = params.get('id')
            if not instance_id:
                return {"success": False, "error": "Instance ID required"}
            
            ec2.start_instances(InstanceIds=[instance_id])
            return {"success": True, "message": f"Started instance {instance_id}"}
        
        elif action == 'STOP':
            instance_id = params.get('id')
            if not instance_id:
                return {"success": False, "error": "Instance ID required"}
            
            ec2.stop_instances(InstanceIds=[instance_id])
            return {"success": True, "message": f"Stopped instance {instance_id}"}
        
        elif action == 'AUDIT':
            response = ec2.describe_instances()
            issues = []
            
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    if instance.get('PublicIpAddress'):
                        issues.append({
                            'instance_id': instance['InstanceId'],
                            'issue': 'Instance has public IP address',
                            'severity': 'MEDIUM',
                            'recommendation': 'Consider using NAT Gateway or VPN'
                        })
                    for bdm in instance.get('BlockDeviceMappings', []):
                        if 'Ebs' in bdm and not bdm['Ebs'].get('Encrypted', False):
                            issues.append({
                                'instance_id': instance['InstanceId'],
                                'issue': 'Unencrypted EBS volume',
                                'severity': 'HIGH',
                                'recommendation': 'Enable EBS encryption'
                            })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} security issues"
            }
        
        elif action == 'COST':
            response = ec2.describe_instances()
            total_instances = sum(len(r['Instances']) for r in response['Reservations'])
            estimated_monthly_cost = total_instances * 50  # ~$50 per t3.medium/month
            
            return {
                "success": True,
                "data": {
                    "total_instances": total_instances,
                    "estimated_monthly_cost_usd": estimated_monthly_cost,
                    "note": "This is a rough estimate. Use AWS Cost Explorer for accurate costs."
                }
            }
        
        else:
            return {"success": False, "error": f"Unsupported EC2 action: {action}"}
            
    except ClientError as e:
        logger.error(f"EC2 error: {str(e)}")
        return {"success": False, "error": str(e)}


# ==========================================
# LAMBDA HANDLERS
# ==========================================
def handle_lambda(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle Lambda operations"""
    try:
        region = params.get('region', 'us-east-1')
        lambda_client = session.client('lambda', region_name=region)
        
        if action == 'LIST':
            response = lambda_client.list_functions()
            functions = []
            for func in response['Functions']:
                functions.append({
                    'name': func['FunctionName'],
                    'runtime': func['Runtime'],
                    'memory': func['MemorySize'],
                    'timeout': func['Timeout'],
                    'last_modified': func['LastModified'],
                    'handler': func['Handler']
                })
            return {
                "success": True,
                "data": {"functions": functions, "count": len(functions)},
                "message": f"Found {len(functions)} Lambda functions"
            }
        
        elif action == 'DESCRIBE':
            func_name = params.get('name')
            if not func_name:
                return {"success": False, "error": "Function name required"}
            
            response = lambda_client.get_function(FunctionName=func_name)
            config = response['Configuration']
            
            return {
                "success": True,
                "data": {
                    'name': config['FunctionName'],
                    'arn': config['FunctionArn'],
                    'runtime': config['Runtime'],
                    'handler': config['Handler'],
                    'memory': config['MemorySize'],
                    'timeout': config['Timeout'],
                    'role': config['Role'],
                    'environment': config.get('Environment', {}).get('Variables', {})
                }
            }
        
        elif action == 'AUDIT':
            response = lambda_client.list_functions()
            issues = []
            
            for func in response['Functions']:
                if func['Timeout'] > 300:
                    issues.append({
                        'function': func['FunctionName'],
                        'issue': f'Timeout set to {func["Timeout"]}s (high)',
                        'severity': 'LOW',
                        'recommendation': 'Review if long timeout is necessary'
                    })
                deprecated_runtimes = ['python3.6', 'python3.7', 'nodejs12.x', 'nodejs10.x']
                if func['Runtime'] in deprecated_runtimes:
                    issues.append({
                        'function': func['FunctionName'],
                        'issue': f'Using deprecated runtime {func["Runtime"]}',
                        'severity': 'HIGH',
                        'recommendation': 'Upgrade to a supported runtime version'
                    })
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)}
            }
        
        else:
            return {"success": False, "error": f"Unsupported Lambda action: {action}"}
            
    except ClientError as e:
        return {"success": False, "error": str(e)}


# ==========================================
# S3 HANDLERS
# ==========================================
def handle_s3(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle S3 operations"""
    try:
        s3 = session.client('s3')
        
        if action == 'LIST':
            response = s3.list_buckets()
            buckets = []
            for bucket in response['Buckets']:
                try:
                    location = s3.get_bucket_location(Bucket=bucket['Name'])
                    region = location['LocationConstraint'] or 'us-east-1'
                except:
                    region = 'unknown'
                
                buckets.append({
                    'name': bucket['Name'],
                    'created': str(bucket['CreationDate']),
                    'region': region
                })
            
            return {
                "success": True,
                "data": {"buckets": buckets, "count": len(buckets)},
                "message": f"Found {len(buckets)} S3 buckets"
            }
            
        elif action == 'CREATE':
            bucket_name = params.get('name') or params.get('bucket')
            if not bucket_name:
                return {"success": False, "error": "Bucket name is required."}
            
            region = session.region_name
            if region == 'us-east-1':
                s3.create_bucket(Bucket=bucket_name)
            else:
                s3.create_bucket(
                    Bucket=bucket_name, 
                    CreateBucketConfiguration={'LocationConstraint': region}
                )
                
            return {
                "success": True, 
                "data": {"name": bucket_name, "status": "Created"}, 
                "message": f"Successfully created S3 bucket '{bucket_name}' in {region}."
            }
            
        elif action == 'DELETE':
            bucket_name = params.get('name') or params.get('bucket')
            if not bucket_name:
                return {"success": False, "error": "Bucket name is required for deletion."}
            
            s3.delete_bucket(Bucket=bucket_name)
            return {
                "success": True, 
                "data": {"name": bucket_name, "status": "Deleted"}, 
                "message": f"Successfully deleted S3 bucket '{bucket_name}'."
            }
        
        elif action == 'AUDIT':
            response = s3.list_buckets()
            issues = []
            
            for bucket in response['Buckets']:
                bucket_name = bucket['Name']
                try:
                    acl = s3.get_bucket_acl(Bucket=bucket_name)
                    for grant in acl['Grants']:
                        if grant['Grantee'].get('URI') == 'http://acs.amazonaws.com/groups/global/AllUsers':
                            issues.append({
                                'bucket': bucket_name,
                                'issue': 'Bucket allows public access',
                                'severity': 'CRITICAL',
                                'recommendation': 'Restrict public access immediately'
                            })
                    try:
                        s3.get_bucket_encryption(Bucket=bucket_name)
                    except ClientError as e:
                        if e.response['Error']['Code'] == 'ServerSideEncryptionConfigurationNotFoundError':
                            issues.append({
                                'bucket': bucket_name,
                                'issue': 'Encryption not enabled',
                                'severity': 'HIGH',
                                'recommendation': 'Enable default encryption'
                            })
                    versioning = s3.get_bucket_versioning(Bucket=bucket_name)
                    if versioning.get('Status') != 'Enabled':
                        issues.append({
                            'bucket': bucket_name,
                            'issue': 'Versioning not enabled',
                            'severity': 'MEDIUM',
                            'recommendation': 'Enable versioning for data protection'
                        })
                except Exception as e:
                    logger.warning(f"Could not audit bucket {bucket_name}: {str(e)}")
            
            return {
                "success": True,
                "data": {"issues": issues, "total_issues": len(issues)},
                "message": f"Found {len(issues)} security issues in S3 buckets"
            }
        
        else:
            return {"success": False, "error": f"Unsupported S3 action: {action}"}
            
    except ClientError as e:
        return {"success": False, "error": str(e)}


# ==========================================
# RDS HANDLERS
# ==========================================
def handle_rds(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle RDS operations"""
    try:
        region = params.get('region', 'us-east-1')
        rds = session.client('rds', region_name=region)
        
        if action == 'LIST':
            response = rds.describe_db_instances()
            databases = []
            for db in response['DBInstances']:
                databases.append({
                    'id': db['DBInstanceIdentifier'],
                    'engine': db['Engine'],
                    'version': db['EngineVersion'],
                    'status': db['DBInstanceStatus'],
                    'size': db['DBInstanceClass'],
                    'storage': db['AllocatedStorage'],
                    'multi_az': db['MultiAZ'],
                    'endpoint': db.get('Endpoint', {}).get('Address', 'N/A')
                })
            return {"success": True, "data": {"databases": databases, "count": len(databases)}, "message": f"Found {len(databases)} RDS databases"}
        
        elif action == 'START':
            db_id = params.get('id')
            rds.start_db_instance(DBInstanceIdentifier=db_id)
            return {"success": True, "message": f"Starting database {db_id}"}
        
        elif action == 'STOP':
            db_id = params.get('id')
            rds.stop_db_instance(DBInstanceIdentifier=db_id)
            return {"success": True, "message": f"Stopping database {db_id}"}
        
        elif action == 'AUDIT':
            response = rds.describe_db_instances()
            issues = []
            for db in response['DBInstances']:
                if db.get('PubliclyAccessible'):
                    issues.append({'database': db['DBInstanceIdentifier'], 'issue': 'Database is publicly accessible', 'severity': 'CRITICAL', 'recommendation': 'Disable public access'})
                if not db.get('StorageEncrypted'):
                    issues.append({'database': db['DBInstanceIdentifier'], 'issue': 'Storage encryption not enabled', 'severity': 'HIGH', 'recommendation': 'Enable encryption at rest'})
            return {"success": True, "data": {"issues": issues, "total_issues": len(issues)}}
        
        else:
            return {"success": False, "error": f"Unsupported RDS action: {action}"}
            
    except ClientError as e:
        return {"success": False, "error": str(e)}


# ==========================================
# DYNAMODB HANDLERS
# ==========================================
def handle_dynamodb(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle DynamoDB operations"""
    try:
        region = params.get('region', 'us-east-1')
        dynamodb = session.client('dynamodb', region_name=region)
        
        if action == 'LIST':
            response = dynamodb.list_tables()
            tables = response.get('TableNames', [])
            table_details = []
            for table_name in tables:
                try:
                    table_info = dynamodb.describe_table(TableName=table_name)
                    table = table_info['Table']
                    table_details.append({
                        'name': table['TableName'],
                        'status': table['TableStatus'],
                        'item_count': table.get('ItemCount', 0),
                        'size_bytes': table.get('TableSizeBytes', 0),
                        'created': str(table.get('CreationDateTime', ''))
                    })
                except:
                    table_details.append({'name': table_name, 'status': 'unknown'})
            return {"success": True, "data": {"tables": table_details, "count": len(tables)}, "message": f"Found {len(tables)} DynamoDB tables"}
        
        elif action == 'AUDIT':
            response = dynamodb.list_tables()
            issues = []
            for table_name in response.get('TableNames', []):
                try:
                    table_info = dynamodb.describe_table(TableName=table_name)
                    recovery = dynamodb.describe_continuous_backups(TableName=table_name)
                    if recovery['ContinuousBackupsDescription']['PointInTimeRecoveryDescription']['PointInTimeRecoveryStatus'] != 'ENABLED':
                        issues.append({'table': table_name, 'issue': 'Point-in-time recovery not enabled', 'severity': 'MEDIUM', 'recommendation': 'Enable PITR for data protection'})
                except Exception as e:
                    logger.warning(f"Could not audit table {table_name}: {str(e)}")
            return {"success": True, "data": {"issues": issues, "total_issues": len(issues)}}
        
        else:
            return {"success": False, "error": f"Unsupported DynamoDB action: {action}"}
            
    except ClientError as e:
        return {"success": False, "error": str(e)}


# ==========================================
# VPC HANDLERS
# ==========================================
def handle_vpc(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle VPC operations"""
    try:
        region = params.get('region', 'us-east-1')
        ec2 = session.client('ec2', region_name=region)
        
        if action == 'LIST':
            response = ec2.describe_vpcs()
            vpcs = []
            for vpc in response['Vpcs']:
                vpcs.append({
                    'id': vpc['VpcId'],
                    'cidr': vpc['CidrBlock'],
                    'is_default': vpc['IsDefault'],
                    'state': vpc['State'],
                    'tags': {tag['Key']: tag['Value'] for tag in vpc.get('Tags', [])}
                })
            return {"success": True, "data": {"vpcs": vpcs, "count": len(vpcs)}, "message": f"Found {len(vpcs)} VPCs"}
        
        elif action == 'AUDIT':
            response = ec2.describe_security_groups()
            issues = []
            for sg in response['SecurityGroups']:
                for rule in sg.get('IpPermissions', []):
                    for ip_range in rule.get('IpRanges', []):
                        if ip_range.get('CidrIp') == '0.0.0.0/0':
                            port = rule.get('FromPort', 'ALL')
                            issues.append({
                                'security_group': sg['GroupId'],
                                'group_name': sg['GroupName'],
                                'issue': f'Port {port} open to internet (0.0.0.0/0)',
                                'severity': 'HIGH' if port in [22, 3389, 3306, 5432] else 'MEDIUM',
                                'recommendation': 'Restrict to specific IPs'
                            })
            return {"success": True, "data": {"issues": issues, "total_issues": len(issues)}, "message": f"Found {len(issues)} networking security issues"}
        
        else:
            return {"success": False, "error": f"Unsupported VPC action: {action}"}
            
    except ClientError as e:
        return {"success": False, "error": str(e)}


# ==========================================
# IAM HANDLERS
# ==========================================
def handle_iam(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle IAM operations"""
    try:
        iam = session.client('iam')
        
        if action == 'LIST':
            response = iam.list_users()
            users = []
            for user in response['Users']:
                users.append({
                    'username': user['UserName'],
                    'user_id': user['UserId'],
                    'arn': user['Arn'],
                    'created': str(user['CreateDate'])
                })
            return {"success": True, "data": {"users": users, "count": len(users)}, "message": f"Found {len(users)} IAM users"}
        
        elif action == 'AUDIT':
            response = iam.list_users()
            issues = []
            for user in response['Users']:
                username = user['UserName']
                try:
                    mfa_devices = iam.list_mfa_devices(UserName=username)
                    if not mfa_devices['MFADevices']:
                        issues.append({'user': username, 'issue': 'MFA not enabled', 'severity': 'HIGH', 'recommendation': 'Enable MFA for enhanced security'})
                except: pass
            return {"success": True, "data": {"issues": issues, "total_issues": len(issues)}, "message": f"Found {len(issues)} IAM security issues"}
        
        else:
            return {"success": False, "error": f"Unsupported IAM action: {action}"}
            
    except ClientError as e:
        return {"success": False, "error": str(e)}


# ==========================================
# CLOUDWATCH HANDLERS
# ==========================================
def handle_cloudwatch(session: boto3.Session, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Handle CloudWatch operations"""
    try:
        region = params.get('region', 'us-east-1')
        cloudwatch = session.client('cloudwatch', region_name=region)
        
        if action == 'LIST':
            response = cloudwatch.describe_alarms()
            alarms = []
            for alarm in response.get('MetricAlarms', []):
                alarms.append({
                    'name': alarm['AlarmName'],
                    'state': alarm['StateValue'],
                    'metric': alarm['MetricName'],
                    'namespace': alarm['Namespace'],
                    'threshold': alarm['Threshold'],
                    'comparison': alarm['ComparisonOperator']
                })
            return {"success": True, "data": {"alarms": alarms, "count": len(alarms)}, "message": f"Found {len(alarms)} CloudWatch alarms"}
        else:
            return {"success": False, "error": f"Unsupported CloudWatch action: {action}"}
            
    except ClientError as e:
        return {"success": False, "error": str(e)}