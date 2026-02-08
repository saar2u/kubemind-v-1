import type { UnifiedResource, CloudProvider } from './cloud'
import type { Message } from './chat'

export const MOCK_INVENTORY: UnifiedResource[] = [
  {
    id: 'aws-ec2-001',
    name: 'production-web-server',
    type: 'EC2 Instance',
    provider: 'aws' as CloudProvider,
    region: 'us-east-1',
    status: 'running',
    category: 'compute',
    createdAt: '2024-01-15T10:30:00Z',
    cost: 72.5,
    tags: { environment: 'production', team: 'web' }
  },
  {
    id: 'aws-s3-001',
    name: 'user-uploads-bucket',
    type: 'S3 Bucket',
    provider: 'aws' as CloudProvider,
    region: 'us-east-1',
    status: 'running',
    category: 'storage',
    createdAt: '2024-01-10T08:15:00Z',
    cost: 12.3,
    tags: { purpose: 'uploads' }
  },
  {
    id: 'azure-vm-001',
    name: 'dev-test-vm',
    type: 'Virtual Machine',
    provider: 'azure' as CloudProvider,
    region: 'eastus',
    status: 'stopped',
    category: 'compute',
    createdAt: '2024-02-01T14:20:00Z',
    cost: 45.8,
    tags: { environment: 'development' }
  },
  {
    id: 'gcp-bucket-001',
    name: 'backup-storage',
    type: 'Cloud Storage Bucket',
    provider: 'gcp' as CloudProvider,
    region: 'us-central1',
    status: 'running',
    category: 'storage',
    createdAt: '2024-01-25T11:45:00Z',
    cost: 8.75,
    tags: { purpose: 'backups' }
  },
  {
    id: 'aws-rds-001',
    name: 'main-database',
    type: 'RDS PostgreSQL',
    provider: 'aws' as CloudProvider,
    region: 'us-east-1',
    status: 'running',
    category: 'database',
    createdAt: '2024-01-05T09:00:00Z',
    cost: 120.5,
    tags: { environment: 'production', tier: 'primary' }
  },
  {
    id: 'azure-db-001',
    name: 'analytics-db',
    type: 'Azure SQL Database',
    provider: 'azure' as CloudProvider,
    region: 'eastus',
    status: 'running',
    category: 'database',
    createdAt: '2024-02-10T16:30:00Z',
    cost: 85.2,
    tags: { purpose: 'analytics' }
  }
]

export const MOCK_CHAT_HISTORY: Message[] = [
  {
    id: 'msg-001',
    role: 'user',
    content: 'How do I optimize my AWS EC2 costs?',
    timestamp: '2024-02-05T10:30:00Z'
  },
  {
    id: 'msg-002',
    role: 'assistant',
    content: 'Here are several ways to optimize your AWS EC2 costs:\n\n1. **Use Spot Instances** for non-critical workloads (up to 90% savings)\n2. **Right-size your instances** - monitor CPU/memory usage and adjust\n3. **Use Reserved Instances** for predictable workloads (up to 72% savings)\n4. **Enable Auto Scaling** to match capacity with demand\n5. **Delete unused instances** and EBS volumes\n6. **Use Savings Plans** for flexible commitment\n7. **Monitor with Cost Explorer** to identify optimization opportunities\n\nWould you like me to analyze your specific EC2 instances?',
    timestamp: '2024-02-05T10:30:05Z'
  },
  {
    id: 'msg-003',
    role: 'user',
    content: 'What about S3 storage optimization?',
    timestamp: '2024-02-05T10:32:00Z'
  },
  {
    id: 'msg-004',
    role: 'assistant',
    content: 'Great question! Here are S3 cost optimization strategies:\n\n1. **Use S3 Intelligent-Tiering** - automatically moves objects between tiers\n2. **Implement lifecycle policies** - transition to Glacier/Deep Archive for old data\n3. **Enable S3 Transfer Acceleration** only when needed (it costs extra)\n4. **Use S3 Batch Operations** for bulk changes instead of individual API calls\n5. **Monitor and delete incomplete multipart uploads**\n6. **Use S3 Storage Lens** to get organization-wide visibility\n7. **Consider S3 One Zone-IA** for non-critical data (cheaper, single AZ)\n\nWould you like help setting up lifecycle policies for your buckets?',
    timestamp: '2024-02-05T10:32:08Z'
  }
]
