import React from 'react';
import { Volume2, AlertCircle } from 'lucide-react';
import { EMOTION_CONFIG } from '../config';

export function ChatBox({ messages, transcript, isRecording, micError, messagesEndRef }) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-3xl p-4 lg:p-6 shadow-2xl backdrop-blur flex flex-col min-h-[520px]">
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
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg border border-white/5 ${
                msg.type === 'user' ? 'bg-emerald-500/20 text-emerald-50' : 'bg-white/5 text-slate-50'
              }`}
            >
              {msg.type === 'user' && msg.emotion && EMOTION_CONFIG[msg.emotion] && (
                <div className="flex items-center gap-2 text-xs text-emerald-100 mb-1">
                  <span>{EMOTION_CONFIG[msg.emotion].icon}</span>
                  <span>{EMOTION_CONFIG[msg.emotion].label}</span>
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
    </section>
  );
}
