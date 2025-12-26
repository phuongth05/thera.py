/**
 * Custom hook for text-to-speech
 */
export function useSpeechSynthesis() {
  const speak = (text, lang = 'vi-VN') => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi'));
    if (viVoice) utterance.voice = viVoice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const cancel = () => {
    window.speechSynthesis.cancel();
  };

  return { speak, cancel };
}
