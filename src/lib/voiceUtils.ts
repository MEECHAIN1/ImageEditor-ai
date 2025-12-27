/**
 * Maps a mood to a specific Gemini TTS voice for emotional expression.
 */
export const moodVoiceMap: { [key: string]: string } = {
  // Cheerful, upbeat moods
  joyful: 'Puck',
  happy: 'Puck',
  energetic: 'Puck',
  playful: 'Puck',
  // Inquisitive, thoughtful moods
  curious: 'Kore',
  thoughtful: 'Kore',
  // Calm, serene moods
  serene: 'Zephyr',
  calm: 'Zephyr',
  peaceful: 'Zephyr',
  // Mysterious, deep moods
  mysterious: 'Charon',
  deep: 'Charon',
  solemn: 'Charon',
  // Adventurous, strong moods
  adventurous: 'Fenrir',
  brave: 'Fenrir',
  strong: 'Fenrir',
  confident: 'Fenrir',
};

/**
 * Gets a voice name for a given mood, with a fallback to a default voice.
 * @param mood The mood string, case-insensitive.
 * @returns A string representing the voice name for the TTS API.
 */
export const getVoiceForMood = (mood: string): string => {
    if (!mood) return 'Kore'; // Default voice
    const lowerCaseMood = mood.toLowerCase();
    return moodVoiceMap[lowerCaseMood] || 'Kore'; // Default to Kore if mood not in map
};
