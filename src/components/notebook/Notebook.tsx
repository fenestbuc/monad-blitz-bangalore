'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract, usePublicClient } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseAbi } from 'viem';
import { ShieldAlert, ShieldCheck, Download, ExternalLink, Loader2, Edit3, Plus, Trash2, Search, Check, X, FileText, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Note {
  id: string;
  title: string;
  content: string;
  agent_name: string;
  hash: string;
  tx_hash?: string;
  created_at: string;
  updated_at: string;
}

const CONTRACT_ADDRESS = '0xF2799c04B14d5993cD4a2aD4D37664B432e7c2Ea'; 
const REGISTRY_ADDRESS = '0xB9a899408F2872B215e00a383E2e68d15ed93419';

const ABI = parseAbi([
  'function addNoteHash(bytes32 _hash) external',
  'function getNoteHash(uint256 index) external view returns (bytes32, address, uint256)',
  'function getNotesCount() external view returns (uint256)'
]);

const REGISTRY_ABI = parseAbi([
  'function registerAgent(string name) external',
  'function getAgentName(address agent) external view returns (string)'
]);

export function Notebook() {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [agentName, setAgentName] = useState('agent-smith');
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: globalNoteCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getNotesCount',
    query: { refetchInterval: 10000 }
  });


  // Fetch on-chain registered name
  const { data: registeredName, refetch: refetchRegisteredName } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
    functionName: 'getAgentName',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  useEffect(() => {
    if (registeredName && typeof registeredName === 'string' && registeredName.length > 0) {
      setAgentName(registeredName);
    }
  }, [registeredName]);

  useEffect(() => {
    setMounted(true);
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch('/api/notes');
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    }
  };

  const handleRegisterAgent = async () => {
    if (!isConnected || !agentName) return;
    setIsRegistering(true);
    try {
      const txHash = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'registerAgent',
        args: [agentName]
      });
      toast.info("Transaction submitted, waiting for confirmation...");
      try {
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 30000 });
        } else {
          await new Promise(r => setTimeout(r, 4000));
        }
      } catch (receiptError) {
        console.warn("waitForTransactionReceipt timed out or failed, proceeding anyway", receiptError);
        await new Promise(r => setTimeout(r, 2000));
      }
      toast.success("Agent Identity Registered on Monad Testnet!");
      
      // Force set local state so UI updates immediately
      setAgentName(agentName);
      
      let retries = 0;
      const checkUpdate = setInterval(async () => {
        const result = await refetchRegisteredName();
        if ((result.data && result.data === agentName) || retries > 10) {
          clearInterval(checkUpdate);
        }
        retries++;
      }, 2000);
      
    } catch (e) {
      console.error(e);
      toast.error("Failed to register agent identity");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedNote) {
        await fetch(`/api/notes/${selectedNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, agent_name: agentName }),
        });
        const newNote = await res.json();

        if (!isConnected) {
           toast.warning("Note saved locally, but not anchored on Monad Testnet because your wallet is disconnected. Please connect wallet to anchor notes.");
        } else if (newNote.hash) {
          try {
            const txHash = await writeContractAsync({
              address: CONTRACT_ADDRESS,
              abi: ABI,
              functionName: 'addNoteHash',
              args: [`0x${newNote.hash}`]
            });
            toast.info("Transaction submitted, waiting for confirmation...");
            try {
              if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 30000 });
              } else {
                await new Promise(r => setTimeout(r, 4000));
              }
            } catch (receiptError) {
              console.warn("waitForTransactionReceipt timed out or failed, proceeding anyway", receiptError);
              await new Promise(r => setTimeout(r, 2000));
            }
            await fetch(`/api/notes/${newNote.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tx_hash: txHash })
            });
          } catch (e) {
            console.error("Failed to write to contract:", e);
            toast.error("Failed to anchor on Monad Testnet");
          }
        }
      }
      
      toast.success(selectedNote ? "Note updated successfully" : "Note created successfully");
      setTitle('');
      setContent('');
      setSelectedNote(null);
      fetchNotes();
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
    toast.success("Note deleted");
    setDeleteConfirmId(null);
    fetchNotes();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setDeleteConfirmId(null);
  };

  const handleVerify = async (note: Note) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(note.content + note.agent_name);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashHex === note.hash) {
      toast.success(`Hash Matches! Data is intact.`, {
        description: `Local: ${hashHex.substring(0,12)}...`,
        duration: 5000
      });
    } else {
      toast.error(`Tampering Detected!`, {
        description: `Expected: ${note.hash.substring(0,12)}... Got: ${hashHex.substring(0,12)}...`,
        duration: 8000
      });
    }
  };

  const exportAuditBundle = (note: Note) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(note, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `audit-bundle-${note.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.info("Audit Bundle Exported");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (title && content && !isSaving) {
        handleSave();
      }
    }
  };


  const exportAllNotes = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `notebook-full-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Full Database Backup Exported");
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-[800px]"><Loader2 className="animate-spin w-6 h-6 mr-2" /> Initializing Workspace...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-[800px] h-auto lg:h-[800px] w-full max-w-7xl gap-6 p-4 mx-auto my-4 lg:my-10">
      
      {/* Sidebar List */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/3 flex flex-col h-[500px] lg:h-full glass-card"
      >
        <div className="p-6 border-b border-white/5 flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Agent Memory</h2>
              <div className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${globalNoteCount ? 'bg-green-400' : 'bg-yellow-500/50'}`} />
                {globalNoteCount ? `Total Anchored: ${globalNoteCount.toString()}` : 'Syncing chain data...'}
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" size="sm" onClick={() => disconnect()} className="text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white">
                Disconnect
              </Button>
            ) : (
              <Button size="sm" onClick={() => connect({ connector: injected() })} className="text-xs bg-[#F5A623] hover:bg-[#D98E1C] text-black">
                Connect Wallet
              </Button>
            )}
          </div>

          <div className="flex gap-2 w-full mt-4">
            <Button 
              onClick={() => {
                setSelectedNote(null);
                setTitle('');
                setContent('');
                setDeleteConfirmId(null);
                setIsPreview(false);
              }}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> New
            </Button>
            <Button 
              onClick={exportAllNotes}
              variant="outline"
              className="px-3 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              title="Backup entire database"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <Input 
              placeholder="Search memory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-8 bg-white/5 border-white/10 text-white h-9 text-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <AnimatePresence>
              <div className="flex flex-col gap-3">
                {filteredNotes.map((note) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={note.id} 
                    className={`cursor-pointer p-4 rounded-lg border transition-all ${
                      selectedNote?.id === note.id 
                        ? 'border-[#F5A623]/50 bg-[#F5A623]/5 shadow-[0_0_15px_rgba(245,166,35,0.05)]' 
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                    }`}
                    onClick={() => selectNote(note)}
                  >
                    <div className="font-semibold truncate text-white/90">{note.title || 'Untitled'}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[#F5A623]/10 text-[#F5A623] rounded font-mono uppercase tracking-wider">{note.agent_name}</span>
                      {note.tx_hash ? <ShieldCheck className="w-3 h-3 text-green-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" title="Local Only" />}
                    </div>
                    <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-3">
                      <div className="text-[10px] text-white/40">{new Date(note.created_at).toLocaleDateString()}</div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10 text-white/60 hover:text-white" onClick={(e) => { e.stopPropagation(); exportAuditBundle(note); }} title="Export Audit Bundle">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10 text-white/60 hover:text-white" onClick={(e) => { e.stopPropagation(); handleVerify(note); }} title="Verify Integrity">
                          <ShieldAlert className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        </div>
      </motion.div>
      {/* Editor Pane */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-2/3 flex flex-col h-auto lg:h-full glass-card p-4 lg:p-6"
      >
        <div className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Edit3 className="w-5 h-5 text-[#F5A623]" />
            <h2 className="text-xl font-bold tracking-tight">{selectedNote ? 'Edit Entry' : 'New Entry'}</h2>
          </div>
          {selectedNote && (
            deleteConfirmId === selectedNote.id ? (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                <span className="text-xs text-red-400 font-medium">Are you sure?</span>
                <Button variant="ghost" size="sm" onClick={() => executeDelete(selectedNote.id)} className="text-white bg-red-500 hover:bg-red-600 h-8 px-3">
                  <Check className="w-4 h-4 mr-1" /> Yes
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)} className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-3">
                  <X className="w-4 h-4 mr-1" /> No
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedNote.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            )
          )}
        </div>
        
        <div className="flex-1 flex flex-col gap-6 pt-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Title</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Observation log..." 
                disabled={!!selectedNote?.tx_hash}
                className="bg-white/5 border-white/10 focus-visible:ring-[#F5A623]/50 text-white h-12 disabled:opacity-50"
              />
            </div>
            {!selectedNote && (
              <div className="w-full sm:w-1/3 space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex justify-between">
                  Agent Identity
                  {(registeredName && typeof registeredName === 'string' && registeredName === agentName) && <span className="text-green-400 flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Verified</span>}
                </label>
                <div className="flex gap-2">
                  <Input 
                    value={agentName} 
                    onChange={(e) => setAgentName(e.target.value)} 
                    placeholder="agent-name" 
                    disabled={!!(registeredName && typeof registeredName === 'string' && registeredName === agentName)}
                    className={`bg-white/5 border-white/10 focus-visible:ring-[#F5A623]/50 font-mono text-sm h-12 ${registeredName === agentName && agentName.length > 0 ? 'text-green-400 disabled:opacity-100' : 'text-[#F5A623]'}`}
                  />
                  {isConnected && (!registeredName || registeredName === '' || registeredName !== agentName) && (
                    <Button 
                      onClick={handleRegisterAgent} 
                      disabled={isRegistering || !agentName || (typeof registeredName === 'string' && registeredName === agentName)}
                      className="h-12 px-3 bg-white/10 hover:bg-white/20 text-white"
                      title="Register Identity On-Chain"
                    >
                      {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Secure Payload</label>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-6 px-2 text-[10px] uppercase tracking-wider ${!isPreview ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                  onClick={() => setIsPreview(false)}
                >
                  <Code className="w-3 h-3 mr-1" /> Raw
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-6 px-2 text-[10px] uppercase tracking-wider ${isPreview ? 'bg-[#F5A623]/20 text-[#F5A623]' : 'text-white/40 hover:text-white'}`}
                  onClick={() => setIsPreview(true)}
                >
                  <FileText className="w-3 h-3 mr-1" /> Preview
                </Button>
                <span className="text-[10px] text-white/30 hidden md:block border-l border-white/10 pl-4">Press <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-white/50">Cmd/Ctrl + Enter</kbd> to save</span>
              </div>
            </div>
            
            {isPreview ? (
              <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-md p-6 overflow-y-auto min-h-[200px] prose prose-invert prose-yellow max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || '*No content to preview...*'}
                </ReactMarkdown>
              </div>
            ) : (
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                onKeyDown={handleKeyDown}
                disabled={!!selectedNote?.tx_hash}
                placeholder="Write immutable payload here... (Markdown supported)" 
                className="flex-1 resize-none font-mono bg-white/5 border-white/10 focus-visible:ring-[#F5A623]/50 text-sm p-4 text-white/90 leading-relaxed min-h-[200px] disabled:opacity-50"
              />
            )}
          </div>

          {selectedNote?.tx_hash ? (
            <div className="flex-shrink-0 p-3 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Secured on Monad Testnet</span>
              </div>
              <a 
                href={`https://testnet.monadexplorer.com/tx/${selectedNote.tx_hash}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-mono text-green-400 hover:text-green-300 hover:underline flex items-center gap-1"
              >
                {selectedNote.tx_hash.substring(0, 10)}...{selectedNote.tx_hash.substring(58)} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            selectedNote && (
              <div className="flex-shrink-0 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs text-yellow-500/80 font-medium">Local Note Only (Not Anchored)</span>
                </div>
              </div>
            )
          )}

          {!selectedNote?.tx_hash && (
            <div className="flex justify-end pt-2 flex-shrink-0">
              <Button 
                onClick={handleSave} 
                disabled={!title || !content || isSaving} 
                className="min-w-[160px] h-12 bg-[#F5A623] hover:bg-[#D98E1C] text-black font-semibold shadow-[0_0_15px_rgba(245,166,35,0.2)] disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  selectedNote 
                    ? (isConnected ? 'Update & Anchor' : 'Update Locally') 
                    : (isConnected ? 'Sign & Anchor on Monad' : 'Save Locally')
                )}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
