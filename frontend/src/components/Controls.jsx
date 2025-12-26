import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

export function Controls({ isRecording, isProcessing, audioBlob, onStartRecording, onStopRecording, onSend }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
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
        onClick={onSend}
        disabled={isProcessing}
        className={`px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 border border-white/10 ${
          !isProcessing
            ? 'bg-white/10 text-emerald-100 hover:bg-white/20'
            : 'bg-white/5 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Send size={18} />
        {isProcessing ? 'Đang xử lý...' : 'Gửi'}
      </button>
    </div>
  );
}
