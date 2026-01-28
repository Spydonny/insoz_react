export type ExerciseType =
  | "repeat-word"
  | "repeat-syllables"
  | "breathing";

export type SpeechExercise = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: ExerciseType;
  prompt: string;
};
