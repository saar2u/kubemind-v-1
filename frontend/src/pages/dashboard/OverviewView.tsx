import React, { useState, useEffect, useMemo } from 'react';
import { Server, Database, Cloud, RefreshCw, AlertCircle, Fingerprint, Filter, Search, DollarSign, TrendingUp, PieChart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

type CloudProvider = 'All Clouds' | 'AWS' | 'Azure' | 'GCP';
type Tab = 'resources' | 'billing' | 'optimization';

interface Resource { id: string; provider: string; type: string; status: string; region: string; accountId: string; }

interface BillingData {
  total_spend: number;
  providers: { AWS: number; GCP: number; Azure: number; };
  history: { month: string; spend: number; }[];
}

export default function OverviewView() {
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('All Clouds');
  const [activeTab, setActiveTab] = useState<Tab>('resources');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ activeCompute: 0, totalResources: 0 });
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [accountFilter, setAccountFilter] = useState('All');

  const userName = localStorage.getItem('kubemind-user-name')?.split(' ')[0] || 'User';

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const userId = localStorage.getItem('kubemind-user-email') || 'default_user';
      
      // Fetch Resources
      const resResponse = await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/dashboard', { headers: { 'x_user_id': userId } });
      if (resResponse.ok) {
        const data = await resResponse.json();
        setRecentResources(data.resources || []);
        if (data.stats) {
          setDashboardStats({ activeCompute: data.stats.active_instances || 0, totalResources: (data.resources || []).length });
        }
      }

      // Fetch Billing
      const billResponse = await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/billing', { headers: { 'x_user_id': userId } });
      if (billResponse.ok) {
        const billData = await billResponse.json();
        setBillingData(billData);
      }

    } catch (err: any) {
      setError("Unable to connect to backend. Please ensure your API keys are saved and valid.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // Dynamic Dropdown Options
  const uniqueStatuses = useMemo(() => ['All', ...new Set(recentResources.map(r => r.status))], [recentResources]);
  const uniqueRegions = useMemo(() => ['All', ...new Set(recentResources.map(r => r.region))], [recentResources]);
  const uniqueTypes = useMemo(() => ['All', ...new Set(recentResources.map(r => r.type))], [recentResources]);
  const uniqueAccounts = useMemo(() => ['All', ...new Set(recentResources.map(r => r.accountId))], [recentResources]);

  // Filtering Logic
  const filteredResources = recentResources.filter(r => {
    const matchCloud = selectedCloud === 'All Clouds' || r.provider === selectedCloud;
    const matchSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchRegion = regionFilter === 'All' || r.region === regionFilter;
    const matchType = typeFilter === 'All' || r.type === typeFilter;
    const matchAccount = accountFilter === 'All' || r.accountId === accountFilter;
    return matchCloud && matchSearch && matchStatus && matchRegion && matchType && matchAccount;
  });

  const stats = [
    { icon: Cloud, color: 'bg-emerald-500', value: dashboardStats.totalResources.toString(), label: 'Total Connected Resources' },
    { icon: Server, color: 'bg-[#00D4FF]', value: dashboardStats.activeCompute.toString(), label: 'Active Compute Instances' },
    { icon: DollarSign, color: 'bg-[#8B5CF6]', value: `$${billingData?.total_spend || '0.00'}`, label: 'Month-to-Date Spend' }
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Welcome {userName}! 👋</h1>
          <p className="text-slate-500">View your multi-cloud resources and infrastructure.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <select value={selectedCloud} onChange={(e) => setSelectedCloud(e.target.value as CloudProvider)} className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00D4FF] cursor-pointer shadow-sm">
              <option value="All Clouds">All Clouds</option>
              <option value="AWS">AWS Only</option>
              <option value="Azure">Azure Only</option>
              <option value="GCP">GCP Only</option>
            </select>
            <Cloud className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          </div>
          <button onClick={fetchDashboardData} disabled={isRefreshing} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#00D4FF] rounded-lg transition-colors shadow-sm">
            <RefreshCw className={`w-5 h-5 text-slate-600 transition-colors ${isRefreshing ? 'animate-spin text-[#00D4FF]' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl flex items-center gap-3 text-sm font-bold">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
        {[{ id: 'resources', label: 'Resources' }, { id: 'billing', label: 'FinOps Billing' }, { id: 'optimization', label: 'Security & Audit' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`px-6 py-3 font-medium text-sm transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'border-[#00D4FF] text-[#00D4FF]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-inner ${stat.color}`}><stat.icon size={24} /></div>
            <div>
              <h3 className="text-2xl font-bold text-[#0F172A]">{stat.value}</h3>
              <span className="text-xs text-slate-500 truncate max-w-[150px]">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* --- RESOURCES TAB --- */}
      {activeTab === 'resources' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-xl font-bold text-[#0F172A]">Active Resources <span className="text-slate-400 text-sm font-normal ml-2">({filteredResources.length})</span></h2>
          </div>
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-center">
            <div className="flex items-center text-sm font-bold text-slate-600 mr-2"><Filter size={16} className="mr-2"/> Filters:</div>
            <div className="relative flex-1 min-w-[200px] max-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Search Resource Name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#00D4FF] text-sm text-[#0F172A]" />
            </div>
            <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#00D4FF]">
              {uniqueAccounts.map(a => <option key={a} value={a}>{a === 'All' ? 'All Accounts' : a}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#00D4FF]">
              {uniqueTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#00D4FF]">
              {uniqueRegions.map(r => <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-[#00D4FF]">
              {uniqueStatuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="py-3 px-6 text-sm font-semibold text-slate-500">Resource Name</th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-500">Provider</th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5"><Fingerprint size={14}/> Account ID</th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-500">Type</th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-500">Region</th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((res, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-mono text-sm text-[#00D4FF] max-w-[200px] truncate">{res.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      <span className={`px-2 py-1 rounded text-xs ${res.provider === 'AWS' ? 'bg-amber-50 text-amber-600' : res.provider === 'GCP' ? 'bg-blue-50 text-blue-600' : 'bg-sky-50 text-sky-600'}`}>{res.provider}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-500 max-w-[150px] truncate">{res.accountId}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm whitespace-nowrap">{res.type}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{res.region}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${res.status === 'Running' || res.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : res.status === 'Stopped' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'}`}>{res.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* --- FINOPS BILLING TAB --- */}
      {activeTab === 'billing' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cost Breakdown by Provider */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0F172A]">Cost by Provider</h2>
                <PieChart className="text-slate-400 w-5 h-5" />
              </div>
              
              <div className="space-y-5">
                {billingData && Object.entries(billingData.providers).map(([provider, cost]) => {
                  const percentage = billingData.total_spend > 0 ? (cost / billingData.total_spend) * 100 : 0;
                  const colorClass = provider === 'AWS' ? 'bg-amber-400' : provider === 'GCP' ? 'bg-blue-400' : 'bg-sky-400';
                  
                  return (
                    <div key={provider}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-slate-700">{provider}</span>
                        <span className="font-bold text-[#0F172A]">${cost.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {!billingData && <div className="text-center text-sm text-slate-400 py-4">Loading FinOps data...</div>}
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#0F172A]">Spend Trend (Last 3 Months)</h2>
                <TrendingUp className="text-slate-400 w-5 h-5" />
              </div>
              
              <div className="h-48 flex items-end justify-between gap-4 pt-4">
                {billingData?.history.map((data, idx) => {
                  const maxSpend = Math.max(...billingData.history.map(h => h.spend), 1);
                  const heightPercent = (data.spend / maxSpend) * 100;
                  
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 gap-2 group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded font-bold">
                        ${data.spend.toFixed(2)}
                      </div>
                      <div className="w-full max-w-[80px] bg-[#00D4FF] rounded-t-lg transition-all duration-500 ease-out" style={{ height: `${Math.max(heightPercent, 5)}%` }}></div>
                      <span className="text-sm font-semibold text-slate-500">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </motion.div>
      )}

      {/* Security & Audit Tab placeholder */}
      {activeTab === 'optimization' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Security & Audit Engine</h2>
          <p className="text-slate-500 max-w-md mx-auto">This module will scan your infrastructure for vulnerabilities like public S3 buckets, open security groups, and unencrypted volumes.</p>
        </motion.div>
      )}
    </div>
  );
}