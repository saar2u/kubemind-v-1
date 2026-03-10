import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Trash2, Edit2, Cloud, AlertCircle, Save, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Provider = 'AWS' | 'Azure' | 'GCP';

interface Connection {
  id: string;
  provider: Provider;
  title: string;
  subtitle: string;
  connectedAt: string;
}

export default function ConnectionsView() {
  const userId = localStorage.getItem('kubemind-user-email') || 'default_user';
  const storageKey = `kubemind-connections-${userId}`;

  const [activeTab, setActiveTab] = useState<Provider>('AWS');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // State for the Update Modal
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  // Forms State
  const [awsForm, setAwsForm] = useState({ accessKey: '', secretKey: '', region: 'us-east-1' });
  const [azureForm, setAzureForm] = useState({ tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });
  const [gcpForm, setGcpForm] = useState({ projectId: '', jsonKey: '' });

  // 1. Initialize connections from Local Storage to fix disappearing issue
  const [connections, setConnections] = useState<Connection[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Auto-save connections to Local Storage whenever the list changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(connections));
  }, [connections, storageKey]);

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  // --- SAVE & UPDATE HANDLERS ---
  const processConnection = (provider: Provider, title: string, subtitle: string, isUpdate: boolean) => {
    const newConn = { id: `${provider.toLowerCase()}-${Date.now()}`, provider, title, subtitle, connectedAt: new Date().toLocaleDateString() };
    
    setConnections(prev => {
      const filtered = prev.filter(c => c.provider !== provider);
      return [...filtered, newConn];
    });

    setMessage({ type: 'success', text: `${provider} credentials ${isUpdate ? 'updated' : 'saved'} securely.` });
    setEditingProvider(null); // Close modal if open
  };

  const handleSaveAWS = async (e: React.FormEvent, isUpdate = false) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/connect/aws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x_user_id': userId },
        body: JSON.stringify({ access_key: awsForm.accessKey, secret_key: awsForm.secretKey, region: awsForm.region })
      });

      if (response.ok) {
        processConnection('AWS', `AWS (${awsForm.region})`, `Key: ${awsForm.accessKey.substring(0, 6)}...`, isUpdate);
        setAwsForm({ accessKey: '', secretKey: '', region: 'us-east-1' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save AWS credentials.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error.' });
    } finally {
      setLoading(false);
      clearMessage();
    }
  };

  const handleSaveAzure = async (e: React.FormEvent, isUpdate = false) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setTimeout(() => {
      processConnection('Azure', 'Azure Subscription', `Sub ID: ${azureForm.subscriptionId.substring(0, 8)}...`, isUpdate);
      setAzureForm({ tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });
      setLoading(false);
      clearMessage();
    }, 1000);
  };

  const handleSaveGCP = async (e: React.FormEvent, isUpdate = false) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setTimeout(() => {
      processConnection('GCP', 'GCP Project', `Project: ${gcpForm.projectId}`, isUpdate);
      setGcpForm({ projectId: '', jsonKey: '' });
      setLoading(false);
      clearMessage();
    }, 1000);
  };

  // --- ACTIONS ---
  const handleDisconnect = async (id: string, provider: Provider) => {
    if(!window.confirm(`Are you sure you want to disconnect ${provider}? Agent Kube will lose access.`)) return;
    
    if (provider === 'AWS') {
      try {
        await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/connect/aws', {
          method: 'DELETE',
          headers: { 'x_user_id': userId }
        });
      } catch (e) { console.error(e); }
    }
    
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const openEditModal = (provider: Provider) => {
    // Clear forms before opening so old keys aren't visible
    setAwsForm({ accessKey: '', secretKey: '', region: 'us-east-1' });
    setAzureForm({ tenantId: '', clientId: '', clientSecret: '', subscriptionId: '' });
    setGcpForm({ projectId: '', jsonKey: '' });
    setEditingProvider(provider);
  };

  const getBrandColor = (provider: Provider) => {
    switch(provider) {
      case 'AWS': return 'text-[#FF9900] bg-orange-50 border-orange-100';
      case 'Azure': return 'text-[#0089D6] bg-blue-50 border-blue-100';
      case 'GCP': return 'text-[#00C896] bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-12 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2 flex items-center gap-3">
          <Key className="text-[#00D4FF]" /> Cloud Connections
        </h1>
        <p className="text-slate-500">Connect your cloud platforms securely to enable autonomous management.</p>
      </div>

      {/* --- SUCCESS/ERROR MESSAGES (Global) --- */}
      <AnimatePresence>
        {message && !editingProvider && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
            <div className={`p-4 rounded-xl flex items-center gap-3 font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' : 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD CONNECTION CARD --- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Cloud size={20} className="text-slate-400" />
          <h2 className="text-lg font-bold text-[#0F172A]">Add New Connection</h2>
        </div>

        <div className="flex px-6 pt-4 gap-2 border-b border-slate-100">
          {(['AWS', 'Azure', 'GCP'] as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === p ? 'border-[#00D4FF] text-[#00D4FF]' : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              
              {/* MAIN AWS FORM */}
              {activeTab === 'AWS' && (
                <form onSubmit={(e) => handleSaveAWS(e, false)} className="space-y-5">
                  <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl flex gap-3 items-start border border-blue-100">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-blue-600" />
                    <p>Create an <strong>IAM User</strong> with programmatic access. For security, attach only the specific policies required.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Access Key ID</label>
                      <input type="text" required value={awsForm.accessKey} onChange={(e) => setAwsForm({...awsForm, accessKey: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="AKIA..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default Region</label>
                      <input type="text" required value={awsForm.region} onChange={(e) => setAwsForm({...awsForm, region: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="us-east-1" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secret Access Key</label>
                    <input type="password" required value={awsForm.secretKey} onChange={(e) => setAwsForm({...awsForm, secretKey: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="••••••••••••••••••••••••" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {loading ? 'Connecting...' : 'Save & Connect AWS'}
                  </button>
                </form>
              )}

              {/* MAIN AZURE FORM */}
              {activeTab === 'Azure' && (
                <form onSubmit={(e) => handleSaveAzure(e, false)} className="space-y-5">
                  <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl flex gap-3 items-start border border-blue-100">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-blue-600" />
                    <p>Create an <strong>App Registration (Service Principal)</strong> in Entra ID and assign it a Role to your target Subscription.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenant ID</label>
                      <input type="text" required value={azureForm.tenantId} onChange={(e) => setAzureForm({...azureForm, tenantId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="00000000-0000..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subscription ID</label>
                      <input type="text" required value={azureForm.subscriptionId} onChange={(e) => setAzureForm({...azureForm, subscriptionId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="11111111-1111..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Client ID</label>
                      <input type="text" required value={azureForm.clientId} onChange={(e) => setAzureForm({...azureForm, clientId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="22222222-2222..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Client Secret</label>
                      <input type="password" required value={azureForm.clientSecret} onChange={(e) => setAzureForm({...azureForm, clientSecret: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="••••••••••••••••••••••••" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {loading ? 'Connecting...' : 'Save & Connect Azure'}
                  </button>
                </form>
              )}

              {/* MAIN GCP FORM */}
              {activeTab === 'GCP' && (
                <form onSubmit={(e) => handleSaveGCP(e, false)} className="space-y-5">
                   <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl flex gap-3 items-start border border-blue-100">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-blue-600" />
                    <p>Create a <strong>Service Account</strong> in IAM. Generate a new key in <strong>JSON format</strong> and paste it below.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project ID</label>
                    <input type="text" required value={gcpForm.projectId} onChange={(e) => setGcpForm({...gcpForm, projectId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A]" placeholder="my-gcp-project-123" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Account Key (JSON)</label>
                    <textarea required value={gcpForm.jsonKey} onChange={(e) => setGcpForm({...gcpForm, jsonKey: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] outline-none transition-all text-[#0F172A] font-mono text-sm h-32 resize-none" placeholder={'{\n  "type": "service_account",\n  "project_id": "my-project"\n}'} />
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {loading ? 'Connecting...' : 'Save & Connect GCP'}
                  </button>
                </form>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- ACTIVE CONNECTIONS LIST --- */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <ShieldCheck size={20} className="text-emerald-500" />
          <h3 className="text-lg font-bold text-[#0F172A]">Active Connections</h3>
        </div>

        <div className="space-y-3">
          {connections.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500 text-sm">No active connections. Add a provider above to get started.</p>
            </div>
          ) : (
            <AnimatePresence>
              {connections.map((conn) => {
                const colors = getBrandColor(conn.provider);
                return (
                  <motion.div 
                    key={conn.id}
                    initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${colors}`}>
                        {conn.provider === 'AWS' ? 'A' : conn.provider === 'Azure' ? 'Az' : 'G'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0F172A]">{conn.title}</h4>
                        <div className="flex items-center gap-3 text-sm mt-0.5">
                          <span className="text-slate-500">{conn.subtitle}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-emerald-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected {conn.connectedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-100 md:border-none pt-4 md:pt-0">
                      <button 
                        onClick={() => openEditModal(conn.provider)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-[#00D4FF] text-sm font-bold rounded-lg border border-slate-200 transition-colors"
                      >
                        <Edit2 size={16} /> Update Keys
                      </button>
                      <button 
                        onClick={() => handleDisconnect(conn.id, conn.provider)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-lg border border-rose-100 transition-colors"
                      >
                        <Trash2 size={16} /> Disconnect
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* --- UPDATE KEYS MODAL --- */}
      <AnimatePresence>
        {editingProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingProvider(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-2xl font-bold text-[#0F172A]">Update {editingProvider} Keys</h3>
                <p className="text-slate-500 text-sm mt-1">Provide your new credentials below to overwrite the existing connection.</p>
              </div>

              {/* Modal form re-uses the logic, but styled for the popup */}
              {editingProvider === 'AWS' && (
                <form onSubmit={(e) => handleSaveAWS(e, true)} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Access Key</label>
                      <input type="text" required value={awsForm.accessKey} onChange={(e) => setAwsForm({...awsForm, accessKey: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Region</label>
                      <input type="text" required value={awsForm.region} onChange={(e) => setAwsForm({...awsForm, region: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Secret Key</label>
                    <input type="password" required value={awsForm.secretKey} onChange={(e) => setAwsForm({...awsForm, secretKey: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-[#00D4FF] text-white font-bold rounded-xl shadow-md hover:bg-cyan-400">{loading ? 'Updating...' : 'Update AWS Connection'}</button>
                </form>
              )}

              {editingProvider === 'Azure' && (
                <form onSubmit={(e) => handleSaveAzure(e, true)} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tenant ID</label>
                      <input type="text" required value={azureForm.tenantId} onChange={(e) => setAzureForm({...azureForm, tenantId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subscription ID</label>
                      <input type="text" required value={azureForm.subscriptionId} onChange={(e) => setAzureForm({...azureForm, subscriptionId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Client ID</label>
                      <input type="text" required value={azureForm.clientId} onChange={(e) => setAzureForm({...azureForm, clientId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Client Secret</label>
                      <input type="password" required value={azureForm.clientSecret} onChange={(e) => setAzureForm({...azureForm, clientSecret: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-[#00D4FF] text-white font-bold rounded-xl shadow-md hover:bg-cyan-400">{loading ? 'Updating...' : 'Update Azure Connection'}</button>
                </form>
              )}

              {editingProvider === 'GCP' && (
                <form onSubmit={(e) => handleSaveGCP(e, true)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project ID</label>
                    <input type="text" required value={gcpForm.projectId} onChange={(e) => setGcpForm({...gcpForm, projectId: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Service Account JSON</label>
                    <textarea required value={gcpForm.jsonKey} onChange={(e) => setGcpForm({...gcpForm, jsonKey: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-[#00D4FF] font-mono text-sm h-32 resize-none" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-[#00D4FF] text-white font-bold rounded-xl shadow-md hover:bg-cyan-400">{loading ? 'Updating...' : 'Update GCP Connection'}</button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
