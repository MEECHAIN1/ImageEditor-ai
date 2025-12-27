import { ethers } from "ethers";

// Placeholder for mainnet contracts, indicating that minting is not yet live.
const PLACEHOLDER_ADDRESS = ethers.getAddress("0x000000000000000000000000000000000000dEaD");

export const CONTRACT_ADDRESSES: { [chainId: number]: string } = {
    // Sepolia Testnet - Live for testing
    [11155111]: ethers.getAddress("0x247b882195a3358547432aab8eaa2825126a4f50"),
    // Mainnets - Placeholders
    [1]: PLACEHOLDER_ADDRESS,          // Ethereum
    [137]: PLACEHOLDER_ADDRESS,       // Polygon
    [56]: PLACEHOLDER_ADDRESS,        // BNB Smart Chain
    [122]: PLACEHOLDER_ADDRESS,       // Fuse
};

const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

// The ABI is now included directly in the source code to bypass module resolution issues.
const MEEBOT_NFT_ABI = [
    {
      "inputs": [ { "internalType": "address", "name": "to", "type": "address" } ],
      "name": "safeMint", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    {
      "inputs": [ { "internalType": "string", "name": "tokenURI", "type": "string" } ],
      "name": "mintMeeBot", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    {
      "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ],
      "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function"
    },
    {
      "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" } ],
      "name": "tokenOfOwnerByIndex", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function"
    },
    {
      "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ],
      "name": "tokenURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function"
    }
  ];

// We will cache the ABI to avoid re-processing.
let contractAbi: any[] | null = null;

/**
 * Provides the contract ABI. It's now stored as a constant within this file.
 * @returns A promise that resolves with the ABI array.
 */
async function getContractAbi(): Promise<any[]> {
    if (!contractAbi) {
        contractAbi = MEEBOT_NFT_ABI;
    }
    return contractAbi;
}

/**
 * Mints a new MeeBot NFT to the signer's address.
 * @param provider An ethers BrowserProvider instance from the user's wallet.
 * @returns A promise that resolves with the transaction hash.
 */
export async function mintMeeBot(provider: ethers.BrowserProvider): Promise<string> {
  if (!provider) {
    throw new Error("Wallet provider is not available. Please connect your wallet.");
  }

  try {
    const { chainId } = await provider.getNetwork();
    const contractAddress = CONTRACT_ADDRESSES[Number(chainId)];
    if (!contractAddress) {
        throw new Error("Unsupported network. Contract not deployed on this chain.");
    }
    if (contractAddress === PLACEHOLDER_ADDRESS) {
        throw new Error("Minting is not yet enabled on this network. Please switch to Sepolia to mint.");
    }

    const abi = await getContractAbi();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    console.log("Initiating mint transaction for:", await signer.getAddress());
    const tx = await contract.safeMint(await signer.getAddress());
    
    console.log("Transaction sent, waiting for confirmation...", tx.hash);
    await tx.wait(); // Wait for the transaction to be mined
    
    console.log("Transaction confirmed:", tx.hash);
    return tx.hash;
  } catch (error: any) {
    console.error("Error during minting process:", error);
    
    // Improved error handling to provide a clearer message for common network issues.
    if (typeof error.message === 'string' && error.message.includes("HTTP Status code: -1")) {
        throw new Error("Could not connect to the blockchain network. Please check your internet connection and wallet settings (e.g., ensure you are on the Sepolia Testnet).");
    }

    const reason = error?.reason || error?.data?.message || error?.message || "An unknown error occurred.";
    throw new Error(`Minting failed: ${reason}`);
  }
}

/**
 * Mints a new AI-generated MeeBot NFT with a specific tokenURI.
 * @param provider An ethers BrowserProvider instance from the user's wallet.
 * @param tokenURI The IPFS URI for the NFT metadata.
 * @returns A promise that resolves with the transaction hash.
 */
