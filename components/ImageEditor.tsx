import React, { useState, useCallback, useRef, useEffect } from 'react';
import { editImage } from '../src/lib/services/geminiService';
import { ImageFile } from '../types';
import { DownloadIcon, MeeBotDefaultIcon, SpinnerIcon, UploadIcon, WandIcon } from './Icons';
import { mintMeeBot } from '../src/lib/services/web3Service';
import { ethers } from 'ethers';


interface ImageEditorProps {
  provider: ethers.BrowserProvider | null;
  connectedAccount: string | null;
  onConnectWallet: () => void;
  onMintSuccess: () => void;
}

const Lightbox: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
  <div 
    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-[meebot-fadeIn_200ms_ease-out_both]"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
  >
    <button 
      onClick={onClose} 
      className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300 transition-colors z-10"
      aria-label="Close image viewer"
    >
      &times;
    </button>
    <div className="relative p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
      <img 
        src={imageUrl} 
        alt="Enlarged view" 
        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
      />
    </div>
  </div>
);

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string)?.split(',')[1];
      if (base64) {
        resolve({ base64, mimeType: file.type, name: file.name });
      } else {
        reject(new Error("Failed to read file as base64."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const ImageEditor: React.FC<ImageEditorProps> = ({ provider, connectedAccount, onConnectWallet, onMintSuccess }) => {
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{base64: string, mimeType: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);

  // Minting state
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccessTx, setMintSuccessTx] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  
  const displayImage = editedImage || previewImage;

  // Debounced effect for live preview
  useEffect(() => {
    let isActive = true;

    if (!originalImage || !prompt.trim() || prompt.length < 3 || isLoading) {
      setPreviewImage(null);
      setIsPreviewLoading(false);
      return;
    }

    setIsPreviewLoading(true);

    const handler = setTimeout(async () => {
      try {
        if (!isActive) return;
        const resultBase64 = await editImage(originalImage, prompt);
        
        if (isActive) {
          setPreviewImage(resultBase64);
          setEditedImage(null); // A new preview invalidates the last final image
        }
      } catch (err) {
        console.error("Preview generation failed:", err);
        // We can optionally clear the preview here, or leave the stale one
        // setPreviewImage(null); 
      } finally {
        if (isActive) {
          setIsPreviewLoading(false);
        }
      }
    }, 500); // 500ms debounce for near real-time feel

    return () => {
      isActive = false;
      clearTimeout(handler);
    };
  }, [prompt, originalImage, isLoading]);

  // Load gallery from localStorage on component mount
  useEffect(() => {
    try {
      const storedGallery = localStorage.getItem('editedImageGallery');
      if (storedGallery) {
        setGalleryImages(JSON.parse(storedGallery));
      }
    } catch (e) {
      console.error("Failed to load gallery from localStorage", e);
    }
  }, []);

  // Save gallery to localStorage whenever it changes
  useEffect(() => {
    if (galleryImages.length > 0) {
      try {
        localStorage.setItem('editedImageGallery', JSON.stringify(galleryImages));
      } catch (e) {
        console.error("Failed to save gallery to localStorage", e);
      }
    }
  }, [galleryImages]);

  // Reset mint status when a new image is edited or selected
  useEffect(() => {
    setMintError(null);
    setMintSuccessTx(null);
    setIsMinting(false);
  }, [editedImage, originalImage]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        setOriginalImage(imageFile);
        setEditedImage(null);
        setPreviewImage(null);
        setError(null);
        setNotification(null);
      } catch (err) {
        setError("Could not process the selected file. Please try another image.");
      }
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError("Please upload an image and provide an editing prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    setPreviewImage(null);
    setNotification(null);
    setMintError(null);
    setMintSuccessTx(null);

    try {
      const resultBase64 = await editImage(originalImage, prompt);
      setEditedImage(resultBase64);
      // Add the new image to the gallery (at the beginning)
      setGalleryImages(prevGallery => [resultBase64, ...prevGallery.slice(0, 19)]); // Limit gallery to 20 images
      setNotification("Task completed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt]);

  const handleMint = async () => {
    if (!connectedAccount) {
      onConnectWallet();
      return;
    }
    if (!editedImage) {
        setMintError("There is no edited image to mint.");
        return;
    }
    if (!provider) {
        setMintError("Wallet provider is not available. Please ensure your wallet is connected.");
        return;
    }

    if (!window.confirm('Are you sure you want to mint this image as an NFT?')) {
        return;
    }

    setIsMinting(true);
    setMintError(null);
    setMintSuccessTx(null);

    try {
        const txHash = await mintMeeBot(provider);
        setMintSuccessTx(txHash);
        onMintSuccess(); // Notify parent to refresh gallery
        setNotification("NFT minted successfully!");
    } catch (err) {
        setMintError(err instanceof Error ? err.message : "An unexpected minting error occurred.");
    } finally {
        setIsMinting(false);
    }
  };

  const handleGallerySelect = (base64Image: string) => {
    const imageFile: ImageFile = {
        base64: base64Image,
        mimeType: 'image/png', // Gemini returns PNG
        name: `gallery-image-${Date.now()}.png`
    };
    setOriginalImage(imageFile);
    setEditedImage(null); // Clear the edited image view
    setPreviewImage(null);
    setError(null);
    setNotification('Loaded image from gallery for editing.');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top for better UX
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setSelectedBackground(null);
  };
  
  const handleBackgroundSelect = (background: string) => {
    if (selectedBackground === background) {
      setSelectedBackground(null);
      setPrompt('');
    } else {
      setSelectedBackground(background);
      setPrompt(`Change the background to ${background.toLowerCase()}`);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPreviewImage(null);
    setPrompt('');
    setError(null);
    setNotification(null);
    setMintError(null);
    setMintSuccessTx(null);
    setSelectedBackground(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const promptSuggestions = [
    "Add a retro, vintage filter",
    "Make the image black and white",
    "Add a cat wearing sunglasses",
    "Remove the person in the background"
  ];

  const backgroundSuggestions = ['Beach', 'Forest', 'Cityscape', 'Space', 'Abstract Colors'];

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 md:p-6 space-y-6 border border-slate-700">
        <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col items-center justify-center bg-slate-900/50 p-4 rounded-lg border-2 border-dashed border-slate-700 min-h-[300px]">
            {originalImage ? (
                <div className="relative group w-full">
                    <img 
                        src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} 
                        alt="Original" 
                        className="rounded-md max-w-full max-h-80 mx-auto cursor-pointer transition-transform hover:scale-105" 
                        onClick={() => setLightboxImage({ base64: originalImage.base64, mimeType: originalImage.mimeType })}
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="absolute top-2 right-2 bg-slate-800/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        Change
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <UploadIcon className="w-12 h-12 mx-auto text-slate-500 mb-2" />
                    <p className="text-slate-400 mb-2">Upload an image to start editing</p>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 transition-colors">
                        Select Image
                    </button>
                </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[300px] relative">
            {isLoading ? (
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto meebot-rotate">
                      <MeeBotDefaultIcon className="w-full h-full" />
                    </div>
                    <p className="font-bold text-2xl text-slate-100">MeeBot is working...</p>
                    <p className="text-slate-400">Our digital sprite is crafting your image.</p>
                    <div className="flex items-center justify-center space-x-2 text-slate-500">
                        <SpinnerIcon className="w-5 h-5 animate-spin" />
                        <span>Generating your image...</span>
                    </div>
                </div>
            ) : displayImage ? (
                <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                            src={`data:image/png;base64,${displayImage}`} 
                            alt={editedImage ? "Edited" : "Preview"}
                            className="rounded-md max-w-full max-h-80 mx-auto cursor-pointer transition-transform hover:scale-105" 
                            onClick={() => setLightboxImage({ base64: displayImage, mimeType: 'image/png' })}
                        />
                         {!editedImage && (
                            <div className="absolute top-1 right-1 bg-slate-900/80 text-sky-400 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                                Live Preview
                            </div>
                        )}
                    </div>
                    {editedImage && (
                        <div className="w-full mt-auto space-y-2">
                            <a
                                href={`data:image/png;base64,${editedImage}`}
                                download="edited-image.png"
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-500 transition-colors flex items-center justify-center"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Save Image
                            </a>
                            <button
                                onClick={handleMint}
                                disabled={isMinting || !!mintSuccessTx}
                                className="w-full bg-violet-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-violet-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isMinting ? (
                                    <>
                                        <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                                        Processing Mint...
                                    </>
                                ) : mintSuccessTx ? 'Minted Successfully!' : 'Mint as NFT'}
                            </button>
                        </div>
                    )}
                     {/* Minting Status */}
                    <div className="w-full text-xs text-center mt-2">
                        {mintSuccessTx && (
                             <div className="text-green-400">
                                Success! <a href={`https://sepolia.etherscan.io/tx/${mintSuccessTx}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">View on Etherscan</a>
                            </div>
                        )}
                        {mintError && (
                            <div className="text-red-400 break-words">
                                Minting Error: {mintError}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-500">
                     {isPreviewLoading ? (
                        <>
                            <SpinnerIcon className="w-12 h-12 mx-auto mb-2 animate-spin" />
                            <p>Generating live preview...</p>
                        </>
                    ) : (
                        <>
                            <WandIcon className="w-12 h-12 mx-auto mb-2" />
                            <p>Your edited image will appear here.</p>
                             <p className="text-xs mt-1">A live preview will show as you type.</p>
                        </>
                    )}
                </div>
            )}
             {isPreviewLoading && displayImage && !isLoading && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center text-slate-300">
                        <SpinnerIcon className="w-8 h-8 mx-auto animate-spin" />
                        <p className="mt-2 text-sm">Updating preview...</p>
                    </div>
                </div>
            )}
            </div>
      </div>
      
      {originalImage && (
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Editing Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => {
                  setPrompt(e.target.value);
                  if (selectedBackground) {
                    setSelectedBackground(null);
                  }
              }}
              placeholder="e.g., 'Add a retro filter' or 'Remove the person in the background'"
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow text-slate-200 resize-none"
              rows={3}
              disabled={isLoading || isMinting}
            />
          </div>
          <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Quick Backgrounds</label>
                <div className="flex flex-wrap gap-2">
                    {backgroundSuggestions.map((bg) => (
                    <button 
                        key={bg} 
                        onClick={() => handleBackgroundSelect(bg)} 
                        disabled={isLoading || isMinting} 
                        className={`text-xs px-3 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedBackground === bg 
                            ? 'bg-sky-500 text-white ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-800' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {bg}
                    </button>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Prompt Suggestions</label>
                <div className="flex flex-wrap gap-2">
                    {promptSuggestions.map((s) => (
                    <button key={s} onClick={() => handlePromptSuggestion(s)} disabled={isLoading || isMinting} className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {s}
                    </button>
                    ))}
                </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt || !originalImage || isMinting}
              className="w-full bg-sky-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <WandIcon className="w-5 h-5 mr-2" />
                  Generate Final Image
                </>
              )}
            </button>
             <button
              onClick={handleReset}
              disabled={isLoading || isMinting}
              className="w-full bg-slate-700 text-slate-300 px-6 py-3 rounded-md font-semibold hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 text-red-300 border border-red-800 p-3 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
      {notification && !error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-700 text-slate-200 px-6 py-3 rounded-full shadow-lg animate-[meebot-fadeIn_420ms_ease-out_both]">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>{notification}</span>
          </div>
        </div>
      )}

       {/* Gallery Section */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <h2 className="text-lg font-semibold text-slate-300 mb-4">Your Recent Edits</h2>
        {galleryImages.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                {galleryImages.map((imgBase64, index) => (
                    <div key={index} className="flex-shrink-0 group relative rounded-md overflow-hidden">
                        <img
                            src={`data:image/png;base64,${imgBase64}`}
                            alt={`Edited image ${index + 1}`}
                            className="w-32 h-32 object-cover bg-slate-700 cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => setLightboxImage({ base64: imgBase64, mimeType: 'image/png' })}
                        />
                        <div 
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleGallerySelect(imgBase64);
                            }}
                        >
                           <span className="text-white text-xs font-bold text-center px-2 pointer-events-none">Edit Again</span>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-8 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
                <p className="text-slate-500">Your edited images will appear here.</p>
            </div>
        )}
      </div>

      {lightboxImage && (
        <Lightbox 
            imageUrl={`data:${lightboxImage.mimeType};base64,${lightboxImage.base64}`} 
            onClose={() => setLightboxImage(null)} 
        />
      )}
    </div>
  );
};

export default ImageEditor;