import React, { useState } from 'react';
import { MeeBotDefaultIcon } from './components/Icons';
import MeeBotStation from './components/MeeBotStation';
import { useWallet, SUPPORTED_NETWORKS } from './hooks/useWallet';
import MeeBotWidget from './components/dashboard/MeeBotWidget';
import NFTGallery from './components/dashboard/NFTGallery';
import BadgeGallery from './components/dashboard/BadgeGallery';
import ProposalGrid from './components/dashboard/ProposalGrid';
import MyJourney from './components/dashboard/MyJourney';
import ImageEditor from './components/ImageEditor';
// FIX: Switched to journeyService (localStorage) to resolve Firestore permission errors.
import { addTimelineEvent } from './src/lib/services/journeyService';


const WrongNetworkBanner: React.FC<{ onSwitch: (chainId: number) => void }> = ({ onSwitch }) => (
  <div className="bg-red-900/80 backdrop-blur-sm text-red-200 p-3 text-center text-sm rounded-lg mb-4 border border-red-700">
    <p><strong>Unsupported Network Detected.</strong></p>
    <p className="mb-2">Please switch to a supported network to interact with MeeBot NFTs.</p>
    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
      {Object.values(SUPPORTED_NETWORKS).map(net => (
         <button
          key={net.chainId}
          onClick={() => onSwitch(net.chainId)}
          className="bg-sky-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-sky-500 transition-colors text-xs"
        >
          Switch to {net.name}
        </button>
      ))}
    </div>
  </div>
);

const ConnectWalletPrompt: React.FC<{ onConnect: () => void }> = ({ onConnect }) => (
    <div className="text-center">
        <div className="meebot-avatar meebot-bounce mx-auto" style={{width: '128px', height: '128px'}}>
            <MeeBotDefaultIcon />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mt-6">Welcome to the MeeChain Dashboard</h2>
        <p className="text-slate-400 mt-2 max-w-md mx-auto">
            Please connect your wallet to view your collection, badges, and governance proposals.
        </p>
        <button
            onClick={onConnect}
            className="mt-6 bg-sky-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-500 transition-colors text-lg"
        >
            Connect Wallet
        </button>
    </div>
);


const App: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { provider, connectedAccount, connectWallet, isCorrectNetwork, switchNetwork, network } = useWallet();

  const handleMintSuccess = async (result: { metadata: any; txHash: string; }) => {
    if (!connectedAccount) return;
    console.log("Mint successful, writing to localStorage and triggering refreshes...");
    try {
        await addTimelineEvent({
            type: 'meebot_birth',
            data: { 
                ...result.metadata, 
                txHash: result.txHash,
                creator: connectedAccount,
            },
        });
        setRefreshKey(prevKey => prevKey + 1);
    } catch(error) {
        console.error("Failed to log mint event to journey:", error);
        // Optionally, show an error to the user
    }
  };

  const handleEvolutionSuccess = async (meebotName: string) => {
    if (!connectedAccount) return;
    console.log("Evolution successful, writing to localStorage and triggering refreshes...");
    try {
        await addTimelineEvent({
            type: 'meebot_evolution',
            data: { 
                name: meebotName,
                creator: connectedAccount,
            },
        });
        setRefreshKey(prevKey => prevKey + 1);
    } catch(error) {
        console.error("Failed to log evolution event to journey:", error);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="min-h-screen text-slate-200 font-sans flex flex-col">
        <div className="max-w-7xl mx-auto p-4 md:p-6 w-full">
          <header className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <MeeBotDefaultIcon className="w-8 h-8"/>
              <span>MeeChain Dashboard</span>
            </h1>
            {connectedAccount ? (
              <div className="bg-slate-800 text-sm text-sky-400 font-mono py-2 px-4 rounded-full flex items-center gap-2">
                {network?.name && <span className="text-purple-400 font-sans text-xs opacity-80">({network.name})</span>}
                <span>{truncateAddress(connectedAccount)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 transition-colors text-sm"
              >
                Connect Wallet
              </button>
            )}
          </header>

          <main className="flex-grow flex flex-col justify-center py-10">
            {connectedAccount ? (
              <>
                {!isCorrectNetwork && (
                    <div className="mb-6">
                        <WrongNetworkBanner onSwitch={switchNetwork} />
                    </div>
                )}
                <MeeBotWidget mood="joyful" message="ยินดีต้อนรับกลับครับ! พร้อมลุยกับ MeeChain แล้วใช่ไหมครับ?" />
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-200">MeeBot AI Image Editor</h2>
                  <ImageEditor 
                    provider={provider} 
                    connectedAccount={connectedAccount} 
                    onConnectWallet={connectWallet}
                    onMintSuccess={() => setRefreshKey(prev => prev + 1)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="col-span-1 md:col-span-2">
                     <NFTGallery 
                        provider={provider} 
                        connectedAccount={connectedAccount} 
                        refreshKey={refreshKey} 
                        network={network}
                        onEvolutionSuccess={handleEvolutionSuccess}
                     />
                  </div>
                  <div className="col-span-1">
                      <BadgeGallery />
                  </div>
                  <div className="col-span-1">
                      <ProposalGrid />
                  </div>
                </div>
                <div className="mt-6">
                  <MyJourney connectedAccount={connectedAccount} refreshKey={refreshKey} />
                </div>
              </>
            ) : (
              <ConnectWalletPrompt onConnect={connectWallet} />
            )}
          </main>
        </div>
      </div>
      <MeeBotStation
        provider={provider}
        connectedAccount={connectedAccount}
        onConnectWallet={connectWallet}
        onMintSuccess={handleMintSuccess}
        onEvolutionSuccess={handleEvolutionSuccess}
        refreshKey={refreshKey}
        network={network}
      />
    </>
  );
};

export default App;