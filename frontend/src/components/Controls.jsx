import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export function Controls({
  isRecording,
  isProcessing,
  audioBlob,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onSend,
  variant,
}) {
  const sendDisabled = isProcessing || (!isRecording && !audioBlob);

  return (
    <div className="mt-4 w-full flex items-center justify-center">
      <div className="flex items-center gap-4">
        {/* Left action: Ghi / Dừng / Hủy bản ghi */}
        <button
          onClick={() => {
            if (isRecording) return onStopRecording?.();
            if (audioBlob) return onCancelRecording?.();
            return onStartRecording?.();
          }}
          disabled={isProcessing}
          className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold shadow-md transition-transform transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isRecording
              ? 'bg-gradient-to-br from-rose-500 to-rose-400 text-white ring-rose-300'
              : audioBlob
              ? 'bg-white text-gray-800 border border-gray-300'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-400 text-white ring-emerald-300'
          } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          <span className="hidden sm:inline">
            {isRecording ? 'Dừng' : audioBlob ? 'Hủy bản ghi' : 'Ghi'}
          </span>
        </button>

        {/* Right action: Gửi */}
        <button
          onClick={() => onSend?.()}
          disabled={sendDisabled}
          className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold shadow-md transition-transform transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            sendDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white ring-indigo-300'
          }`}
        >
          <span>Gửi</span>
        </button>
      </div>
    </div>
  );
}
