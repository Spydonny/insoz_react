import { SpeechExercise } from "@/types/exercise";

export const speechExercises: SpeechExercise[] = [
  {
    id: "onr-repeat-ma",
    title: "Repeat the syllables “MA-MO-MU”",
    description: "Development of syllable structure in speech",
    category: "ONR",
    type: "repeat-syllables",
    prompt: "ma mo mu",
  },
  {
    id: "phonetics-pa",
    title: "Sound P — PA",
    description: "Practicing the plosive consonant",
    category: "Phonetics",
    type: "repeat-word",
    prompt: "pa",
  },
  {
    id: "breathing-candle",
    title: "Breathing “Candle”",
    description: "Developing smooth exhalation",
    category: "Articulation",
    type: "breathing",
    prompt: "blow",
  },
];
