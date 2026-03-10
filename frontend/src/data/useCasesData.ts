export interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: string;
  exampleCommand: string;
  modalContent: {
    problem: string;
    solutionSteps: string[];
    expectedOutput: string;
  };
}

export const useCases: UseCase[] = [
  {
    id: "incident-response",
    title: "Auto-Resolve Production Alerts",
    description: "When latency spikes, Kubemind identifies the bottleneck, scales resources, and notifies your team — all in natural language.",
    icon: "BellRing", 
    exampleCommand: "Fix the slow API endpoint in production",
    modalContent: {
      problem: "Engineers lose hours digging through logs and dashboards during high-stress production outages.",
      solutionSteps: [
        "Analyzes CloudWatch/Datadog metrics automatically.",
        "Identifies the root cause (e.g., CPU bottleneck on EC2).",
        "Executes remediation (e.g., scaling up instance size or adding auto-scaling rules)."
      ],
      expectedOutput: "✅ Scaled target group `api-prod` from 2 to 4 instances. Latency returning to baseline."
    }
  },
  {
    id: "cost-optimization",
    title: "Find & Eliminate Waste",
    description: "Ask Kubemind to audit your cloud spend. It finds idle resources, oversized instances, and unused storage — then suggests actions.",
    icon: "Coins",
    exampleCommand: "Show me resources costing >$100/month with <5% utilization",
    modalContent: {
      problem: "Cloud bills creep up due to forgotten dev environments, unattached volumes, and oversized instances.",
      solutionSteps: [
        "Scans all regions for unattached EBS volumes and idle EC2s.",
        "Calculates potential monthly savings.",
        "Generates a termination plan for approval."
      ],
      expectedOutput: "✅ Found 3 idle instances and 5 unattached volumes. Potential savings: $450/mo. Type 'Proceed' to clean up."
    }
  },
  {
    id: "security-audits",
    title: "Continuous Compliance",
    description: "Ensure S3 buckets aren't public, IAM roles follow least privilege, and encryption is enforced — automatically.",
    icon: "Shield",
    exampleCommand: "Check all storage buckets for public access across AWS and GCP",
    modalContent: {
      problem: "Misconfigured cloud storage and overly permissive IAM roles are the #1 cause of data breaches.",
      solutionSteps: [
        "Scans AWS S3 and GCP Cloud Storage ACLs.",
        "Flags buckets with public read/write access.",
        "Automatically generates IAM policies to restrict access."
      ],
      expectedOutput: "⚠️ Found 1 public bucket: `dev-backup-99`. ✅ Applied block-public-access policy."
    }
  },
  {
    id: "multi-cloud",
    title: "Unify AWS, Azure, GCP",
    description: "Stop context-switching. Ask Kubemind to compare resources, sync configs, or migrate workloads across clouds.",
    icon: "Network",
    exampleCommand: "List all VMs running Ubuntu 20.04 across my cloud accounts",
    modalContent: {
      problem: "Managing multiple clouds requires learning 3 different CLIs, 3 consoles, and 3 sets of IAM rules.",
      solutionSteps: [
        "Connects to all cloud providers via native SDKs.",
        "Normalizes data into a single, unified view.",
        "Translates generic commands into cloud-specific API calls."
      ],
      expectedOutput: "✅ Found 12 Ubuntu 20.04 VMs: 8 on AWS (EC2), 3 on GCP (Compute Engine), 1 on Azure."
    }
  },
  {
    id: "developer-self-service",
    title: "Empower Developers",
    description: "Let devs ask for resources in plain English. Kubemind enforces guardrails while executing approved actions.",
    icon: "TerminalSquare",
    exampleCommand: "Create a dev environment with 2 vCPUs, 8GB RAM, and PostgreSQL",
    modalContent: {
      problem: "DevOps becomes a bottleneck when developers have to open Jira tickets just to spin up a testing database.",
      solutionSteps: [
        "Parses natural language request into infrastructure specs.",
        "Checks request against organizational quota and budget guardrails.",
        "Provisions resources via Terraform/SDK and returns credentials."
      ],
      expectedOutput: "✅ Provisioned `t3.large` instance and RDS Postgres. Connection string sent to your secure vault."
    }
  },
  {
    id: "ai-workloads",
    title: "Optimize AI Infrastructure",
    description: "Manage GPU instances, monitor model inference costs, and auto-scale training jobs — all via chat.",
    icon: "Cpu",
    exampleCommand: "Scale down GPU instances after 8 PM to save costs",
    modalContent: {
      problem: "Leaving powerful GPU instances (like p4d.24xlarge) running idly overnight burns thousands of dollars.",
      solutionSteps: [
        "Identifies active GPU nodes and their utilization.",
        "Creates scheduled cron jobs or auto-scaling down rules.",
        "Alerts the team via Slack/Teams before shutdown."
      ],
      expectedOutput: "✅ Scheduled graceful shutdown for 4x A100 GPU instances at 20:00 PST."
    }
  }
];
