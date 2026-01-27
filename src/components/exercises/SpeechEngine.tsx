import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function useSpeechEngine() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const start = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      language: "ru-RU",
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
