import { getFirebaseDb, ensureAuthInitialized } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';


/**
 * Adds a new event document to the 'timeline' collection in Firestore.
 * @param eventData An object containing the data for the event (e.g., type, details).
 * @returns A promise that resolves with the ID of the newly created document.
 */
export const addTimelineEvent = async (eventData: object) => {
  try {
    await ensureAuthInitialized(); // Wait for anonymous sign-in to complete.
    const db = getFirebaseDb(); // Get the lazy-loaded db instance
    const docRef = await addDoc(collection(db, 'timeline'), {
      ...eventData,
      timestamp: serverTimestamp(), // Use server timestamp for consistency
    });
    console.log("Timeline event added with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document to timeline: ", e);
    if (e instanceof Error && 'code' in e && (e as any).code === 'permission-denied') {
        throw new Error("Firestore permission denied. Please check your security rules in the Firebase console.");
    }
    throw new Error("Could not save event to timeline. Check Firestore security rules and network connection.");
  }
};

/**
 * Fetches the most recent events from the 'timeline' collection for a specific user.
 * @param userAddress The address of the user to fetch events for.
 * @param eventLimit The maximum number of events to fetch.
 * @returns A promise that resolves to an array of timeline event objects.
 */
export const fetchTimelineEvents = async (userAddress: string, eventLimit: number = 20) => {
  try {
    await ensureAuthInitialized(); // Wait for anonymous sign-in to complete.
    const db = getFirebaseDb(); // Get the lazy-loaded db instance
    const timelineCol = collection(db, 'timeline');
    // NOTE: This query requires a composite index on (`data.creator`, `timestamp` desc) in Firestore.
    // The Firestore console will provide a link to create this index if it's missing.
    const q = query(
      timelineCol, 
      where('data.creator', '==', userAddress), 
      orderBy('timestamp', 'desc'), 
      limit(eventLimit)
    );

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to a JavaScript Date object, then to an ISO string
      // for consistent handling in the component.
      const jsDate = data.timestamp?.toDate();
      return {
        id: doc.id,
        ...data,
        timestamp: jsDate ? jsDate.toISOString() : new Date().toISOString(),
      };
    });

    return events;
  } catch(e) {
      console.error("Error fetching timeline events:", e);
      if (e instanceof Error && 'code' in e) {
        const firebaseError = e as any;
        if (firebaseError.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Please check your security rules.");
        }
        if (firebaseError.code === 'failed-precondition') {
            const message = firebaseError.message || "";
            if (message.includes("index")) {
                 throw new Error("A required Firestore index is missing. The developer console error message should contain a link to create it.");
            }
             throw new Error("Could not load journey due to a database configuration issue. Check Firestore indexes.");
        }
    }
    throw new Error("Could not load your journey from the database.");
  }
};