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
  Code,
  Link as LinkIcon,
  CheckCircle
} from 'lucide-react';

// --- Configuration ---
// อัปเดต Address ล่าสุดที่คุณได้มา
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const App = () => {
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [contractStatus, setContractStatus] = useState('Connected');
  const [isMinting, setIsMinting] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'สัญญา MeeChainMissionNFT ตรวจพบที่ ' + CONTRACT_ADDRESS + ' เรียบร้อยครับ! ผมพร้อมช่วยคุณ Mint การ์ดแล้ว' }
  ]);
  
  const chatEndRef = useRef(null);

  const connectWallet = () => setConnectedAccount("0x71C7...E921");

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessages = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMessages);
    
    // Logic สำหรับคำสั่งพิเศษ
    if (chatInput.toLowerCase().includes('/mint')) {
        simulateMint();
    } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'bot', text: 'MeeBot กำลังตรวจสอบข้อมูลบนเชนที่ ' + CONTRACT_ADDRESS.slice(0,10) + '... กรุณารอสักครู่ครับ' }]);
        }, 800);
    }
    setChatInput('');
  };

  const simulateMint = () => {
    setIsMinting(true);
    setMessages(prev => [...prev, { role: 'bot', text: '🧪 กำลังเริ่มกระบวนการ Mint... ดึง Metadata จาก IPFS...' }]);
    
    setTimeout(() => {
        setIsMinting(false);
        setMessages(prev => [...prev, { 
            role: 'bot', 
            text: '✅ Mint สำเร็จ! การ์ด Genesis Card #01 ถูกส่งไปยังกระเป๋าของคุณแล้ว (TX Hash: 0x8a2f...)' 
        }]);
    }, 2500);
  };

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#00f0dc] font-sans relative overflow-x-hidden" 
         style={{ backgroundImage: `linear-gradient(rgba(0, 240, 220, 0.9), rgba(0, 240, 220, 0.9)), url("https://www.transparenttextures.com/patterns/carbon-fibre.png")` }}>
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03]" 
           style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>

      {/* Navigation */}
      <nav className="bg-black text-white sticky top-0 z-40 p-4 border-b-4 border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-[#00f0dc] rounded-xl flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(0,240,220,0.5)]">
                <Zap className="text-black fill-current animate-pulse" />
              </div>
              <span className="font-black text-2xl tracking-tighter italic uppercase">MEECHAIN LAB</span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {connectedAccount ? (
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase text-[#00f0dc] leading-none">OPERATOR</p>
                  <p className="text-sm font-bold">{truncateAddress(connectedAccount)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00f0dc] border-2 border-white flex items-center justify-center">
                   <Bot className="text-black" size={16} />
                </div>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="bg-white text-black px-6 py-2 rounded-xl font-black text-xs shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
              >
                CONNECT WALLET
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
        
        {/* LEFT: SYSTEM STATUS */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black text-white p-6 rounded-[2rem] border-4 border-white/10 shadow-xl">
            <h3 className="text-xs font-black uppercase text-[#00f0dc] mb-4 tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} /> LIVE CONTRACT
            </h3>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Current Address</p>
               <p className="text-[10px] font-mono text-[#00f0dc] break-all mb-4">{CONTRACT_ADDRESS}</p>
               <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle size={14} />
                  <span className="text-[10px] font-black uppercase">Verified on LabNet</span>
               </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
              <Database size={14} /> IPFS Health
            </h3>
            <div className="space-y-4 font-bold text-[10px]">
              <div className="flex justify-between"><span>Node Gateway</span><span className="text-green-500">Active</span></div>
              <div className="flex justify-between"><span>Pinned Files</span><span className="text-black">128</span></div>
            </div>
          </div>
        </div>

        {/* MIDDLE: MAIN WORKSPACE */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white border-4 border-black rounded-[3rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform">
              <Bot size={250} />
            </div>
            
            <div className="relative z-10">
                <h2 className="text-4xl font-black italic uppercase mb-2 tracking-tighter">Mission Control Center</h2>
                <p className="text-xl font-bold text-gray-600 mb-8">เชื่อมต่อกับ Smart Contract เพื่อเริ่มภารกิจและ Mint NFT Card</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-3xl border-2 border-black border-dashed">
                        <h4 className="font-black text-sm uppercase mb-4 flex items-center gap-2">
                            <Plus className="text-[#00f0dc] bg-black rounded" size={16}/> Active Mission
                        </h4>
                        <div className="space-y-4">
                            <div className="p-3 bg-white border-2 border-black rounded-xl flex justify-between items-center">
                                <span className="font-bold text-sm">Genesis Onboarding</span>
                                <span className="text-[10px] font-black bg-cyan-100 px-2 py-1 rounded">100 XP</span>
                            </div>
                            <button 
                                onClick={simulateMint}
                                disabled={isMinting}
                                className={`w-full py-3 rounded-2xl font-black text-xs uppercase transition-all shadow-md ${isMinting ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#00f0dc] text-black hover:-translate-y-1'}`}
                            >
                                {isMinting ? 'Processing Transaction...' : 'Mint Reward NFT'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-black text-white p-6 rounded-3xl flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-[#00f0dc] uppercase mb-1">Developer Quick Actions</p>
                            <h4 className="font-black italic text-lg uppercase mb-4 tracking-tighter">Contract Tools</h4>
                        </div>
                        <div className="space-y-2">
                            <button className="w-full bg-white/10 hover:bg-white/20 p-2 rounded-lg text-left text-[10px] font-bold flex justify-between items-center transition-colors">
                                <span>Add New Mission Module</span>
                                <Plus size={12} />
                            </button>
                            <button className="w-full bg-white/10 hover:bg-white/20 p-2 rounded-lg text-left text-[10px] font-bold flex justify-between items-center transition-colors">
                                <span>Verify Metadata CID</span>
                                <LinkIcon size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- GLOBAL MEEBOT CHAT --- */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-6 w-[380px] h-[550px] z-[100] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-white border-4 border-black rounded-[2.5rem] overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,0.2)] flex flex-col h-full">
            <div className="bg-black p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00f0dc] rounded-xl flex items-center justify-center border-2 border-white">
                   <Bot size={22} className="text-black" />
                </div>
                <div>
                  <h2 className="text-white font-black italic uppercase text-sm">MeeBot Assistant</h2>
                  <p className="text-[#00f0dc] text-[8px] font-bold uppercase tracking-widest">Connected to: LabNet</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-red-500"><X size={20} /></button>
            </div>

            <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl font-bold text-xs border-2 ${
                    msg.role === 'user' ? 'bg-black text-white border-black' : 'bg-[#00f0dc] text-black border-black'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-5 bg-gray-50 border-t-4 border-black">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="ลองพิมพ์ /mint เพื่อจำลองการสร้าง NFT..."
                  className="w-full bg-white border-2 border-black p-3 pr-12 rounded-xl text-xs font-bold focus:outline-none shadow-inner"
                />
                <button onClick={handleSendMessage} className="absolute right-2 w-8 h-8 bg-black text-[#00f0dc] rounded-lg flex items-center justify-center">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING BOT BUTTON --- */}
      <div className="fixed bottom-8 right-8 z-[110]">
         <button 
           onClick={() => setIsChatOpen(!isChatOpen)}
           className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-black shadow-2xl hover:scale-110 transition-all ${isChatOpen ? 'bg-black text-[#00f0dc]' : 'bg-[#00f0dc] text-black'}`}
         >
           {isChatOpen ? <X size={28} /> : <Bot size={32} />}
         </button>
      </div>

      <footer className="p-8 bg-black text-white text-center border-t-4 border-white/10">
        <p className="font-black italic text-xl uppercase tracking-tighter">MEECHAIN LAB TERMINAL v1.1</p>
        <p className="text-[9px] font-bold uppercase opacity-40">Contract: {CONTRACT_ADDRESS}</p>
      </footer>
    </div>
  );
};

export default App;