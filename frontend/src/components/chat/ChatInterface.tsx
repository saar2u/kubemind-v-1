"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import { Server, Shield, Coins, SendIcon, LoaderIcon, Command, Trash2, Sparkles, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CloudProvider = 'AWS' | 'Azure' | 'GCP';
type Message = { 
    id: string;
    role: 'user' | 'agent'; 
    text: string; 
    isInteractive?: boolean;
    hasResponded?: boolean;
};

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number; }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = useCallback((reset?: boolean) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        if (reset) {
            textarea.style.height = `${minHeight}px`;
            return;
        }
        textarea.style.height = `${minHeight}px`;
        const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY));
        textarea.style.height = `${newHeight}px`;
    }, [minHeight, maxHeight]);

    useEffect(() => { adjustHeight(); }, [adjustHeight]);
    return { textareaRef, adjustHeight };
}

export default function ChatInterface() {
    const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('AWS');
    const [value, setValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    
    const [pendingCommand, setPendingCommand] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    
    const [availableAccounts, setAvailableAccounts] = useState<{id: string, provider: CloudProvider}[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');

    const userId = localStorage.getItem('kubemind-user-email') || 'default_user';
    const chatStorageKey = `kubemind-chat-${userId}`;

    useEffect(() => {
        const savedHistory = localStorage.getItem(chatStorageKey);
        if (savedHistory) {
            try { setChatHistory(JSON.parse(savedHistory)); } catch (e) {}
        }
        setIsInitialized(true);
    }, [chatStorageKey]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(chatStorageKey, JSON.stringify(chatHistory));
        }
    }, [chatHistory, isInitialized, chatStorageKey]);

    // Fetch Linked Accounts from API
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/connections', {
                    headers: { 'x_user_id': userId }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.accounts && data.accounts.length > 0) {
                        setAvailableAccounts(data.accounts);
                        // Auto-select the first account for the default selected cloud
                        const initialAccounts = data.accounts.filter((a: any) => a.provider === selectedCloud);
                        if (initialAccounts.length > 0) {
                            setSelectedAccount(initialAccounts[0].id);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch accounts", error);
            }
        };
        if (isInitialized) fetchAccounts();
    }, [isInitialized, userId]);

    // --- NEW: Filter dropdown dynamically based on selected Cloud Provider ---
    const filteredAccounts = availableAccounts.filter(acc => acc.provider === selectedCloud);

    // --- NEW: Handle Provider Pill Click ---
    const handleCloudChange = (cloud: CloudProvider) => {
        setSelectedCloud(cloud);
        // Automatically switch the dropdown to the first account of the new cloud
        const accountsForNewCloud = availableAccounts.filter(a => a.provider === cloud);
        if (accountsForNewCloud.length > 0) {
            setSelectedAccount(accountsForNewCloud[0].id);
        } else {
            setSelectedAccount('');
        }
    };

    const clearChat = () => {
        setChatHistory([]);
        localStorage.removeItem(chatStorageKey);
        setPendingCommand(null);
    };

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 52, maxHeight: 200 });
    const chatEndRef = useRef<HTMLDivElement>(null);
    const userName = localStorage.getItem('kubemind-user-name')?.split(' ')[0] || 'there';

    const getPromptSuggestions = (cloud: string) => [
        `List all running compute instances in ${cloud}`,
        `Create a new ${cloud === 'AWS' ? 'S3 bucket' : cloud === 'GCP' ? 'Cloud Storage bucket' : 'Blob Storage container'}`,
        `Audit my ${cloud} storage for public access`
    ];

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, isTyping]);

    const handleSendMessage = async (overrideText?: string, forceExecute = false) => {
        const textToSend = overrideText || value;
        if (!textToSend.trim() || isTyping) return;

        if (!forceExecute) {
            setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text: textToSend }]);
            setValue("");
            adjustHeight(true);
        }
        setIsTyping(true);

        let strictPayload = `[SYSTEM: User selected Provider: ${selectedCloud}, Account ID: ${selectedAccount || 'None selected'}. Apply logic ONLY to this provider and account.]\n\nUser Query: ${textToSend}`;
        
        if (forceExecute) strictPayload = `[FORCE_EXECUTE] ` + strictPayload;

        try {
            const response = await fetch('https://kubemind-api-446293329392.us-central1.run.app/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x_user_id': userId },
                body: JSON.stringify({ message: strictPayload, context: "", account_id: selectedAccount }) 
            });

            if (!response.ok) throw new Error(`Backend Error ${response.status}`);

            const data = await response.json();
            const responseText = data.response || "No response received.";
            const isApproval = typeof responseText === 'string' && responseText.includes("Approval Required");

            if (isApproval) setPendingCommand(textToSend);

            if (forceExecute) {
                const isError = responseText.includes('❌') || responseText.includes('⚠️');
                const finalText = isError ? responseText : `🚀 **Execution Successful!**\n\n${responseText}`;
                setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', text: finalText, isInteractive: false, hasResponded: false }]);
            } else {
                setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', text: responseText, isInteractive: isApproval, hasResponded: false }]);
            }
            
        } catch (error: any) {
            setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'agent', text: `❌ Connection error: ${error.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleInteractiveResponse = async (msgId: string, action: 'approve' | 'reject') => {
        setChatHistory(prev => prev.map(msg => msg.id === msgId ? { ...msg, hasResponded: true } : msg));
        
        if (action === 'approve' && pendingCommand) {
            setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "✅ I approve this execution." }]);
            await handleSendMessage(pendingCommand, true);
            setPendingCommand(null);
        } else {
            setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text: "❌ Cancel this operation." }]);
            setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', text: "Understood. The operation has been aborted and no changes were made." }]);
            setPendingCommand(null);
        }
    };

    const renderMessageContent = (msg: Message) => {
        const formattedText = msg.text.split(/(\*\*.*?\*\*)/g).map((textChunk, i) => {
            if (textChunk.startsWith('**') && textChunk.endsWith('**')) return <strong key={i} className="text-slate-800">{textChunk.slice(2, -2)}</strong>;
            return textChunk;
        });

        return (
            <div className="space-y-3">
                <div className="whitespace-pre-wrap leading-relaxed">{formattedText}</div>
                {msg.isInteractive && !msg.hasResponded && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-200">
                        <button onClick={() => handleInteractiveResponse(msg.id, 'approve')} className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                            <CheckCircle2 size={18} /> Approve & Execute
                        </button>
                        <button onClick={() => handleInteractiveResponse(msg.id, 'reject')} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                            <XCircle size={18} /> Cancel
                        </button>
                    </div>
                )}
                {msg.isInteractive && msg.hasResponded && <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">Action Concluded</div>}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/80 z-20 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C896] animate-pulse"></div>
                    <span className="font-semibold text-[#0F172A]">Agent Online</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={clearChat} title="Clear Chat History" className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                    </button>
                    
                    <div className="relative">
                        <select 
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] cursor-pointer"
                        >
                            {filteredAccounts.length === 0 ? (
                                <option value="">No {selectedCloud} Accounts</option>
                            ) : (
                                filteredAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.id}</option>
                                ))
                            )}
                        </select>
                        <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {(['AWS', 'Azure', 'GCP'] as CloudProvider[]).map((cloud) => (
                            <button 
                                key={cloud} 
                                onClick={() => handleCloudChange(cloud)} 
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-300 ${selectedCloud === cloud ? 'bg-white text-[#00D4FF] shadow-sm border border-[rgba(0,212,255,0.2)]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {cloud}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scroll-smooth z-10">
                {chatHistory.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div>
                            <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] pb-1">
                                Hi {userName}, how can I help you with {selectedCloud}?
                            </h1>
                            <p className="text-sm text-slate-400 mt-2">Type a command or choose a suggestion below.</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mt-4">
                            {getPromptSuggestions(selectedCloud).map((suggestion, idx) => (
                                <button key={idx} onClick={() => handleSendMessage(suggestion)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-[#00D4FF] text-slate-600 hover:text-[#00D4FF] text-sm rounded-full shadow-sm hover:shadow-md transition-all duration-200">
                                    <Sparkles size={14} className="text-[#00D4FF]" /> {suggestion}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6 pb-4">
                        {chatHistory.map((msg) => (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-5 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white shadow-md rounded-br-none' : 'bg-white text-slate-600 border border-slate-200 shadow-sm rounded-bl-none'}`}>
                                    {renderMessageContent(msg)}
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 p-5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent thinking</span>
                                    <div className="flex items-center gap-1.5">
                                        <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                                        <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                                        <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            <div className="p-4 bg-white/80 border-t border-slate-100 z-20 relative shrink-0">
                <div className="relative flex items-end bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-[rgba(0,212,255,0.2)] focus-within:border-[#00D4FF] transition-all shadow-sm">
                    <button className="p-3 text-slate-400 hover:text-[#00D4FF] transition-colors self-end mb-0.5">
                        <Command className="w-5 h-5" />
                    </button>
                    
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder={`Ask Kubemind to manage ${selectedCloud}...`}
                        className="flex-1 max-h-[200px] min-h-[52px] py-3.5 px-2 bg-transparent border-none resize-none focus:outline-none text-[#0F172A] placeholder:text-slate-400 scrollbar-thin"
                    />
                    
                    <button onClick={() => handleSendMessage()} disabled={!value.trim() || isTyping} className="p-3 m-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-[#0F172A] flex-shrink-0 self-end">
                        {isTyping ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
                    </button>
                </div>
                <div className="text-center mt-3 mb-1">
                    <span className="text-[11px] text-slate-400 font-medium">Agent Kube requires approval before making destructive changes.</span>
                </div>
            </div>
        </div>
    );
}