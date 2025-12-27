import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: The `LiveSession` type is not exported from the `@google/genai` library.
// It has been removed from imports, and the corresponding type annotation will be changed to `any`.
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { decode, decodeAudioData, createBlob } from '../../lib/audioUtils';
import { MicrophoneOnIcon, StopIcon, SpinnerIcon } from '../../../components/Icons';

interface TranscriptEntry {
  speaker: 'user' | 'bot';
  text: string;
}

export default function MeeBotLiveChat(): React.ReactElement {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  // FIX: The `LiveSession` type is not exported from `@google/genai`. Using `any` as a fallback.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = useCallback(() => {
    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;
    inputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;
    outputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current = null;
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
  }, []);

  const handleStopSession = useCallback(async () => {
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
    }
    cleanup();
    setIsSessionActive(false);
    setIsConnecting(false);
    sessionPromiseRef.current = null;
  }, [cleanup]);
  
  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
        if(isSessionActive) {
            handleStopSession();
        }
    };
  }, [isSessionActive, handleStopSession]);


  const handleStartSession = async () => {
    setError(null);
    setTranscript([]);
    setIsConnecting(true);
    
    try {
       // Check for API key before asking for media permissions or initializing AudioContexts.
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        try {
          await window.aistudio.openSelectKey();
        } catch (e) {
          setError("An API key must be selected from your user settings to begin the chat.");
          setIsConnecting(false);
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // FIX: Cast window to `any` to access vendor-prefixed `webkitAudioContext` for Safari compatibility, resolving TypeScript errors.
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      let currentInputTranscription = '';
      let currentOutputTranscription = '';

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsSessionActive(true);

            if (!inputAudioContextRef.current) return;
            mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // --- Handle Transcription ---
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription += message.serverContent.inputTranscription.text;
            }
             if (message.serverContent?.outputTranscription) {
              currentOutputTranscription += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscription.trim();
                const fullOutput = currentOutputTranscription.trim();

                setTranscript(prev => {
                    const newTranscript = [...prev];
                    if (fullInput) newTranscript.push({ speaker: 'user', text: fullInput });
                    if (fullOutput) newTranscript.push({ speaker: 'bot', text: fullOutput });
                    return newTranscript;
                });
                
                currentInputTranscription = '';
                currentOutputTranscription = '';
            }

            // --- Handle Audio Playback ---
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                const outputCtx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                
                source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setError(`Connection error: ${e.message}`);
            handleStopSession();
          },
          onclose: () => {
             // Session closed by server or network error.
             cleanup();
             setIsSessionActive(false);
             setIsConnecting(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            // FIX: Changed voice from 'Tala' to 'Kore' as 'Tala' is not supported by this model.
            // The systemInstruction will still ensure the bot speaks Thai.
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'คุณคือ MeeBot ผู้ช่วย AI ที่เป็นมิตรและพูดภาษาไทยได้อย่างเป็นธรรมชาติ',
        },
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to start session.");
      setIsConnecting(false);
    }
  };

  return (
    <div className="meebot-live-chat p-4 text-sm text-slate-800">
      <div className="flex flex-col h-64">
        <div className="flex-grow bg-slate-100 rounded-md p-3 overflow-y-auto mb-4">
            {transcript.length === 0 && !isSessionActive && (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <MicrophoneOnIcon className="w-10 h-10 mb-2"/>
                    <p>กดปุ่ม "Start" เพื่อเริ่มคุยกับ MeeBot</p>
                </div>
            )}
            {transcript.map((entry, index) => (
                <div key={index} className={`mb-2 ${entry.speaker === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block px-3 py-1.5 rounded-lg ${entry.speaker === 'user' ? 'bg-sky-200 text-sky-900' : 'bg-slate-200 text-slate-800'}`}>
                        {entry.text}
                    </span>
                </div>
            ))}
        </div>
        <div className="flex-shrink-0">
            {isSessionActive ? (
                <button
                    onClick={handleStopSession}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-red-500 transition-colors"
                    aria-label="Stop Conversation"
                >
                    <StopIcon className="w-5 h-5" />
                    <span>หยุดการสนทนา</span>
                </button>
            ) : (
                <button
                    onClick={handleStartSession}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-sky-500 transition-colors disabled:bg-slate-400"
                    aria-label="Start Conversation"
                >
                    {isConnecting ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            <span>กำลังเชื่อมต่อ...</span>
                        </>
                    ) : (
                       <>
                            <MicrophoneOnIcon className="w-5 h-5" />
                            <span>เริ่มการสนทนา</span>
                       </>
                    )}
                </button>
            )}
        </div>
      </div>
       {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}