/**
 * Custom hook for text-to-speech (Vietnamese with cross-browser support)
 */
export function useSpeechSynthesis() {
  const getVoices = () => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      
      // Nếu voices đã load, trả về ngay
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Nếu chưa load, đợi voiceschanged event (Chrome, Edge)
      const handleVoicesChanged = () => {
        const loadedVoices = window.speechSynthesis.getVoices();
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(loadedVoices);
      };

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Timeout 2s nếu event không xảy ra
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }, 2000);
    });
  };

  const selectVietnameseVoice = (voices) => {
    if (!voices || voices.length === 0) return null;

    // 1. Ưu tiên: vi-VN chính xác
    let voice = voices.find((v) => v.lang === 'vi-VN');
    if (voice) return voice;

    // 2. Fallback: bất kỳ giọng vi nào
    voice = voices.find((v) => v.lang.startsWith('vi'));
    if (voice) return voice;

    // 3. Fallback: Google các ngôn ngữ có sẵn (ổn định)
    voice = voices.find((v) => v.name.includes('Google'));
    if (voice) return voice;

    // 4. Fallback cuối: lấy giọng đầu tiên
    return voices[0] || null;
  };

  const speak = async (text) => {
    if (!window.speechSynthesis || !text) return;

    try {
      // Đợi voices load
      const voices = await getVoices();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      
      // Cài đặt cho consistency
      utterance.rate = 1.0;  // Tốc độ bình thường
      utterance.pitch = 1.0; // Cao độ bình thường
      utterance.volume = 1.0; // Âm lượng max

      // Chọn giọng tốt nhất
      const selectedVoice = selectVietnameseVoice(voices);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Ngắt phát hiện tại
      window.speechSynthesis.cancel();
      
      // Phát âm thanh
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const cancel = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return { speak, cancel };
}
