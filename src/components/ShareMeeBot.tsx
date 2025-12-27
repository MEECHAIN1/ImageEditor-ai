import React from 'react';

type ShareProps = {
  name: string;
  etherscanUrl: string;
};

const defaultText = (name: string) => `My MeeBot is ready for its Web3 adventure! ${name} has been successfully minted! 🎉 #MeeChain #MeeBot`;

const ShareMeeBot: React.FC<ShareProps> = ({ name, etherscanUrl }) => {
  const text = defaultText(name);

  const shareToX = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(etherscanUrl)}`;
    window.open(xUrl, '_blank');
  };

  const shareToFB = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(etherscanUrl)}`;
    window.open(fbUrl, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(etherscanUrl);
    alert('Copied link to Etherscan!');
  };

  return (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg text-center border border-slate-600">
        <p className="text-sm text-sky-300 italic mb-3">MeeBot: “Thanks for minting me! See you on the blockchain 💜”</p>
        <div className="flex justify-center gap-2">
            <button onClick={shareToX} className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-black transition-colors">Share on X</button>
            <button onClick={shareToFB} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-500 transition-colors">Share on Facebook</button>
            <button onClick={copyLink} className="bg-slate-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-slate-500 transition-colors">Copy Link</button>
        </div>
    </div>
  );
};

export default ShareMeeBot;