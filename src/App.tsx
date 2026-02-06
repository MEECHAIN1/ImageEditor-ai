import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Database, 
  Layout, 
  PlusCircle, 
  History, 
  User, 
  CheckCircle2,
  ExternalLink,
  Cpu,
  Code2,
  Lock,
  ArrowRight
} from 'lucide-react';

// ข้อมูลจำลองสถานะ Contract
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const INITIAL_MISSIONS = [
  { id: 1, title: 'MeeBot Onboarding', reward: 'Genesis Badge', xp: 500, status: 'completed' },
  { id: 2, title: 'First Token Swap', reward: 'Trader Card', xp: 1200, status: 'in_progress' },
  { id: 3, title: 'Provide Liquidity', reward: 'LP Master Card', xp: 2500, status: 'locked' },
];

const NFT_CARDS = [
  { 
    id: "MC-000", 
    name: "MeeBot Pioneer", 
    rarity: "Epic", 
    ipfs: "ipfs://QmXoyp.../metadata.json",
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=400&fit=crop" 
  }
];

export default function App() {
  const [missions, setMissions] = useState(INITIAL_MISSIONS);
  const [cards, setCards] = useState(NFT_CARDS);
  const [logs, setLogs] = useState([]);
  const [isMinting, setIsMinting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('missions'); // 'missions' or 'contract'

  const addLog = (action, hash) => {
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      action,
      hash: hash || `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`
    };
    setLogs(prev => [newLog, ...prev].slice(0, 8));
  };

  const handleCompleteMission = (mId) => {
    setIsMinting(true);
    addLog(`Calling contract: completeMissionAndMint(${mId})`);
    
    setTimeout(() => {
      const newCard = {
        id: `MC-00${cards.length}`,
        name: missions.find(m => m.id === mId).reward,
        rarity: "Rare",
        ipfs: `ipfs://QmZrt${mId}.../meta.json`,
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop"
      };
      setCards(prev => [...prev, newCard]);
      setMissions(prev => prev.map(m => m.id === mId ? {...m, status: 'completed'} : m));
      setIsMinting(false);
      addLog(`Mission ${mId} Sync Success`, "0x74a2...b9e1");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
            <Cpu size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MeeChain <span className="text-blue-500 text-sm font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-800 ml-2">DEVNET</span></h1>
            <p className="text-slate-400 text-sm italic">Modular Ecosystem for MeeBot</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('missions')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'missions' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('contract')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${activeTab === 'contract' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Contract
            </button>
          </nav>

          <button 
            onClick={() => { setWalletConnected(true); addLog("Connect: Web3 Wallet Active"); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
              walletConnected 
              ? 'bg-slate-800 border border-slate-700 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            }`}
          >
            <Shield size={18} />
            {walletConnected ? '0x8821...4F2A' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'missions' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col: Missions & Assets */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total XP", value: "1,700", icon: Zap, color: "text-yellow-400" },
                  { label: "NFT Cards", value: cards.length, icon: Layout, color: "text-purple-400" },
                  { label: "Contract Calls", value: logs.length, icon: Code2, color: "text-blue-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
                    <stat.icon size={16} className={`${stat.color} mb-2`} />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Mission List */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-blue-400" />
                  เควสต์ปัจจุบัน (Active Quests)
                </h2>
                
                <div className="space-y-4">
                  {missions.map(m => (
                    <div key={m.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all ${
                      m.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : 'bg-slate-800/40 border-slate-700/50'
                    }`}>
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className={`p-3 rounded-xl ${m.status === 'completed' ? 'bg-green-500/10 text-green-400' : m.status === 'locked' ? 'bg-slate-700/30 text-slate-600' : 'bg-blue-500/10 text-blue-400'}`}>
                          {m.status === 'completed' ? <CheckCircle2 size={24} /> : m.status === 'locked' ? <Lock size={24} /> : <Zap size={24} />}
                        </div>
                        <div>
                          <h3 className={`font-bold ${m.status === 'locked' ? 'text-slate-600' : 'text-slate-100'}`}>{m.title}</h3>
                          <p className="text-xs text-slate-500">Reward: <span className="text-slate-300">{m.reward}</span> • <span className="text-blue-400">{m.xp} XP</span></p>
                        </div>
                      </div>
                      {m.status === 'in_progress' && (
                        <button 
                          onClick={() => handleCompleteMission(m.id)}
                          disabled={!walletConnected || isMinting}
                          className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                          {isMinting ? 'Transaction Pending...' : 'Complete on MeeChain'}
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Inventory */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <PlusCircle size={20} className="text-purple-400" />
                  MeeChain Collection
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cards.map(card => (
                    <div key={card.id} className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all">
                      <div className="h-40 overflow-hidden">
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold">{card.name}</h3>
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase">{card.rarity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <Database size={10} />
                          <span className="truncate">{card.ipfs}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Right Col: Explorer Log */}
            <div className="lg:col-span-4">
               <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-full flex flex-col backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <History size={18} className="text-amber-400" />
                    MeeScan Explorer
                  </h2>
                  <div className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">Live</div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {logs.map(log => (
                    <div key={log.id} className="p-3 bg-black/40 rounded-xl border border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                      <div className="flex justify-between items-center mb-1 text-[10px]">
                        <span className="text-blue-500 font-mono">{log.time}</span>
                        <ExternalLink size={10} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="text-xs font-medium text-slate-300">{log.action}</p>
                      <p className="text-[9px] text-slate-600 font-mono mt-2 truncate bg-slate-900/80 px-1.5 py-1 rounded">
                        TX: {log.hash}
                      </p>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-sm italic">
                      <History size={32} className="mb-2 opacity-20" />
                      No recent transactions
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800">
                  <div className="bg-blue-600/10 rounded-2xl p-4 border border-blue-500/20">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">Network Health</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>Block Height</span>
                      <span className="font-mono text-slate-300">#1,902,442</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

          </div>
        ) : (
          /* Contract Info Tab */
          <div className="max-w-3xl mx-auto space-y-6">
             <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Code2 size={28} className="text-blue-400" />
                  MeeChain Mission ABI
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Contract Address</label>
                    <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-slate-800 font-mono text-blue-300 text-sm">
                      {CONTRACT_ADDRESS}
                      <ExternalLink size={14} className="ml-auto text-slate-600" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Primary Functions</label>
                    <div className="space-y-3">
                      {[
                        { func: "completeMissionAndMint(uint256, string)", desc: "ยืนยันภารกิจ, แจก XP และ Mint NFT" },
                        { func: "userXP(address)", desc: "ตรวจสอบคะแนนประสบการณ์ของผู้ใช้" },
                        { func: "userMissions(address, uint256)", desc: "ตรวจสอบสถานะภารกิจรายตัว" }
                      ].map((f, i) => (
                        <div key={i} className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                          <code className="text-purple-400 text-sm font-bold block mb-1">{f.func}</code>
                          <p className="text-xs text-slate-400">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <div className="flex gap-4">
                      <Shield className="text-amber-500 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-500">Security & Modularity</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          สัญญานี้ใช้มาตรฐาน OpenZeppelin และถูกออกแบบมาให้เชื่อมต่อกับ Metadata บน IPFS เพื่อลดภาระการเก็บข้อมูลบน Chain และเพิ่มความยืดหยุ่นในการอัปเกรดเนื้อหาการ์ดในอนาคต
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
             </section>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}