import React, { useState, useEffect } from 'react';
// FIX: Switched to journeyService (localStorage) to resolve Firestore permission errors.
import { fetchTimelineEvents } from '../../lib/services/journeyService';
import { BadgeIcon, DnaIcon, SpinnerIcon, SoundWaveIcon } from '../../../components/Icons';
import { getVoiceForMood } from '../../lib/voiceUtils';


const DashboardWidget: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ title, children, className }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg p-4 md:p-6 ${className}`}>
    <h2 className="text-xl font-semibold mb-4 text-slate-200">{title}</h2>
    {children}
  </div>
);

// This is a general type for events fetched from storage.
type TimelineEvent = any;

interface MyJourneyProps {
    connectedAccount: string | null;
    refreshKey: number;
}

const MyJourney: React.FC<MyJourneyProps> = ({ connectedAccount, refreshKey }) => {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEvents = async () => {
            if (!connectedAccount) {
                setEvents([]);
                setIsLoading(false);
                return;
            };
            setIsLoading(true);
            setError(null);
            try {
                const fetchedEvents = await fetchTimelineEvents(connectedAccount);
                setEvents(fetchedEvents);
            } catch (err) {
                // FIX: Updated error handling to reflect fetching from localStorage.
                console.error("Failed to load journey from localStorage:", err);
                setError(err instanceof Error ? err.message : "Could not load your journey from local storage.");
            } finally {
                setIsLoading(false);
            }
        };

        loadEvents();
    }, [connectedAccount, refreshKey]);

  const speak = (text: string, mood: string = 'default') => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'th-TH'; 
      // Note: Voice selection via name is complex and browser-dependent.
      // We will rely on the Thai language pack for now.
      window.speechSynthesis.speak(utter);
    }
  };


  const renderEvent = (event: TimelineEvent) => {
      const key = event.id; // Use generated ID as the key

      if (event.type === 'mood-analysis' && event.data) {
        return (
             <li key={key}>
                <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-lg border border-sky-500/30">
                    <div className="w-16 h-16 rounded-md bg-sky-900/50 flex-shrink-0 flex items-center justify-center">
                       <DnaIcon className="w-8 h-8 text-sky-300" />
                    </div>
                    <div>
                        <p className="font-bold text-sky-300">Inspiration captured: A <span className="capitalize">{event.data.mood}</span> soul.</p>
                        <p className="text-sm text-slate-300 italic">MeeBot's thought: "{event.data.message}"</p>
                        <p className="text-xs text-slate-400 mt-1">From prompt: "{event.data.context}"</p>
                         <div className="flex items-center gap-4 mt-2">
                             <button onClick={() => speak(event.data.message, event.data.mood)} className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300">
                                <SoundWaveIcon className="w-4 h-4" />
                                Speak
                            </button>
                             <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                         </div>
                    </div>
                </div>
            </li>
        )
      }

      if (event.type === 'meebot_birth' && event.data) {
        const mood = event.data.attributes?.find((a: any) => a.trait_type === 'Mood')?.value || 'N/A';
        return (
            <li key={key}>
                <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-lg border border-purple-500/30">
                    <img src={event.data.image} alt={event.data.name} className="w-16 h-16 rounded-md glow flex-shrink-0 object-cover" />
                    <div>
                        <p className="font-bold text-purple-300">{event.data.name} ถือกำเนิดแล้ว! 🎉</p>
                        <p className="text-sm text-slate-300">A new digital life with a <span className="font-semibold">{mood}</span> mood has begun.</p>
                        <div className="flex items-center gap-4 mt-2">
                             <a href={`https://sepolia.etherscan.io/tx/${event.data.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-400 hover:text-green-300">
                                View Transaction
                             </a>
                            <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                    </div>
                </div>
            </li>
        );
      }
      
      if (event.type === 'meebot_evolution' && event.data) {
        return (
            <li key={key}>
                <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-lg border border-green-500/30">
                    <div className="w-16 h-16 rounded-md bg-green-900/50 flex-shrink-0 flex items-center justify-center">
                       <DnaIcon className="w-8 h-8 text-green-300" />
                    </div>
                    <div>
                        <p className="font-bold text-green-300">{event.data.name} ได้วิวัฒนาการแล้ว! 🎇</p>
                        <p className="text-sm text-slate-300">A new stage of existence has been reached through experience.</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(event.timestamp).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                </div>
            </li>
        );
      }

       if (event.type === 'badge-awarded' && event.data) {
        return (
            <li key={key}>
                <div className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-lg border border-yellow-500/30">
                    <div className="w-16 h-16 rounded-md bg-yellow-900/50 flex-shrink-0 flex items-center justify-center">
                       <BadgeIcon className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div>
                        <p className="font-bold text-yellow-300">Badge Awarded: {event.data.name} 🏅</p>
                        <p className="text-sm text-slate-300">{event.data.description}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(event.timestamp).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                </div>
            </li>
        );
      }

      return null;
  }

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <SpinnerIcon className="w-6 h-6 text-sky-400 animate-spin" />
                <p className="ml-3 text-slate-400">Loading Your Journey...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 bg-red-900/20 rounded-lg">
                <p className="text-red-300"><strong>Error Loading Journey</strong></p>
                <p className="text-red-400 text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
             <div className="text-center py-10 text-slate-500">
                <p>No recent activity. Mint a MeeBot to begin your journey!</p>
            </div>
        )
    }

    return (
        <ul className="space-y-4">
            {events.map(renderEvent)}
        </ul>
    );
  }

  return (
    <DashboardWidget title="🛤️ My MeeBot Journey">
      {renderContent()}
    </DashboardWidget>
  );
};

export default MyJourney;