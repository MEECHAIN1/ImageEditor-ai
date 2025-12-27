

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

export const SUPPORTED_NETWORKS: { [chainId: number]: any } = {
  11155111: {
    chainId: 11155111,
    hexChainId: '0xaa36a7',
    name: 'Sepolia',
    rpcUrls: ['https://rpc.sepolia.org'],
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  },
  1: {
    chainId: 1,
    hexChainId: '0x1',
    name: 'Ethereum',
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  137: {
    chainId: 137,
    hexChainId: '0x89',
    name: 'Polygon',
    rpcUrls: ['https://polygon-rpc.com/'],
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  56: {
    chainId: 56,
    hexChainId: '0x38',
    name: 'BNB Smart Chain',
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  122: {
    chainId: 122,
    hexChainId: '0x7a',
    name: 'Fuse',
    rpcUrls: ['https://rpc.fuse.io'],
    explorerUrl: 'https://explorer.fuse.io',
    nativeCurrency: { name: 'Fuse', symbol: 'FUSE', decimals: 18 },
  }
};


const detectEthereumProvider = (timeout = 1000): Promise<any | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(null);
    }
    if ((window as any).ethereum) {
      resolve((window as any).ethereum);
      return;
    }
    const handleInitialize = () => {
      resolve((window as any).ethereum || null);
    };
    window.addEventListener('ethereum#initialized', handleInitialize, { once: true });
    setTimeout(() => {
      window.removeEventListener('ethereum#initialized', handleInitialize);
      resolve((window as any).ethereum || null);
    }, timeout);
  });
};

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  // FIX: Add chainId to the network state object to make it available to components.
  const [network, setNetwork] = useState<{ chainId: number; name: string; explorerUrl: string; } | null>(null);

  const isCorrectNetwork = chainId !== null && !!SUPPORTED_NETWORKS[chainId];

  const updateWalletState = useCallback(async (ethereum: any, account: string | null) => {
    if (account) {
      const newProvider = new ethers.BrowserProvider(ethereum);
      const networkInfo = await newProvider.getNetwork();
      const currentChainId = Number(networkInfo.chainId);
      setProvider(newProvider);
      setConnectedAccount(account);
      setChainId(currentChainId);
      // FIX: Ensure the fallback network object also includes the chainId.
      setNetwork(SUPPORTED_NETWORKS[currentChainId] || { chainId: currentChainId, name: `Chain ${currentChainId}`, explorerUrl: '' });
    } else {
      setProvider(null);
      setConnectedAccount(null);
      setChainId(null);
      setNetwork(null);
    }
  }, []);

  const switchNetwork = useCallback(async (newChainId: number) => {
    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      const networkToSwitch = SUPPORTED_NETWORKS[newChainId];
      if (!networkToSwitch) {
        alert("Cannot switch to an unknown network.");
        return;
      }
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkToSwitch.hexChainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: networkToSwitch.hexChainId,
                  chainName: networkToSwitch.name,
                  rpcUrls: networkToSwitch.rpcUrls,
                  nativeCurrency: networkToSwitch.nativeCurrency,
                  blockExplorerUrls: [networkToSwitch.explorerUrl],
                },
              ],
            });
          } catch (addError) {
            console.error(`Failed to add ${networkToSwitch.name} network:`, addError);
            alert(`Failed to add the ${networkToSwitch.name} network to your wallet. Please add it manually.`);
          }
        } else {
            console.error("Failed to switch network:", switchError);
            alert("Failed to switch the network. Please do it manually in your wallet.");
        }
      }
    }
  }, []);


  const connectWallet = useCallback(async () => {
    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          await updateWalletState(ethereum, accounts[0]);
        }
      } catch (error: any) {
        console.error("Error connecting wallet:", error);
        let message = "การเชื่อมต่อกระเป๋าเงินล้มเหลว คำขออาจถูกปฏิเสธ";
        if (error.code === 4001) {
          message = "คำขอเชื่อมต่อถูกปฏิเสธ กรุณาอนุมัติคำขอในกระเป๋าเงินของคุณเพื่อเชื่อมต่อ";
        } else if (error.code === -32002) {
          message = "มีคำขอเชื่อมต่อค้างอยู่แล้ว กรุณาตรวจสอบกระเป๋าเงินของคุณ";
        }
        alert(message);
      }
    } else {
      alert("ตรวจไม่พบ MetaMask หรือกระเป๋าเงิน Ethereum อื่น กรุณาติดตั้งส่วนขยายกระเป๋าเงินเพื่อดําเนินการต่อ");
    }
  }, [updateWalletState]);

  useEffect(() => {
    const setupWallet = async () => {
      const ethereum = await detectEthereumProvider(500);
      if (ethereum) {
        const newProvider = new ethers.BrowserProvider(ethereum);
        const signers = await newProvider.listAccounts();
        if (signers.length > 0 && signers[0]) {
            const address = await signers[0].getAddress();
            await updateWalletState(ethereum, address);
        }

        const handleAccountsChanged = (accounts: string[]) => {
            updateWalletState(ethereum, accounts[0] || null);
        };
        
        const handleChainChanged = () => {
          // Reload the page to ensure all state is correctly re-initialized.
          window.location.reload();
        };
        
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);

        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
            ethereum.removeListener('chainChanged', handleChainChanged);
          }
        }
      }
    };
    setupWallet();
  }, [updateWalletState]);

  return { provider, connectedAccount, connectWallet, isCorrectNetwork, switchNetwork, network };
}