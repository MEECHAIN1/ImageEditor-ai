



import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { getOwnedMeeBots } from '../../lib/services/web3Service';
import { generateSpeech, editImage } from '../../lib/services/geminiService';
import { decode, decodeAudioData } from '../../lib/audioUtils';
import { getVoiceForMood } from '../../lib/voiceUtils';
import { SpinnerIcon, PlayIcon, SoundWaveIcon, CertificateIcon, DnaIcon } from '../../../components/Icons';
import MeeBotBirthCertificate from '../meebot/MeeBotBirthCertificate';
import { ImageFile } from '../../../types';

interface NFT {
  tokenId: string;
  metadata: {
    name: string;
    description: string;
    image: string; // This can be a data URL or IPFS link
    attributes: { trait_type: string; value: any }[];
  }
}

interface NFTGalleryProps {
  provider: ethers.BrowserProvider | null;
  connectedAccount: string | null;
  refreshKey: number;
  network: any | null;
  onEvolutionSuccess: (meebotName: string) => void;
}

const DashboardWidget: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-4 md:p-6 ${className}`}>
    <h2 className="text-xl font-semibold mb-4 text-slate-200">{title}</h2>
    <div className="h-full">
        {children}
    </div>
  </div>
);


const MeeBotCard: React.FC<{ 
    nft: NFT, 
    onViewCertificate: (nft: NFT) => void,
    onEvolve: (nft: NFT) => Promise<void>,
    isEvolving: boolean
}> = ({ nft, onViewCertificate, onEvolve, isEvolving }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const getAttribute = (trait: string) => nft.metadata.attributes?.find(a => a.trait_type === trait)?.value || 'N/A';
    
    const playAudio = useCallback(async (base64Audio: string) => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const ctx = audioContextRef.current;
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
            source.onended = () => setIsSpeaking(false);
        } catch (e) {
            console.error("Failed to play TTS audio:", e);
            setIsSpeaking(false);
        }
    }, []);

    const handlePlayFirstWords = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSpeaking || isEvolving) return;
        setIsSpeaking(true);
        try {
            const mood = getAttribute('Mood');
            const voice = getVoiceForMood(mood);
            const audioB64 = await generateSpeech("ขอบคุณที่ให้กำเนิดฉันครับ", voice);
            await playAudio(audioB64);
        } catch (error) {
            console.error("Failed to play MeeBot's first words:", error);
            alert("Could not generate audio for this MeeBot.");
            setIsSpeaking(false);
        }
    };
    
    const birthTimestamp = getAttribute('Birth Timestamp');
    const formattedDate = birthTimestamp !== 'N/A' ? new Date(birthTimestamp).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short'}) : 'N/A';
    const evolutionStage = getAttribute('Evolution Stage');

    return (
        <div className={`bg-slate-900/50 rounded-lg p-3 space-y-3 border border-slate-700 flex flex-col transition-all duration-300 ${isEvolving ? 'border-purple-500 scale-105 shadow-lg shadow-purple-900/50' : 'hover:scale-105 hover:border-purple-500/50'}`}>
            <div className="aspect-square bg-slate-800 rounded-md overflow-hidden relative">
                <img src={nft.metadata.image} alt={nft.metadata.name} className="w-full h-full object-cover"/>
                {isEvolving && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-2">
                        <SpinnerIcon className="w-8 h-8 text-purple-400 animate-spin" />
                        <p className="text-purple-300 text-sm font-semibold mt-2">Evolving...</p>
                    </div>
                )}
            </div>
            <div className="space-y-2 flex-grow">
                <h3 className="text-base font-bold text-white truncate" title={nft.metadata.name}>{nft.metadata.name}</h3>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-slate-800 rounded p-1.5">
                        <span className="block text-slate-500 uppercase">Mood</span>
                        <span className="text-purple-300 font-semibold truncate">{getAttribute('Mood')}</span>
                    </div>
                     <div className="bg-slate-800 rounded p-1.5">
                        <span className="block text-slate-500 uppercase">Stage</span>
                        <span className="text-green-300 font-semibold truncate">{evolutionStage === 'N/A' ? 1 : evolutionStage}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 items-center gap-2 mt-auto">
                <button 
                    onClick={handlePlayFirstWords} 
                    disabled={isSpeaking || isEvolving}
                    className="col-span-1 bg-sky-600 text-white p-2 rounded-md text-xs font-semibold hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center"
                    title="Play First Words"
                >
                    {isSpeaking 
                        ? <SoundWaveIcon className="w-4 h-4 animate-pulse" />
                        : <PlayIcon className="w-4 h-4" />
                    }
                </button>
                 <button 
                    onClick={() => onViewCertificate(nft)}
                    disabled={isEvolving}
                    className="col-span-1 bg-slate-600 text-white p-2 rounded-md text-xs font-semibold hover:bg-slate-500 transition-colors disabled:bg-slate-600 flex items-center justify-center"
                    title="View Certificate"
                >
                    <CertificateIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onEvolve(nft)}
                    disabled={isEvolving}
                    className="col-span-1 bg-purple-600 text-white p-2 rounded-md text-xs font-semibold hover:bg-purple-500 transition-colors disabled:bg-slate-600 flex items-center justify-center"
                    title="Evolve MeeBot"
                >
                    <DnaIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ provider, connectedAccount, refreshKey, network, onEvolutionSuccess }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodFilter, setMoodFilter] = useState('all');
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [evolvingNftId, setEvolvingNftId] = useState<string | null>(null);

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
        ownedNfts.sort((a: NFT, b: NFT) => {
            const dateA = new Date(a.metadata.attributes.find(attr => attr.trait_type === "Birth Timestamp")?.value || 0).getTime();
            const dateB = new Date(b.metadata.attributes.find(attr => attr.trait_type === "Birth Timestamp")?.value || 0).getTime();
            return dateB - dateA;
        });
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

  const handleEvolve = async (nftToEvolve: NFT) => {
    if (evolvingNftId) return;
    setEvolvingNftId(nftToEvolve.tokenId);
    setError(null);
    try {
        const imageB64 = nftToEvolve.metadata.image.split(',')[1];
        if (!imageB64) {
            throw new Error("Could not extract image data for evolution.");
        }
        const imageFile: ImageFile = { base64: imageB64, mimeType: 'image/png', name: 'meebot.png' };
        
        const evolutionPrompt = "Add a glowing cosmic aura and small crystalline growths on the shoulders, signifying a powerful evolution.";
        const newImageB64 = await editImage(imageFile, evolutionPrompt);

        // Update the NFT state locally
        setNfts(currentNfts => currentNfts.map(nft => {
            if (nft.tokenId === nftToEvolve.tokenId) {
                const existingAttributes = nft.metadata.attributes.filter(attr => attr.trait_type !== "Evolution Stage");
                const currentStage = Number(nft.metadata.attributes.find(attr => attr.trait_type === "Evolution Stage")?.value || 1);
                
                return {
                    ...nft,
                    metadata: {
                        ...nft.metadata,
                        image: `data:image/png;base64,${newImageB64}`,
                        attributes: [
                            ...existingAttributes,
                            { trait_type: "Evolution Stage", value: currentStage + 1 }
                        ]
                    }
                };
            }
            return nft;
        }));

        onEvolutionSuccess(nftToEvolve.metadata.name);

    } catch (err) {
        console.error("Evolution failed:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred during evolution.");
    } finally {
        setEvolvingNftId(null);
    }
  };
  
  const uniqueMoods = useMemo(() => {
    const moods = new Set(
        nfts
            .map(nft => nft.metadata.attributes?.find(a => a.trait_type === 'Mood')?.value)
            .filter((mood): mood is string => !!mood)
    );
    return Array.from(moods);
  }, [nfts]);

  const filteredNfts = useMemo(() => {
      if (moodFilter === 'all') return nfts;
      return nfts.filter(nft => {
          const mood = nft.metadata.attributes?.find(a => a.trait_type === 'Mood')?.value;
          return mood === moodFilter;
      });
  }, [nfts, moodFilter]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full py-10">
          <SpinnerIcon className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="ml-3 text-slate-400">กำลังโหลดคอลเลกชัน...</p>
        </div>
      );
    }
  
    if (error && !evolvingNftId) { // Only show general error if not in the middle of an evolution
       return (
          <div className="flex justify-center items-center h-full text-center py-10 bg-red-900/20 rounded-lg">
            <div>
                <p className="text-red-300"><strong>เกิดข้อผิดพลาด</strong></p>
                <p className="text-red-400 text-sm mt-1 px-4">{error}</p>
            </div>
          </div>
        );
    }
  
    if (nfts.length === 0) {
      return (
        <div className="flex justify-center items-center h-full text-center py-10 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
            <div>
                <p className="text-slate-400 font-medium">คุณยังไม่มี MeeBot ที่ถือกำเนิดขึ้น</p>
                <p className="text-slate-500 text-sm mt-1">ไปที่สถานี MeeBot เพื่อสร้างและมิ้นต์ได้เลย!</p>
            </div>
        </div>
      );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 {error && evolvingNftId && (
                    <p className="text-red-400 text-xs">Evolution failed: {error}</p>
                 )}
                <select 
                    value={moodFilter} 
                    onChange={e => setMoodFilter(e.target.value)}
                    className="ml-auto bg-slate-700 border border-slate-600 rounded-md py-1 px-3 text-sm focus:ring-sky-500 focus:border-sky-500"
                >
                    <option value="all">All Moods</option>
                    {uniqueMoods.map(mood => <option key={mood} value={mood}>{mood}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNfts.map((nft) => (
                    <MeeBotCard 
                        key={nft.tokenId} 
                        nft={nft} 
                        onViewCertificate={setSelectedNft}
                        onEvolve={handleEvolve}
                        isEvolving={evolvingNftId === nft.tokenId}
                    />
                ))}
            </div>
            {filteredNfts.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>ไม่พบ MeeBot ที่มีอารมณ์ '{moodFilter}'</p>
                </div>
            )}
        </div>
    );
  };

  return (
    <>
        <DashboardWidget title={`💎 Hall of Origins (${nfts.length})`}>
        {renderContent()}
        </DashboardWidget>
        {selectedNft && (
            <MeeBotBirthCertificate 
                metadata={selectedNft.metadata}
                tokenId={selectedNft.tokenId}
                network={network}
                onClose={() => setSelectedNft(null)}
                isVisible={!!selectedNft}
            />
        )}
    </>
  );
};

export default NFTGallery;