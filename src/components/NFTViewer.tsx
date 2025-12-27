import React, { useEffect, useState } from 'react';

type NFTMeta = {
  name: string;
  description: string;
  image: string; // ipfs://... or https://...
  attributes?: { trait_type: string; value: string }[];
};

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

function ipfsToHttp(uri: string): string[] {
  if (!uri?.startsWith('ipfs://')) return [uri];
  const cid = uri.replace('ipfs://', '');
  return IPFS_GATEWAYS.map(g => g + cid);
}

const NFTViewer: React.FC<{ metadata: NFTMeta }> = ({ metadata }) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const urls = ipfsToHttp(metadata.image);
    setImageUrls(urls);
    setCurrentUrlIndex(0);
    setImageLoaded(false);
    setImageError(false);
  }, [metadata.image]);

  const handleImageError = () => {
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prevIndex => prevIndex + 1);
    } else {
      setImageError(true); // All gateways failed
    }
  };
  
  const currentImageUrl = imageUrls[currentUrlIndex];

  return (
    <div className="bg-slate-700/50 rounded-lg p-3 space-y-3">
      <div className="aspect-square bg-slate-800 rounded-md flex items-center justify-center">
        {imageError ? (
          <div className="text-red-400 text-xs text-center p-2">Couldn't load image</div>
        ) : currentImageUrl ? (
          <img 
            key={currentImageUrl} // Force re-render if URL changes
            src={currentImageUrl} 
            alt={metadata.name} 
            className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        ) : (
          <div className="text-slate-500 text-xs">Loading image...</div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-white truncate">{metadata.name}</h3>
        <p className="text-xs text-slate-400 line-clamp-2">{metadata.description}</p>
      </div>

        {metadata.attributes?.length ? (
        <div className="grid grid-cols-2 gap-1.5">
            {metadata.attributes.map((attr, i) => (
            <div key={i} className="bg-slate-800 rounded p-1.5">
                <span className="block text-xs text-slate-500 uppercase">{attr.trait_type}</span>
                <span className="text-sm text-slate-200 font-semibold truncate">{attr.value}</span>
            </div>
            ))}
        </div>
        ) : null}
    </div>
  );
}

export default NFTViewer;