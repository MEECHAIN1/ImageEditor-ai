import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import { getOwnedMeeBots } from '../services/web3Service';
import { SpinnerIcon } from './Icons';
import NFTViewer from '../src/components/NFTViewer'; // Import the new viewer
import { parts } from '../src/lib/meebotParts'; // Import parts for dynamic filters

interface NFT {
  tokenId: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: { trait_type: string; value: string }[];
  }
}

interface NFTGalleryProps {
  provider: ethers.BrowserProvider;
  connectedAccount: string;
  refreshKey: number;
}

const traitValue = (item: NFT, trait: string) =>
  item.metadata.attributes?.find(a => a.trait_type.toLowerCase() === trait.toLowerCase())?.value || '—';


const NFTGallery: React.FC<NFTGalleryProps> = ({ provider, connectedAccount, refreshKey }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [bodyFilter, setBodyFilter] = useState<string>('all');
  const [effectFilter, setEffectFilter] = useState<string>('all');

  useEffect(() => {
    const loadNFTs = async () => {
      if (!provider || !connectedAccount) {
        setIsLoading(false);
        setNfts([]);
        return;
      };
      
      setIsLoading(true);
      setError(null);

      try {
        const ownedNfts = await getOwnedMeeBots(provider);
        setNfts(ownedNfts);
      } catch (err) {
        console.error("Failed to load NFTs:", err);
        setError(err instanceof Error ? err.message : "ไม่สามารถโหลดคอลเลกชัน NFT ของคุณได้");
      } finally {
        setIsLoading(false);
      }
    };

    loadNFTs();
  }, [provider, connectedAccount, refreshKey]);

  const filteredNfts = useMemo(() => {
    return nfts.filter(i => {
      const body = traitValue(i, 'BODY');
      const effect = traitValue(i, 'EFFECT');
      const okBody = bodyFilter === 'all' || body === bodyFilter;
      const okEffect = effectFilter === 'all' || effect === effectFilter;
      return okBody && okEffect;
    });
  }, [nfts, bodyFilter, effectFilter]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <SpinnerIcon className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="ml-3 text-slate-500">กำลังโหลดคอลเลกชัน...</p>
      </div>
    );
  }

  if (error) {
     return (
        <div className="text-center py-10 bg-red-900/10 rounded-lg border border-red-800/20">
          <p className="text-red-400 text-sm"><strong>เกิดข้อผิดพลาด</strong></p>
          <p className="text-red-400/80 text-xs mt-1 px-4">{error}</p>
        </div>
      );
  }

  if (nfts.length === 0) {
    return (
       <div className="text-center py-10 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">คุณยังไม่มี MeeBot NFTs</p>
          <p className="text-slate-400 text-sm mt-1">ไปที่แท็บ 'Playground' เพื่อสร้างและมิ้นต์ได้เลย!</p>
        </div>
    );
  }


  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-700">My MeeBot Collection ({nfts.length})</h2>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="body-filter" className="block text-xs font-medium text-slate-500 mb-1">Body</label>
          <select id="body-filter" value={bodyFilter} onChange={e => setBodyFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
            <option value="all">All Bodies</option>
            {parts.body.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="effect-filter" className="block text-xs font-medium text-slate-500 mb-1">Effect</label>
          <select id="effect-filter" value={effectFilter} onChange={e => setEffectFilter(e.target.value)} className="w-full bg-white border border-slate-300 rounded-md p-2 text-sm focus:ring-sky-500 focus:border-sky-500">
            <option value="all">All Effects</option>
            {parts.effect.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
      </div>

        {filteredNfts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
                {filteredNfts.map((nft) => (
                    <NFTViewer key={nft.tokenId} metadata={nft.metadata} />
                ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-slate-50 rounded-lg">
                <p className="text-slate-500">ไม่พบ MeeBot ที่ตรงกับเงื่อนไข</p>
            </div>
        )}
    </div>
  );
};

export default NFTGallery;