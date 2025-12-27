



import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CloseIcon, PlayIcon, SoundWaveIcon } from '../../../components/Icons';
import { CONTRACT_ADDRESSES } from '../../lib/services/web3Service';
import { getVoiceForMood } from '../../lib/voiceUtils';
import { generateSpeech } from '../../lib/services/geminiService';
import { decode, decodeAudioData } from '../../lib/audioUtils';

interface CertificateProps {
    metadata: any;
    txHash?: string;
    tokenId?: string;
    network: { chainId: number, explorerUrl: string } | null;
    onClose: () => void;
    isVisible: boolean;
}

const MeeBotBirthCertificate: React.FC<CertificateProps> = ({ metadata, txHash, tokenId, network, onClose, isVisible }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const getAttribute = (trait: string) => metadata.attributes?.find((a: any) => a.trait_type === trait)?.value || 'N/A';
    
    const playAudio = useCallback(async (base64Audio: string) => {
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const ctx = audioContextRef.current;
            await ctx.resume(); // Ensure context is running
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

    const handlePlayFirstWords = useCallback(async () => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        try {
            const mood = getAttribute('Mood');
            const voice = getVoiceForMood(mood);
            const audioB64 = await generateSpeech("ขอบคุณที่ให้กำเนิดฉันครับ", voice);
            await playAudio(audioB64);
        } catch (error) {
            console.error("Failed to generate/play MeeBot's first words:", error);
            alert("Could not generate audio for this MeeBot.");
            setIsSpeaking(false);
        }
    }, [isSpeaking, getAttribute, playAudio]);

    if (!isVisible) return null;

    const birthTimestamp = getAttribute('Birth Timestamp');
    const formattedDate = birthTimestamp !== 'N/A' ? new Date(birthTimestamp).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A';
    const creatorAddress = getAttribute('Creator');
    const evolutionStage = getAttribute('Evolution Stage');

    let explorerUrl: string | null = null;
    if (network) {
        if (txHash) {
            explorerUrl = `${network.explorerUrl}/tx/${txHash}`;
        } else if (tokenId && network.chainId) {
            const contractAddress = CONTRACT_ADDRESSES[network.chainId];
            if(contractAddress) {
                explorerUrl = `${network.explorerUrl}/token/${contractAddress}?a=${tokenId}`;
            }
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-[meebot-fadeIn_200ms_ease-out_both]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl w-[420px] max-w-[90vw] text-slate-200 overflow-hidden animate-[meebot-slideUp_360ms_ease-out_both]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 bg-slate-800/50 text-center relative">
                    <h1 className="text-xl font-bold text-purple-300">MeeBot Birth Certificate</h1>
                    <p className="text-xs text-slate-400">A new digital life has been born.</p>
                    <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </header>

                <div className="p-5 space-y-4">
                    <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden">
                        <img src={metadata.image} alt={metadata.name} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-white truncate" title={metadata.name}>{metadata.name}</h2>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-800 rounded p-2">
                            <span className="block text-xs text-slate-500 uppercase">Mood</span>
                            <span className="text-purple-300 font-semibold truncate">{getAttribute('Mood')}</span>
                        </div>
                        <div className="bg-slate-800 rounded p-2">
                            <span className="block text-xs text-slate-500 uppercase">Creator</span>
                            <span className="text-sky-300 font-mono truncate" title={creatorAddress}>{creatorAddress}</span>
                        </div>
                    </div>

                     <div className="bg-slate-800 rounded p-2 text-sm">
                        <span className="block text-xs text-slate-500 uppercase">Born On</span>
                        <span className="text-slate-200 font-semibold truncate">{formattedDate}</span>
                    </div>

                    {evolutionStage !== 'N/A' && (
                        <div className="bg-green-900/30 border border-green-700 rounded p-2 text-sm text-center">
                            <span className="block text-xs text-green-400 uppercase">Evolution History</span>
                            <span className="text-green-200 font-bold text-base">Reached Stage {evolutionStage} 🎇</span>
                        </div>
                    )}

                    <button 
                        onClick={handlePlayFirstWords} 
                        disabled={isSpeaking}
                        className="w-full bg-sky-600 text-white px-3 py-3 rounded-md text-sm font-semibold hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isSpeaking 
                            ? <><SoundWaveIcon className="w-5 h-5 animate-pulse" /> Speaking First Words...</>
                            : <><PlayIcon className="w-5 h-5" /> Play First Words</>
                        }
                    </button>
                    
                    {explorerUrl && (
                        <div className="bg-slate-800 rounded p-2 text-xs text-center">
                            <span className="block text-slate-500 uppercase mb-1">Certificate ID</span>
                            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 font-mono break-all hover:underline">
                                {txHash ? txHash.slice(0, 10) : `Token #${tokenId}`}...
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeeBotBirthCertificate;