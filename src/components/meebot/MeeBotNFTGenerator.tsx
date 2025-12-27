


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SpinnerIcon, WandIcon } from '../../../components/Icons';
import { trackEvent } from '../../lib/analytics';
import { generateImage, analyzeMeeBotMood, generateSpeech } from '../../lib/services/geminiService';
// FIX: Switched to journeyService (localStorage) to resolve Firestore permission errors.
import { addTimelineEvent } from '../../lib/services/journeyService';
import { mintAiMeeBot } from '../../lib/services/web3Service';
import { ethers } from 'ethers';
import MeeBotBirthCertificate from './MeeBotBirthCertificate';
import { decode, decodeAudioData } from '../../lib/audioUtils';
import { getVoiceForMood } from '../../lib/voiceUtils';


interface GeneratorProps {
    dark?: boolean;
    provider: ethers.BrowserProvider | null;
    connectedAccount: string | null;
    onConnectWallet: () => void;
    onMintSuccess: (result: { metadata: any; txHash: string; }) => void;
    // FIX: Updated network prop type to include chainId, which is required by the child MeeBotBirthCertificate component.
    network: { chainId: number; explorerUrl: string; } | null;
}

// --- Mock/Placeholder Functions ---
const uploadMetadataToIPFSMock = async (metadata: object): Promise<string> => {
    console.log("Simulating metadata upload to IPFS:", metadata);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockCid = "bafkreie" + Math.random().toString(36).substring(2, 15);
    const metadataUri = `ipfs://${mockCid}/metadata.json`;
    console.log("Mock IPFS URI generated:", metadataUri);
    return metadataUri;
};
// --- End Mock Functions ---

const buttonStyles: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'background-color 0.2s, opacity 0.2s',
};


