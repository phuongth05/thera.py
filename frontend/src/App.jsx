import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Trash2, Sparkles, Volume2, AlertCircle } from 'lucide-react';
import { detectEmotion, chatWithText } from './api';

const emotionConfig = {
  happy: { color: 'bg-amber-100 border-amber-400 text-amber-800', icon: '😊', label: 'Vui vẻ' },
  sad: { color: 'bg-sky-100 border-sky-400 text-sky-800', icon: '😢', label: 'Buồn' },
  angry: { color: 'bg-rose-100 border-rose-400 text-rose-800', icon: '😠', label: 'Tức giận' },
  neutral: { color: 'bg-slate-100 border-slate-300 text-slate-700', icon: '😐', label: 'Bình thường' },
};

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [micError, setMicError] = useState('');
  const [level, setLevel] = useState(0);

  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef(null);
  const audioBufferRef = useRef([]);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const messagesEndRef = useRef(null);

  // Init browser Speech Recognition (from references)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Trình duyệt không hỗ trợ Speech Recognition (STT). Vui lòng dùng Chrome/Edge.');
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'vi-VN';

    recognition.onresult = (event) => {
      let interim = '';
      let finalText = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = finalText;
      setTranscript(interim || finalText);
    };

    recognition.onerror = (event) => {
      setMicError(`Không thể nhận dạng giọng nói: ${event.error}`);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Visualize audio level
  const updateLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    const max = Math.max(...dataArrayRef.current);
    setLevel(Math.max(0, max - 128));
    rafRef.current = requestAnimationFrame(updateLevel);
  };

  const startRecording = async () => {
    try {
      setMicError('');
      audioBufferRef.current = [];
      finalTranscriptRef.current = '';
      setTranscript('');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const input = audioContext.createMediaStreamSource(stream);
      inputRef.current = input;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Attach analyser for visual level
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      input.connect(analyser);

      processor.onaudioprocess = (e) => {
        audioBufferRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };

      input.connect(processor);
      processor.connect(audioContext.destination);

      recognitionRef.current?.start();
      rafRef.current = requestAnimationFrame(updateLevel);

      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setMicError('Không thể truy cập microphone.');
    }
  };

  const stopRecording = () => {
    if (!isRecording) return null;

    recognitionRef.current?.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setLevel(0);

    try {
      processorRef.current?.disconnect();
      inputRef.current?.disconnect();
      analyserRef.current?.disconnect();
    } catch (e) {
      // swallow disconnect errors
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    const sampleRate = audioContextRef.current?.sampleRate || 16000;
    const wavBlob = encodeWAV(audioBufferRef.current, sampleRate);

    audioContextRef.current?.close();

    setAudioBlob(wavBlob);
    setIsRecording(false);
    return wavBlob;
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi'));
    if (viVoice) utterance.voice = viVoice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const processAudio = async (blobParam = audioBlob, textParam = transcript) => {
    if (!blobParam) {
      setMicError('Bạn cần ghi âm trước khi gửi.');
      return;
    }
    const finalText = (textParam || finalTranscriptRef.current || '').trim();
    if (!finalText) {
      setMicError('Không nhận được lời nói từ micro. Hãy thử ghi lại.');
      return;
    }

    setIsProcessing(true);
    setMicError('');

    try {
      const emotionResult = await detectEmotion(blobParam);
      setCurrentEmotion(emotionResult.emotion);

      const chatResult = await chatWithText(finalText, emotionResult.emotion);

      const timestamp = new Date().toLocaleTimeString('vi-VN');
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: finalText,
        emotion: emotionResult.emotion,
        timestamp,
      };

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: chatResult.reply_text,
        timestamp,
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);
      speakText(chatResult.reply_text);

      setAudioBlob(null);
      setTranscript('');
      finalTranscriptRef.current = '';
    } catch (error) {
      console.error(error);
      setMicError('Không thể kết nối backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    setMicError('');

    let blobToSend = audioBlob;
    if (isRecording) {
      blobToSend = stopRecording() || blobToSend;
      // chờ một nhịp để nhận final transcript từ SpeechRecognition sau khi stop
      await new Promise((res) => setTimeout(res, 200));
    }

    await processAudio(blobToSend, transcript || finalTranscriptRef.current);
  };

  const clearMessages = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ hội thoại?')) {
      setMessages([]);
      setTranscript('');
      setAudioBlob(null);
      setCurrentEmotion(null);
      finalTranscriptRef.current = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="bg-slate-900/70 border border-white/10 rounded-3xl px-6 py-4 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-300/30 flex items-center justify-center">
                <Sparkles className="text-emerald-200" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">Thera Voice</p>
                <h1 className="text-2xl font-semibold">AI Voice Companion</h1>
                <p className="text-sm text-slate-300">Nhận diện cảm xúc bằng AI, STT/TTS ngay trên trình duyệt.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearMessages}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-sm"
              >
                <Trash2 size={16} />
                Xóa lịch sử
              </button>
            </div>
          </div>

          {currentEmotion && emotionConfig[currentEmotion] && (
            <div className={`mt-4 inline-flex items-center gap-3 px-4 py-3 rounded-2xl border ${emotionConfig[currentEmotion].color}`}>
              <span className="text-2xl">{emotionConfig[currentEmotion].icon}</span>
              <div className="leading-tight">
                <p className="text-xs text-slate-500">Cảm xúc được phát hiện</p>
                <p className="text-sm font-semibold">{emotionConfig[currentEmotion].label}</p>
              </div>
            </div>
          )}
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <section className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-4 lg:p-6 shadow-2xl backdrop-blur flex flex-col min-h-[520px]">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <Volume2 size={16} />
                {isRecording ? 'Đang ghi âm...' : 'Sẵn sàng nghe bạn nói'}
              </span>
              {micError && (
                <span className="flex items-center gap-1 text-rose-200">
                  <AlertCircle size={14} />
                  {micError}
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 py-10 space-y-2">
                  <p>Nhấn giữ mic để nói, hệ thống sẽ nhận dạng & phân tích cảm xúc.</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg border border-white/5 ${
                    msg.type === 'user'
                      ? 'bg-emerald-500/20 text-emerald-50'
                      : 'bg-white/5 text-slate-50'
                  }`}>
                    {msg.type === 'user' && msg.emotion && emotionConfig[msg.emotion] && (
                      <div className="flex items-center gap-2 text-xs text-emerald-100 mb-1">
                        <span>{emotionConfig[msg.emotion].icon}</span>
                        <span>{emotionConfig[msg.emotion].label}</span>
                      </div>
                    )}
                    <p className="leading-relaxed text-sm">{msg.text}</p>
                    <p className="text-[11px] text-slate-400 mt-2">{msg.timestamp}</p>
                  </div>
                </div>
              ))}

              {transcript && isRecording && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-emerald-500/10 text-emerald-50 border border-emerald-300/20 animate-pulse">
                    <p className="text-xs uppercase tracking-wide text-emerald-200 mb-1">Đang nghe...</p>
                    <p className="text-sm italic">{transcript}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl font-semibold transition-all border ${
                  isRecording
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-emerald-500 text-white border-emerald-400 hover:brightness-110'
                } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                {isRecording ? 'Dừng ghi âm' : 'Nhấn để nói'}
              </button>

              <button
                onClick={handleSend}
                disabled={isProcessing || (!audioBlob && !isRecording)}
                className={`px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 border border-white/10 ${
                  (audioBlob || isRecording) && !isProcessing
                    ? 'bg-white/10 text-emerald-100 hover:bg-white/20'
                    : 'bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={18} />
                {isProcessing ? 'Đang xử lý...' : 'Gửi'}
              </button>
            </div>
          </section>

          <aside className="bg-white/5 border border-white/10 rounded-3xl p-4 lg:p-6 shadow-2xl backdrop-blur flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-200">Trạng thái micro</p>
              <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </div>

            <div className="h-24 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center px-4">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all"
                  style={{ width: `${Math.min(100, level * 1.6)}%` }}
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-sm text-slate-200">
              <p className="font-semibold text-white">Cách dùng</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>Nhấn "Nhấn để nói" để bật ghi âm & STT (trình duyệt).</li>
                <li>Sau khi dừng, hệ thống phân tích cảm xúc và trả lời.</li>
                <li>Âm trả lời được đọc bằng Speech Synthesis (TTS) tại trình duyệt.</li>
              </ul>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

function encodeWAV(chunks, sampleRate) {
  const buffer = flattenArray(chunks);
  const wavBuffer = new ArrayBuffer(44 + buffer.length * 2);
  const view = new DataView(wavBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + buffer.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, buffer.length * 2, true);

  floatTo16BitPCM(view, 44, buffer);
  return new Blob([view], { type: 'audio/wav' });
}

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function flattenArray(chunks) {
  const length = chunks.reduce((acc, cur) => acc + cur.length, 0);
  const result = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default App;