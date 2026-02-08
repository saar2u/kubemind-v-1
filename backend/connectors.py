import boto3
from azure.identity import ClientSecretCredential
from azure.mgmt.compute import ComputeManagementClient
from azure.mgmt.resource import ResourceManagementClient
from botocore.exceptions import ClientError

class CloudConnector:
    @staticmethod
    def get_aws_inventory(access_key: str, secret_key: str, region: str = "us-east-1"):
        """Fetches EC2 instances from a real AWS account."""
        resources = []
        try:
            # Initialize AWS Client (Stateless - keys are used only here)
            ec2 = boto3.client(
                'ec2',
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region
            )

            # Fetch Instances
            response = ec2.describe_instances()
            
            for reservation in response.get('Reservations', []):
                for instance in reservation.get('Instances', []):
                    # Extract Name Tag
                    name = "Unknown Instance"
                    for tag in instance.get('Tags', []):
                        if tag['Key'] == 'Name':
                            name = tag['Value']

                    resources.append({
                        "id": instance['InstanceId'],
                        "name": name,
                        "type": instance['InstanceType'],
                        "provider": "aws",
                        "region": region,
                        "status": instance['State']['Name'],
                        "cost": 0.0  # Real cost requires Cost Explorer API (separate permission)
                    })
            return resources
        except ClientError as e:
            print(f"AWS Error: {e}")
            raise Exception(f"AWS Connection Failed: {e}")

    @staticmethod
    def get_azure_inventory(tenant_id: str, client_id: str, client_secret: str, subscription_id: str):
        """Fetches VMs from a real Azure subscription."""
        resources = []
        try:
            # Authenticate
            credential = ClientSecretCredential(
                tenant_id=tenant_id,
                client_id=client_id,
                client_secret=client_secret
            )
            
            compute_client = ComputeManagementClient(credential, subscription_id)

            # List all VMs
            vms = compute_client.virtual_machines.list_all()
            
            for vm in vms:
                resources.append({
                    "id": vm.name,
                    "name": vm.name,
                    "type": vm.hardware_profile.vm_size if vm.hardware_profile else "Unknown",
                    "provider": "azure",
                    "region": vm.location,
                    "status": "active", # Azure requires deeper query for instance view status
                    "cost": 0.0
                })
            return resources
        except Exception as e:
            print(f"Azure Error: {e}")
            raise Exception(f"Azure Connection Failed: {str(e)}")