const MeeBotNFTGenerator: React.FC<GeneratorProps> = ({ dark = false, provider, connectedAccount, onConnectWallet, onMintSuccess, network }) => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'uploading' | 'minting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [analyzedMood, setAnalyzedMood] = useState<{ mood: string, message: string } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [mintResult, setMintResult] = useState<{ txHash: string; metadata: any } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const handleReset = useCallback(() => {
    setPrompt('');
    setStatus('idle');
    setError(null);
    setAnalyzedMood(null);
    setGeneratedImage(null);
    setMetadata(null);
    setMintResult(null);
    setShowCertificate(false);
  }, []);

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
    } catch (e) {
      console.error("Failed to play TTS audio:", e);
    }
  }, []);

  useEffect(() => {
    if (mintResult) {
      const birthMessage = "ขอบคุณที่ให้กำเนิดฉันครับ";
      const mood = mintResult.metadata.attributes.find((a: any) => a.trait_type === 'Mood')?.value || 'default';
      const voiceName = getVoiceForMood(mood);
      
      generateSpeech(birthMessage, voiceName)
        .then(playAudio)
        .catch(err => console.error("TTS generation for birth message failed:", err));
    }
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(console.error);
      }
    }
  }, [mintResult, playAudio]);

  const handleGenerate = async () => {
    if (!connectedAccount) {
      onConnectWallet();
      return;
    }
    if (!prompt) return;

    handleReset(); 
    trackEvent('meebot_genesis_initiated', { prompt });
    setError(null);
    
    try {
      setStatus('analyzing');
      const moodData = await analyzeMeeBotMood(prompt);
      setAnalyzedMood(moodData);
      
      // Log the mood analysis event to the user's journey
      await addTimelineEvent({
        type: 'mood-analysis',
        data: {
          ...moodData,
          context: prompt,
          creator: connectedAccount,
        }
      });

      setStatus('generating');
      const imageGenPrompt = `A full-body digital character of a MeeBot based on the idea: "${prompt}". The character should have a clear ${moodData.mood} mood. Centered, high-quality, vibrant colors, on a simple light background.`;
      const imageB64 = await generateImage(imageGenPrompt);
      setGeneratedImage(imageB64);
      trackEvent('meebot_ai_generate_success');

      // Sanitize the prompt to prevent HTML from being rendered as text in the NFT name.
      const sanitizedPrompt = prompt.replace(/<[^>]*>?/gm, '');

      const preparedMetadata = {
        name: `MeeBot: ${sanitizedPrompt.slice(0, 25)}${sanitizedPrompt.length > 25 ? '...' : ''}`,
        description: moodData.message,
        image: `data:image/png;base64,${imageB64}`,
        attributes: [
          { trait_type: "Generation Type", value: "AI" },
          { trait_type: "Mood", value: moodData.mood },
          { trait_type: "Creator", value: connectedAccount || 'Unknown' },
          { trait_type: "Birth Timestamp", value: new Date().toISOString() },
        ]
      };
      setMetadata(preparedMetadata);
      setStatus('idle');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Genesis Failed: ${errorMessage}`);
      setStatus('idle');
      trackEvent('meebot_ai_generate_failed');
    }
  };

  const handleUploadAndMint = async () => {
    if (!metadata) {
      setError("Metadata is not ready.");
      return;
    }
    if (!connectedAccount || !provider) {
      onConnectWallet();
      return;
    }
    setError(null);

    try {
      setStatus('uploading');
      const uri = await uploadMetadataToIPFSMock(metadata);
      
      setStatus('minting');
      const txHash = await mintAiMeeBot(provider, uri);
      
      const result = { txHash, metadata };
      setMintResult(result);
      onMintSuccess(result); // Pass metadata and txHash up for timeline integration
      setShowCertificate(true);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred during minting.");
      setStatus('idle');
    }
  };

  const isLoading = status !== 'idle';

  if (showCertificate && mintResult) {
    return (
        <div className="meebot-demo dark">
             <MeeBotBirthCertificate 
                metadata={mintResult.metadata} 
                txHash={mintResult.txHash}
                network={network} 
                onClose={handleReset} 
                isVisible={true}
            />
        </div>
    );
  }

  return (
    <div className="meebot-demo dark">
      <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#f1f5f9' }}>🧬 MeeBot Genesis Ritual</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          position: 'relative',
          border: `2px dashed #334155`,
          borderRadius: '12px',
          padding: '1rem',
          background: '#1e293b',
          minHeight: '250px',
          display: 'flex',
          alignItems: 'center',
  
          justifyContent: 'center',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          {/* FIX: The conditional check was redundant. Simplified to use the `isLoading` variable directly. */}
          {isLoading ? (
            <div>
              <SpinnerIcon style={{ width: '48px', height: '48px', margin: '0 auto', color: '#a78bfa' }} className="animate-spin" />
              <p style={{ marginTop: '0.5rem', fontWeight: 500, textTransform: 'capitalize', color: '#c4b5fd' }}>
                {status === 'analyzing' ? 'Analyzing soul...' : status === 'generating' ? 'Crafting form...' : status === 'uploading' ? 'Preparing for birth...' : 'Finalizing on-chain...'}
              </p>
            </div>
          ) : generatedImage ? (
            <img
              src={`data:image/png;base64,${generatedImage}`}
              alt="Generated MeeBot"
              style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            />
          ) : (
            <div>
              <WandIcon style={{ width: '48px', height: '48px', margin: '0 auto' }} />
              <p style={{ marginTop: '0.5rem' }}>Describe the soul of your MeeBot to begin.</p>
            </div>
          )}
        </div>
        
        {!generatedImage && (
          <>
            <textarea
              id="prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'a joyful MeeBot with a crystal body and a flower'"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #334155',
                background: '#1e293b',
                color: 'inherit',
                resize: 'vertical'
              }}
            />
            <button onClick={handleGenerate} disabled={isLoading || !prompt} style={{ ...buttonStyles, background: '#0ea5e9', opacity: (isLoading || !prompt) ? 0.5 : 1 }}>
              Begin Genesis
            </button>
          </>
        )}

        {generatedImage && metadata && (
          <div style={{ border: `1px solid #334155`, borderRadius: '8px', padding: '0.75rem', textAlign: 'center', background: '#1e293b' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#cbd5e1' }}>
              <strong>Mood Analyzed:</strong> <span style={{ textTransform: 'capitalize', color: '#a78bfa' }}>{analyzedMood?.mood}</span>
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontStyle: 'italic', color: '#94a3b8' }}>
              <strong>Bot's First Words:</strong> "{analyzedMood?.message}"
            </p>
            <button onClick={handleUploadAndMint} disabled={isLoading} style={{ ...buttonStyles, background: '#10b981' }}>
              {status === 'uploading' ? 'Uploading...' : status === 'minting' ? 'Minting...' : 'Give it Life (Mint NFT)'}
            </button>
          </div>
        )}

        <div style={{minHeight: '40px', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center'}}>
          {error && (
            <div style={{ width: '100%', fontSize: '13px', textAlign: 'center', padding: '8px', borderRadius: '6px', background: '#991b1b', color: '#fca5a5' }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          {generatedImage && (
            <button onClick={handleReset} disabled={isLoading} style={{...buttonStyles, background: '#64748b', fontSize: '14px', padding: '8px 12px', width: 'auto' }}>
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeeBotNFTGenerator;