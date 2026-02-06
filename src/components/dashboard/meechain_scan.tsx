import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ExternalLink, 
  Bot, 
  Search, 
  Grid, 
  ShieldCheck, 
  Activity,
  Image as ImageIcon,
  ChevronRight,
  Database
} from 'lucide-react';

const GATEWAY = "tan-familiar-impala-721.mypinata.cloud";
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const App = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  // จำลองการดึงข้อมูลจาก Contract และ IPFS (เพราะ Hardhat อยู่คนละ Network)
  useEffect(() => {
    const loadNfts = async () => {
      setLoading(true);
      // ในระบบจริงจะใช้ ethers.js ดึงจาก CONTRACT_ADDRESS
      // นี่คือข้อมูลจำลองจาก CID ที่คุณธณวัฒน์ Mint สำเร็จล่าสุด
      const mintedNfts = [
        {
          id: 1,
          name: "MeeChain Genesis Card #01",
          image: `https://${GATEWAY}/ipfs/QmXQsQNxUrrjtS5YVbpbcRdXU3BsDCEqaHLjtpUMWNvgpe`,
          metadata: `https://${GATEWAY}/ipfs/QmeJykeLo3uBD3fSyHrJZxxNBseGaJr2xKEZZYJfKsJhZ2`,
          owner: "0xf39F...2266",
          rarity: "Legendary",
          mission: "Genesis Onboarding"
        }
      ];

      setTimeout(() => {
        setNfts(mintedNfts);
        setLoading(false);
      }, 1500);
    };

    loadNfts();
  }, []);

  return (
    <div className="min-h-screen bg-[#00f0dc] font-sans" 
         style={{ backgroundImage: `linear-gradient(rgba(0, 240, 220, 0.95), rgba(0, 240, 220, 0.95)), url("https://www.transparenttextures.com/patterns/carbon-fibre.png")` }}>

      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-50 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]"></div>

      {/* Header */}
      <nav className="bg-black text-white p-6 border-b-4 border-black/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-[#00f0dc] rounded-2xl flex items-center justify-center border-2 border-white shadow-[0_0_20px_rgba(0,240,220,0.5)]">
              <Zap className="text-black fill-current animate-pulse" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter italic uppercase group-hover:text-[#00f0dc] transition-colors">MEESCAN</h1>
              <p className="text-[10px] font-bold text-[#00f0dc] uppercase tracking-[0.3em]">MeeChain Explorer</p>
            </div>
          </div>

          <div className="hidden md:flex bg-white/10 px-4 py-2 rounded-2xl border border-white/20 items-center gap-3">
             <Search size={16} className="text-gray-400" />
             <input type="text" placeholder="Search by Address / Token ID" className="bg-transparent border-none outline-none text-xs font-bold w-64" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase bg-[#00f0dc] text-black px-2 py-1 rounded">LabNet: Online</span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
               <Bot size={20} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12">

        {/* Stats Section */}
        <header className="mb-12">
           <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-black underline decoration-white decoration-8 underline-offset-8">Collection Gallery</h2>
           <p className="font-bold text-black/60 max-w-xl">ตรวจสอบบันทึกผลการทดลอง NFT ทั้งหมดที่ถูกสร้างขึ้นในห้องปฏิบัติการ MeeChain Lab</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="w-16 h-16 border-8 border-black border-t-[#00f0dc] rounded-full animate-spin"></div>
             <p className="mt-6 font-black uppercase italic tracking-widest text-black/40">Synchronizing with IPFS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {nfts.map((nft) => (
              <div key={nft.id} className="bg-white border-4 border-black rounded-[2.5rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform group">
                {/* NFT Image */}
                <div className="aspect-square bg-black relative overflow-hidden border-b-4 border-black">
                   <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute top-4 left-4 bg-black text-[#00f0dc] px-3 py-1 rounded-xl font-black text-[10px] uppercase">
                     #{nft.id}
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <a href={nft.metadata} target="_blank" className="w-full bg-[#00f0dc] text-black py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
                        View Metadata <ExternalLink size={14} />
                      </a>
                   </div>
                </div>

                {/* NFT Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-black text-xl italic leading-tight uppercase mb-1">{nft.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">{nft.mission}</span>
                      <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{nft.rarity}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-dashed border-gray-100 space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Owner</span>
                       <span className="text-[10px] font-mono font-bold text-black">{nft.owner}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Network</span>
                       <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-1">
                         <ShieldCheck size={10} /> Verified
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-black/5 border-4 border-dashed border-black/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 opacity-50">
                 <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center mb-4">
                    <Plus className="text-gray-400" />
                 </div>
                 <p className="font-black text-[10px] uppercase text-gray-400 tracking-widest">Waiting for next experiment</p>
              </div>
            ))}
          </div>
        )}

        {/* Global Stats Footer */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-black text-white p-8 rounded-[2rem] border-4 border-[#00f0dc]/30 shadow-2xl relative overflow-hidden">
              <Activity className="absolute -right-4 -bottom-4 opacity-10" size={100} />
              <p className="text-[10px] font-black text-[#00f0dc] uppercase tracking-widest mb-2">Total Supply</p>
              <h4 className="text-4xl font-black italic">12,450 <span className="text-xs font-normal">Cards</span></h4>
           </div>
           <div className="bg-white border-4 border-black p-8 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Database className="text-gray-300 mb-4" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">IPFS Nodes</p>
              <h4 className="text-3xl font-black italic">Active</h4>
           </div>
           <div className="bg-[#00f0dc] border-4 border-black p-8 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <ShieldCheck className="text-black/30 mb-4" />
              <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Contract Status</p>
              <h4 className="text-3xl font-black italic text-black">Verified</h4>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-20 p-12 bg-black text-white text-center border-t-8 border-[#00f0dc]">
         <div className="max-w-7xl mx-auto space-y-4">
            <div className="font-black text-3xl italic tracking-tighter uppercase underline decoration-[#00f0dc] decoration-4 underline-offset-4">MEECHAIN EXPLORER</div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.5em]">Transparency • Proof of Mission • Decentralized</p>
            <p className="text-[10px] text-gray-600 font-mono">Contract: {CONTRACT_ADDRESS}</p>
         </div>
      </footer>

    </div>
  );
};

const Plus = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default App;