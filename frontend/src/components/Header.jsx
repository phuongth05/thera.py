import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { EMOTION_CONFIG } from '../config';

export function Header({ currentEmotion, onClearMessages }) {
  return (
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
            onClick={onClearMessages}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-sm"
          >
            <Trash2 size={16} />
            Xóa lịch sử
          </button>
        </div>
      </div>

      {currentEmotion && EMOTION_CONFIG[currentEmotion] && (
        <div className={`mt-4 inline-flex items-center gap-3 px-4 py-3 rounded-2xl border ${EMOTION_CONFIG[currentEmotion].color}`}>
          <span className="text-2xl">{EMOTION_CONFIG[currentEmotion].icon}</span>
          <div className="leading-tight">
            <p className="text-xs text-slate-500">Cảm xúc được phát hiện</p>
            <p className="text-sm font-semibold">{EMOTION_CONFIG[currentEmotion].label}</p>
          </div>
        </div>
      )}
    </header>
  );
}
