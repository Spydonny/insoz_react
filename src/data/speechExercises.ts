import { SpeechExercise } from "@/types/exercise";

export const speechExercises: SpeechExercise[] = [
  {
    id: "onr-repeat-ma",
    title: "Повтори слоги «МА-МО-МУ»",
    description: "Развитие слоговой структуры речи",
    category: "ОНР",
    type: "repeat-syllables",
    prompt: "ма мо му",
  },
  {
    id: "phonetics-pa",
    title: "Звук П — ПА",
    description: "Отработка взрывного согласного",
    category: "Фонетика",
    type: "repeat-word",
    prompt: "па",
  },
  {
    id: "breathing-candle",
    title: "Дыхание «Свеча»",
    description: "Формирование плавного выдоха",
    category: "Артикуляция",
    type: "breathing",
    prompt: "дуй",
  },
];
