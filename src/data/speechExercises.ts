import { SpeechExercise } from "@/types/exercise";

export const speechExercises: SpeechExercise[] = [
  {
    id: "onr-repeat-ma",
    title: "exercises.onr.title",
    description: "exercises.onr.description",
    category: "exercises.onr.category",
    type: "repeat-syllables",
    prompt: "exercises.onr.prompt",
  },
  {
    id: "phonetics-pa",
    title: "exercises.phonetics.title",
    description: "exercises.phonetics.description",
    category: "exercises.phonetics.category",
    type: "repeat-word",
    prompt: "exercises.phonetics.prompt",
  },
  {
    id: "breathing-candle",
    title: "exercises.breathing.title",
    description: "exercises.breathing.description",
    category: "exercises.breathing.category",
    type: "breathing",
    prompt: "exercises.breathing.prompt",
  },
];
