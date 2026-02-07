import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Database, 
  Bot,
  Image as ImageIcon,
  History,
  Send,
  Activity,
  Box,
  X,
  Link as LinkIcon,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

// --- Configuration ---
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const GATEWAY = "tan-familiar-impala-721.mypinata.cloud";

const App = () => {
  const [connectedAccount, setConnectedAccount] = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); // Default Hardhat Account
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [contractStatus, setContractStatus] = useState('LIVE');
  const [isMinting, setIsMinting] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '🧪 ยินดีด้วยครับ! สัญญา MeeChain ประจำการอยู่ที่ ' + CONTRACT_ADDRESS + ' พร้อมให้คุณสั่งรันสคริปต์ Lab แล้ว' }
  ]);
  
  const chatEndRef = useRef(null);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { role: 'user', text: chatInput }]);
    
    if (chatInput.toLowerCase().includes('/mint')) {
        simulateMintProcess();
    } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'bot', text: 'MeeBot กำลังตรวจสอบข้อมูลในสัญญาล่าสุด... ทุกอย่างปกติครับ' }]);
        }, 800);
    }
    setChatInput('');
  };

  const simulateMintProcess = () => {
    setIsMinting(true);
    setMessages(prev => [...prev, { role: 'bot', text: '📡 เชื่อมต่อ Smart Contract ที่ 0xe7f1... Minting in progress...' }]);
    
    setTimeout(() => {
        setIsMinting(false);
        setMessages(prev => [...prev, { 
            role: 'bot', 
            text: '🎉 ภารกิจสำเร็จ! NFT การ์ดถูก Mint เข้ากระเป๋าของคุณแล้วบน Hardhat Network ตรวจสอบได้จากรายการ Records ครับ' 
        }]);
    }, 3000);
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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#00f0dc] rounded-xl flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(0,240,220,0.5)]">
              <Zap className="text-black fill-current animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-tighter italic uppercase underline underline-offset-4 decoration-[#00f0dc]">MEECHAIN LAB</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-[#00f0dc] leading-none">OPERATOR</p>
                <p className="text-sm font-bold">{truncateAddress(connectedAccount)}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
        
        {/* LEFT: LAB STATUS */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black text-white p-6 rounded-[2rem] border-4 border-white/10 shadow-xl">
            <h3 className="text-xs font-black uppercase text-[#00f0dc] mb-4 tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} /> SECURITY CHECK
            </h3>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Contract Health</p>
               <div className="flex items-center gap-2 text-green-500 mb-4">
                  <CheckCircle size={14} />
                  <span className="text-[10px] font-black uppercase">LIVE & VERIFIED</span>
               </div>
               <p className="text-[8px] font-mono text-gray-400 break-all">{CONTRACT_ADDRESS}</p>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Research Stats</h3>
            <div className="space-y-4 font-bold text-[10px]">
              <div className="flex justify-between"><span>Transactions</span><span className="text-black">42</span></div>
              <div className="flex justify-between"><span>XP Pool</span><span className="text-cyan-600">5,000 XP</span></div>
            </div>
          </div>
        </div>

        {/* MIDDLE: ACTION CENTER */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white border-4 border-black rounded-[3rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-4xl font-black italic uppercase mb-4 tracking-tighter">Laboratory Workspace</h2>
            <p className="text-xl font-bold text-gray-600 mb-8 italic">"เชื่อมต่อ IPFS Gateway: {GATEWAY}"</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-100 p-6 rounded-3xl border-2 border-black flex flex-col justify-between">
                    <div>
                        <h4 className="font-black text-sm uppercase mb-2">Manual Mint Control</h4>
                        <p className="text-xs text-gray-500 mb-6 font-bold tracking-tight">สำหรับเรียกใช้ Smart Contract ด้วย CID จากสคริปต์โดยตรง</p>
                    </div>
                    <button 
                        onClick={simulateMintProcess}
                        disabled={isMinting}
                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase shadow-lg transition-all ${isMinting ? 'bg-gray-300' : 'bg-black text-[#00f0dc] hover:-translate-y-1 active:scale-95'}`}
                    >
                        {isMinting ? 'COMMUNICATING WITH CHAIN...' : 'EXECUTE MINT CONTRACT'}
                    </button>
                </div>

                <div className="bg-[#00f0dc] border-4 border-black p-6 rounded-3xl group cursor-pointer relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ImageIcon size={100} />
                    </div>
                    <h4 className="font-black text-sm uppercase mb-2">IPFS Preview</h4>
                    <p className="text-xs font-bold mb-4 opacity-70 leading-tight">ดูรูปการ์ดล่าสุดที่อัปโหลดขึ้น Pinata Gateway</p>
                    <a href={`https://${GATEWAY}/ipfs/your_cid`} target="_blank" className="flex items-center gap-1 font-black text-[10px] underline uppercase">
                        Open Gateway <ExternalLink size={10} />
                    </a>
                </div>
            </div>
          </div>

          {/* Records Section */}
          <div className="bg-black text-white rounded-[2.5rem] p-6 border-4 border-white/10">
              <h3 className="text-lg font-black italic uppercase mb-4 flex items-center gap-2">
                <Database size={20} className="text-[#00f0dc]" /> Lab Experiment Logs
              </h3>
              <div className="space-y-2">
                 {[1, 2].map(i => (
                   <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10 text-[10px]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#00f0dc] rounded-lg flex items-center justify-center text-black font-black">#0{i}</div>
                        <div>
                          <p className="font-black italic">MINT_OPERATION_SUCCESS</p>
                          <p className="text-gray-500 font-mono">0x8a2f...{i}42b</p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-gray-500" />
                   </div>
                 ))}
              </div>
          </div>
        </div>
      </main>

      {/* --- FLOATING CHAT --- */}
      {isChatOpen && (
        <div className="fixed bottom-28 right-6 w-[380px] h-[550px] z-[100]">
          <div className="bg-white border-4 border-black rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="bg-black p-5 flex justify-between items-center">
              <div className="flex items-center gap-3 text-white">
                 <Bot size={22} className="text-[#00f0dc]" />
                 <h2 className="font-black italic uppercase text-sm">MeeBot Lab Assitant</h2>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-red-500"><X size={20}/></button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`p-3 rounded-2xl font-bold text-xs border-2 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-[#00f0dc] text-black border-black'}`}>
                      {msg.text}
                   </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>
            <div className="p-5 border-t-4 border-black">
               <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    className="w-full border-2 border-black p-3 rounded-xl text-xs font-bold"
                    placeholder="พิมพ์ /mint เพื่อเริ่มภารกิจ..."
                  />
                  <button onClick={handleSendMessage} className="absolute right-2 bg-black text-[#00f0dc] p-2 rounded-lg">
                    <Send size={14} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING BUTTON --- */}
      <div className="fixed bottom-8 right-8 z-[110]">
         <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 bg-[#00f0dc] rounded-full border-4 border-black shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
            {isChatOpen ? <X size={28}/> : <Bot size={32}/>}
         </button>
      </div>

    </div>
  );
};

export default App;