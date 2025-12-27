





import React, { useState, useEffect } from 'react';
import { animationClasses } from '../lib/meeBotAnimations';
import { trackEvent } from '../lib/analytics';
import { MeeBotDefaultIcon, MeeBotCrystalIcon } from '../../components/Icons';
import MeeBotNFTGenerator from './meebot/MeeBotNFTGenerator';
import { ethers } from 'ethers';

const personas = [
  { name: 'Default', component: MeeBotDefaultIcon, componentName: 'MeeBotDefaultIcon' },
  { name: 'Crystal Core', component: MeeBotCrystalIcon, componentName: 'MeeBotCrystalIcon' },
];

interface MeeBotPreviewProps {
  provider: ethers.BrowserProvider | null;
  connectedAccount: string | null;
  onConnectWallet: () => void;
  onMintSuccess: (result: { metadata: any; txHash: string; }) => void;
  // FIX: Update network prop type to include chainId, to match the updated useWallet hook and satisfy child component requirements.
  network: { chainId: number; name: string; explorerUrl: string } | null;
}

export default function MeeBotPreview({ provider, connectedAccount, onConnectWallet, onMintSuccess, network }: MeeBotPreviewProps): React.ReactElement {
  const [selectedAnim, setSelectedAnim] = useState(animationClasses[0]);
  const [selectedPersona, setSelectedPersona] = useState(personas[0]);
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('meebot_demo_dark') : null;
    if (saved !== null) setDark(saved === '1');
  }, []);

  const copyCode = async () => {
    const text = `<div className="meebot-avatar ${selectedAnim}">\n  <${selectedPersona.componentName} />\n</div>`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackEvent('meeBot_copy_code', { persona: selectedPersona.name, animation: selectedAnim });
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      if (typeof window !== 'undefined') localStorage.setItem('meebot_demo_dark', next ? '1' : '0');
      trackEvent('meeBot_toggle_dark', { dark: next });
      return next;
    });
  };

  const SelectedBotIcon = selectedPersona.component;

  return (
    <div className={`meebot-demo ${dark ? 'dark' : ''}`}>
      <h2 style={{ marginTop: 0, marginBottom: '2rem' }}>🎨 MeeBot Playground</h2>

      {/* Animation & Persona Playground */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
        <div aria-hidden style={{ textAlign: 'center', flexShrink: 0 }}>
          <div className={`meebot-avatar ${selectedAnim}`}>
            <SelectedBotIcon />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: dark ? '#cbd5e1' : '#64748b' }}>
            Preview
          </div>
        </div>

        <div style={{ flexGrow: 1, minWidth: 280 }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>เลือกสไตล์ (Persona)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {personas.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPersona(p)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: '1px solid',
                    borderColor: selectedPersona.name === p.name ? '#0ea5e9' : (dark ? '#334155' : '#e2e8f0'),
                    background: selectedPersona.name === p.name ? '#0ea5e9' : 'transparent',
                    color: selectedPersona.name === p.name ? '#fff' : 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="anim-select" style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>เลือกแอนิเมชัน</label>
            <select
              id="anim-select"
              value={selectedAnim}
              onChange={(e) => setSelectedAnim(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid', borderColor: dark ? '#334155' : '#e2e8f0', background: dark ? '#1e293b' : '#fff', color: 'inherit' }}
            >
              {animationClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={copyCode}
              className="copy-class"
              style={{
                padding: '8px 12px', borderRadius: 8, border: 'none', background: '#0ea5e9',
                color: '#fff', cursor: 'pointer', flexGrow: 1,
              }}
              aria-label="Copy Code Snippet"
            >
              {copied ? 'Copied ✓' : 'Copy Code'}
            </button>
            <button
              onClick={toggleDark}
              style={{
                padding: '8px 12px', borderRadius: 8, border: '1px solid',
                borderColor: dark ? '#334155' : '#e2e8f0',
                background: dark ? '#0b1220' : '#fff', color: 'inherit',
                cursor: 'pointer',
              }}
              aria-pressed={dark}
            >
              {dark ? 'Dark UI' : 'Light UI'}
            </button>
          </div>

          <div style={{ marginTop: 12, fontSize: 13, color: dark ? '#94a3b8' : '#475569', background: dark ? '#1e293b' : '#f1f5f9', padding: '8px 12px', borderRadius: 6 }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              <code>
                {`<div className="meebot-avatar ${selectedAnim}">\n  <${selectedPersona.componentName} />\n</div>`}
              </code>
            </pre>
          </div>
        </div>
      </div>
      
      {/* NFT Generator Section */}
      <MeeBotNFTGenerator
        dark={dark}
        provider={provider}
        connectedAccount={connectedAccount}
        onConnectWallet={onConnectWallet}
        onMintSuccess={onMintSuccess}
        network={network}
      />

    </div>
  );
}