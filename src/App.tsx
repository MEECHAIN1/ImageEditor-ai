import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Zap, 
  ShieldCheck, 
  Database, 
  Award, 
  Bot,
  Image as ImageIcon,
  History,
  Plus,
  ArrowRight,
  MessageSquare,
  Terminal,
  Cpu,
  Microscope,
  Send,
  Activity,
  Box,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

// --- Mock Services ---
const useWallet = () => {
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [network] = useState({ name: 'MeeChain LabNet', chainId: 1337 });
  const connectWallet = () => setConnectedAccount("0x71C7...E921");
  return { connectedAccount, connectWallet, network };
};

const App = () => {
  const { connectedAccount, connectWallet, network } = useWallet();
  const [activeTab, setActiveTab] = useState('lab');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'สวัสดีครับ! ผม MeeBot พร้อมช่วยคุณวิจัยและจัดการ NFT ในทุกหน้าของ MeeChain แล้วครับ' }
  ]);
  
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const abilities = [
    { name: 'AI Generator', icon: <ImageIcon size={18} />, desc: 'สร้างงานศิลปะ NFT ด้วยพลัง AI' },
    { name: 'On-Chain Analyst', icon: <Activity size={18} />, desc: 'วิเคราะห์ข้อมูลธุรกรรมเชิงลึก' },
    { name: 'Smart Protector', icon: <ShieldCheck size={18} />, desc: 'ตรวจสอบความปลอดภัย Contract' },
    { name: 'Metadata Master', icon: <Database size={18} />, desc: 'จัดการข้อมูล IPFS อัตโนมัติ' }
  ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessages = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: 'MeeBot ได้รับคำสั่งแล้วครับ... กำลังประมวลผลผ่าน Smart Contract ของ MeeChain...' }]);
    }, 1000);
  };

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#00f0dc] font-sans selection:bg-black selection:text-white relative overflow-x-hidden" 
         style={{ backgroundImage: `linear-gradient(rgba(0, 240, 220, 0.9), rgba(0, 240, 220, 0.9)), url("https://www.transparenttextures.com/patterns/carbon-fibre.png")` }}>
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03]" 
           style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>

      {/* Navigation */}
      <nav className="bg-black text-white sticky top-0 z-40 p-4 border-b-4 border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('lab')}>
              <div className="w-10 h-10 bg-[#00f0dc] rounded-xl flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(0,240,220,0.5)]">
                <Zap className="text-black fill-current animate-pulse" />
              </div>
              <span className="font-black text-2xl tracking-tighter italic group-hover:text-[#00f0dc] transition-colors uppercase">MEECHAIN LAB</span>
            </div>
            
            <div className="hidden md:flex gap-1">
              {['Market', 'Missions', 'Governance'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                    activeTab === tab.toLowerCase() ? 'bg-[#00f0dc] text-black shadow-[0_0_10px_rgba(0,240,220,0.4)]' : 'hover:bg-white/5 text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {connectedAccount ? (
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase text-[#00f0dc] leading-none">OPERATOR</p>
                  <p className="text-sm font-bold leading-tight tracking-tight">{truncateAddress(connectedAccount)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00f0dc] border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(0,240,220,0.3)]">
                   <Bot className="text-black" size={16} />
                </div>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="bg-white text-black px-6 py-2 rounded-xl font-black text-xs shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
              >
                ACCESS LAB
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
        
        {/* LEFT COLUMN: ABILITIES & STATUS */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black text-white p-6 rounded-[2rem] border-4 border-white/10 shadow-xl">
            <h3 className="text-xs font-black uppercase text-[#00f0dc] mb-4 tracking-[0.2em] flex items-center gap-2">
              <Cpu size={14} /> Abilities
            </h3>
            <div className="space-y-3">
              {abilities.map((ability, i) => (
                <div key={i} className="group p-3 rounded-xl border border-white/5 hover:border-[#00f0dc]/50 hover:bg-white/5 transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-[#00f0dc] group-hover:scale-110 transition-transform">{ability.icon}</div>
                    <p className="font-bold text-xs">{ability.name}</p>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{ability.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
              <Microscope size={14} /> System Health
            </h3>
            <div className="space-y-4 font-bold text-[10px]">
              <div>
                <div className="flex justify-between mb-1"><span>Network Sync</span><span className="text-green-500">Online</span></div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-black/5">
                  <div className="bg-green-500 h-full w-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1"><span>IPFS Node</span><span className="text-cyan-500">Active</span></div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-black/5">
                  <div className="bg-cyan-500 h-full w-[92%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: WORKSPACE CONTENT */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === 'lab' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Showcase */}
              <div className="bg-white border-4 border-black rounded-[3rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform">
                  <ImageIcon size={200} />
                </div>
                <h2 className="text-3xl font-black italic uppercase mb-4 leading-tight">AI Laboratory Workspace</h2>
                <p className="font-bold text-gray-600 mb-6">เริ่มการทดลองสร้าง NFT Card รูปแบบใหม่ด้วย AI หรือวิเคราะห์ข้อมูล On-chain ได้ที่นี่</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-black text-[#00f0dc] py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:-translate-y-1 transition-transform">Start AI Mint</button>
                  <button className="bg-gray-100 text-black py-4 rounded-2xl font-black text-xs uppercase border-2 border-black hover:bg-black hover:text-white transition-all">Open Explorer</button>
                </div>
              </div>

              {/* Lab Stats Card */}
              <div className="bg-black text-white border-4 border-white/10 rounded-[3rem] p-8 shadow-2xl relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-[#00f0dc] rounded-2xl border-2 border-white flex items-center justify-center text-black">
                    <Activity size={32} />
                  </div>
                  <div>
                    <h3 className="font-black italic uppercase text-xl">Lab Performance</h3>
                    <p className="text-[#00f0dc] text-[10px] font-bold uppercase tracking-widest">Real-time data stream</p>
                  </div>
                </div>
                <div className="space-y-6">
                   <div className="flex justify-between items-center border-b border-white/10 pb-2">
                     <span className="text-xs font-bold text-gray-400">Total Experiments</span>
                     <span className="font-black italic text-[#00f0dc]">1,248</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/10 pb-2">
                     <span className="text-xs font-bold text-gray-400">Success Rate</span>
                     <span className="font-black italic text-[#00f0dc]">99.4%</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-white/10 pb-2">
                     <span className="text-xs font-bold text-gray-400">Active Nodes</span>
                     <span className="font-black italic text-[#00f0dc]">12</span>
                   </div>
                </div>
              </div>

              {/* Recent Records (Full width below) */}
              <div className="md:col-span-2 bg-white border-4 border-black rounded-[2.5rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-6 px-2">
                  <h3 className="text-lg font-black italic uppercase flex items-center gap-2">
                    <Database size={20} /> Latest Lab Records (IPFS)
                  </h3>
                  <button className="text-[10px] font-black underline uppercase">Export All</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl border-2 border-black/5 hover:border-black transition-all group cursor-pointer">
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
                         <Zap size={20} className="text-[#00f0dc]" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-xs truncate">EXP_#00{i}_RESULT</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Status: Finalized</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-black rounded-[3rem] p-20 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
               <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                 <Terminal size={32} className="opacity-20" />
               </div>
               <h2 className="text-3xl font-black italic uppercase mb-2">Module: {activeTab}</h2>
               <p className="font-bold text-gray-500">ระบบกำลังเชื่อมต่อข้อมูลกับ MeeChain Mainnet...</p>
            </div>
          )}
        </div>
      </main>

      {/* --- GLOBAL MEEBOT CHAT OVERLAY --- */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-6 w-[380px] h-[550px] z-[100] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-white border-4 border-black rounded-[2.5rem] overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,0.2)] flex flex-col h-full ring-8 ring-black/5">
            {/* Chat Header */}
            <div className="bg-black p-5 flex justify-between items-center border-b-4 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00f0dc] rounded-xl flex items-center justify-center border-2 border-white relative">
                   <Bot size={22} className="text-black" />
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-white font-black italic uppercase tracking-tighter text-sm">MeeBot Assistant</h2>
                  <p className="text-[#00f0dc] text-[8px] font-bold uppercase tracking-widest leading-none">AI Research Core</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-white/40 hover:text-white transition-colors"><Maximize2 size={16} /></button>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-red-500 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl font-bold text-xs shadow-sm border-2 ${
                    msg.role === 'user' 
                    ? 'bg-black text-white border-black rounded-tr-none' 
                    : 'bg-[#00f0dc] text-black border-black rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Commands */}
            <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar">
              {['/mint', '/scan', '/ipfs', '/help'].map(cmd => (
                <button key={cmd} onClick={() => setChatInput(cmd)} className="px-2 py-1 bg-gray-100 border border-black rounded-md text-[8px] font-black uppercase hover:bg-black hover:text-white transition-all shrink-0">
                  {cmd}
                </button>
              ))}
            </div>

            {/* Input Station */}
            <div className="p-5 bg-gray-50 border-t-4 border-black">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask MeeBot anything..."
                  className="w-full bg-white border-2 border-black p-3 pr-12 rounded-xl text-xs font-bold focus:outline-none shadow-inner"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 w-8 h-8 bg-black text-[#00f0dc] rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GLOBAL FLOATING BUTTON (THE CORE) --- */}
      <div className="fixed bottom-8 right-8 z-[110]">
         <div className="relative group">
            {!isChatOpen && (
              <div className="absolute bottom-full right-0 mb-4 w-48 bg-white border-4 border-black rounded-2xl p-3 shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none">
                <p className="font-black text-[10px] uppercase text-gray-400 mb-1 leading-none">Assistant Online</p>
                <p className="font-bold text-[11px] leading-tight text-black">ต้องการความช่วยเหลือจาก MeeBot ไหมครับ?</p>
              </div>
            )}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-black shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-110 transition-all active:scale-95 group overflow-hidden ${
                isChatOpen ? 'bg-black text-[#00f0dc]' : 'bg-[#00f0dc] text-black'
              }`}
            >
              {isChatOpen ? <X size={28} /> : <Bot size={32} className="animate-pulse" />}
              
              {/* Animated Ring */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping pointer-events-none opacity-20"></div>
            </button>
            
            {/* Status Indicator */}
            <div className="absolute top-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
         </div>
      </div>

      {/* Footer */}
      <footer className="p-8 bg-black text-white/40 border-t-4 border-white/10 overflow-hidden text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
          <div className="font-black italic text-xl tracking-tighter text-white">MEECHAIN LAB TERMINAL</div>
          <div className="text-[9px] font-bold uppercase tracking-[0.3em]">Operational Area • Decentralized Access</div>
        </div>
      </footer>

    </div>
  );
};

export default App;