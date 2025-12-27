



import React, { useState } from 'react';
import MeeBotWelcome from './meebot/MeeBotWelcome';
import { MeeBotDefaultIcon } from '../../components/Icons';
import MeeBotPreview from './MeeBotPreview';
import MeeBotLiveChat from './meebot/MeeBotLiveChat';
import NFTGallery from './dashboard/NFTGallery';
import { ethers } from 'ethers';

interface MeeBotStationProps {
  provider: ethers.BrowserProvider | null;
  connectedAccount: string | null;
  onConnectWallet: () => void;
  onMintSuccess: (result: { metadata: any; txHash: string; }) => void;
  onEvolutionSuccess: (meebotName: string) => void;
  refreshKey: number;
  network: any | null;
}

type Tab = 'chat' | 'playground' | 'collection';

export default function MeeBotStation({ provider, connectedAccount, onConnectWallet, onMintSuccess, onEvolutionSuccess, refreshKey, network }: MeeBotStationProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <MeeBotLiveChat />;
      case 'playground':
        return (
          <MeeBotPreview
            provider={provider}
            connectedAccount={connectedAccount}
            onConnectWallet={onConnectWallet}
            onMintSuccess={onMintSuccess}
            network={network}
          />
        );
      case 'collection':
        if (provider && connectedAccount) {
          return (
            <div className="bg-slate-800 p-4 rounded-lg">
                <NFTGallery
                    provider={provider}
                    connectedAccount={connectedAccount}
                    refreshKey={refreshKey}
                    network={network}
                    onEvolutionSuccess={onEvolutionSuccess}
                />
            </div>
          );
        } else {
          return (
            <div className="text-center py-10 text-slate-500">
              <p>กรุณาเชื่อมต่อ Wallet เพื่อดูคอลเลกชันของคุณ</p>
              <button onClick={onConnectWallet} className="mt-4 bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 transition-colors text-sm">
                Connect Wallet
              </button>
            </div>
          );
        }
      default:
        return null;
    }
  };


  return (
    <>
      {/* Floating button visible on all pages */}
      <button
        aria-label="Open MeeBot"
        className="meebot-floating-button"
        onClick={() => setOpen((v) => !v)}
        title="คุยกับ MeeBot"
      >
        <div className="meebot-avatar meebot-pulse">
          <MeeBotDefaultIcon />
        </div>
      </button>

      {/* Slide-in panel */}
      {open && (
        <div className="meebot-panel meebot-slideUp" role="dialog" aria-modal="true">
          <div className="header">
            <MeeBotWelcome />
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close MeeBot"
                style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="meebot-tabs meebot-demo dark">
            <button
              className={`meebot-tab-button ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`meebot-tab-button ${activeTab === 'playground' ? 'active' : ''}`}
              onClick={() => setActiveTab('playground')}
            >
              Genesis
            </button>
            <button
              className={`meebot-tab-button ${activeTab === 'collection' ? 'active' : ''}`}
              onClick={() => setActiveTab('collection')}
            >
              Gallery
            </button>
          </div>
          
          <div className="content-nopad">
             {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}