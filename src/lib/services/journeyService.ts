
const getJourneyKey = (userAddress: string) => `meebot_journey_${userAddress}`;

/**
 * Adds a new event document to the user's journey in localStorage.
 * @param eventData An object containing the event data. It must contain `data.creator` with the user's wallet address.
 */
export const addTimelineEvent = async (eventData: any) => {
  const userAddress = eventData?.data?.creator;
  if (!userAddress) {
      console.warn("Cannot add timeline event without a creator address.");
      return;
  };
  try {
    const key = getJourneyKey(userAddress);
    const existingEventsRaw = localStorage.getItem(key);
    const existingEvents = existingEventsRaw ? JSON.parse(existingEventsRaw) : [];
    
    const newEvent = {
      ...eventData,
      timestamp: new Date().toISOString(),
      id: `local_${Date.now()}_${Math.random()}`
    };
    
    // Prepend the new event to keep the list sorted by most recent
    const updatedEvents = [newEvent, ...existingEvents];
    localStorage.setItem(key, JSON.stringify(updatedEvents));
  } catch (e) {
    console.error("Error saving journey event to localStorage:", e);
  }
};

/**
 * Fetches the most recent events from localStorage for a specific user.
 * @param userAddress The address of the user to fetch events for.
 * @param eventLimit The maximum number of events to fetch.
 * @returns A promise that resolves to an array of timeline event objects.
 */
export const fetchTimelineEvents = async (userAddress: string, eventLimit: number = 20) => {
  if (!userAddress) return [];
  try {
    const key = getJourneyKey(userAddress);
    const eventsRaw = localStorage.getItem(key);
    const events = eventsRaw ? JSON.parse(eventsRaw) : [];
    return events.slice(0, eventLimit);
  } catch (e) {
    console.error("Error fetching journey events from localStorage:", e);
    return [];
  }
};