export async function mintAiMeeBot(provider: ethers.BrowserProvider, tokenURI: string): Promise<string> {
  if (!provider) {
    throw new Error("Wallet provider is not available. Please connect your wallet.");
  }
   if (!tokenURI || !tokenURI.startsWith("ipfs://")) {
    throw new Error("A valid IPFS Token URI is required to mint.");
  }

  try {
    const { chainId } = await provider.getNetwork();
    const contractAddress = CONTRACT_ADDRESSES[Number(chainId)];
    if (!contractAddress) {
        throw new Error("Unsupported network. Contract not deployed on this chain.");
    }
    if (contractAddress === PLACEHOLDER_ADDRESS) {
        throw new Error("Minting is not yet enabled on this network. Please switch to Sepolia to mint.");
    }

    const abi = await getContractAbi();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    console.log(`Initiating mint for AI MeeBot with URI: ${tokenURI}`);
    // The contract's `mintMeeBot` function is expected to mint to the transaction signer (msg.sender)
    const tx = await contract.mintMeeBot(tokenURI);
    
    console.log("Transaction sent, waiting for confirmation...", tx.hash);
    await tx.wait();
    
    console.log("Transaction confirmed:", tx.hash);
    return tx.hash;
  } catch (error: any)
   {
    console.error("Error during AI MeeBot minting process:", error);
    const reason = error?.reason || error?.data?.message || error?.message || "An unknown error occurred.";
    throw new Error(`Minting failed: ${reason}`);
  }
}

/**
 * Robustly fetches a URI from IPFS using multiple public gateways as fallbacks.
 * @param ipfsUri The IPFS URI (e.g., "ipfs://...")
 * @returns A promise that resolves with the fetch Response object.
 */
async function fetchFromIPFS(ipfsUri: string): Promise<Response> {
    if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
        // If it's already an HTTP URL, fetch it directly with a timeout.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        try {
            const response = await fetch(ipfsUri, { signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
        } catch(e) {
            clearTimeout(timeoutId);
            throw e;
        }
    }

    const cid = ipfsUri.replace("ipfs://", "");
    for (const gateway of IPFS_GATEWAYS) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per gateway
            const response = await fetch(gateway + cid, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
                return response;
            }
        } catch (error) {
            console.warn(`Gateway ${gateway} failed for ${cid}:`, error);
        }
    }
    throw new Error(`Could not fetch from any IPFS gateway for URI: ${ipfsUri}`);
}


/**
 * Fetches all MeeBot NFTs owned by the connected address.
 * @param provider An ethers BrowserProvider instance.
 * @returns A promise that resolves with an array of NFT metadata objects.
 */
export async function getOwnedMeeBots(provider: ethers.BrowserProvider) {
    try {
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        const contractAddress = CONTRACT_ADDRESSES[chainId];
        if (!contractAddress || contractAddress === PLACEHOLDER_ADDRESS) {
            console.log(`Skipping NFT fetch on unsupported/placeholder network: ${chainId}`);
            return [];
        }

        const abi = await getContractAbi();
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const balance = await contract.balanceOf(address);
        const count = parseInt(balance.toString());

        if (count === 0) {
            return [];
        }

        const nftPromises = [];

        for (let i = 0; i < count; i++) {
            const promise = (async () => {
                try {
                    const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                    const tokenURI = await contract.tokenURI(tokenId);
                    const metadataResponse = await fetchFromIPFS(tokenURI);
                    const metadata = await metadataResponse.json();
                    
                    return {
                        tokenId: tokenId.toString(),
                        metadata: metadata,
                    };
                } catch (error) {
                    console.error(`Error processing token at index ${i}:`, error);
                    return null;
                }
            })();
            nftPromises.push(promise);
        }

        const results = await Promise.all(nftPromises);
        const nfts = results.filter((nft): nft is NonNullable<typeof nft> => nft !== null);

        return nfts;

    } catch (error: any) {
        console.error("Error fetching owned MeeBots:", error);
        
        if (error.code === 'CALL_EXCEPTION') {
            throw new Error(`เกิดข้อผิดพลาดในการเรียกดูข้อมูลจาก Smart Contract กรุณาตรวจสอบว่าคุณอยู่บนเครือข่ายที่ถูกต้อง (เช่น Sepolia) และลองอีกครั้ง`);
        }
        
        if (typeof error.message === 'string' && (error.message.includes("HTTP Status code: -1") || error.code === 'NETWORK_ERROR')) {
            throw new Error("ไม่สามารถโหลด NFT ได้เนื่องจากข้อผิดพลาดของเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและการตั้งค่ากระเป๋าเงินของคุณ");
        }
        
        throw new Error("เกิดข้อผิดพลาดที่ไม่คาดคิดขณะเรียกดู NFT ของคุณ กรุณาลองรีเฟรชหน้าอีกครั้ง");
    }
}