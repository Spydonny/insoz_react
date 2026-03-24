import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useTranslation } from "react-i18next";

const getSpeechLang = (lang: string) => {
  switch (lang) {
    case "kk": return "kk-KZ";
    case "en": return "en-US";
    case "tr": return "tr-TR";
    case "ru":
    default: return "ru-RU";
  }
};

export function useSpeechEngine() {
  const { i18n } = useTranslation();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const start = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      language: getSpeechLang(i18n.language),
      continuous: false,
    });
  };

  const stop = () => {
    SpeechRecognition.stopListening();
  };

  return {
    transcript,
    listening,
    start,
    stop,
    supported: browserSupportsSpeechRecognition,
  };
}
