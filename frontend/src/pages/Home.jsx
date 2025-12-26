import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-3xl bg-emerald-500/20 border border-emerald-300/30 flex items-center justify-center">
            <Sparkles className="text-emerald-200" size={40} />
          </div>
        </div>

        <h1 className="text-5xl font-bold">Thera Voice</h1>
        <p className="text-xl text-slate-300">
          Chatbot AI nhận diện cảm xúc bằng giọng nói
        </p>

        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Công nghệ STT/TTS + Emotion Detection + LLM
          </p>

          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-semibold hover:brightness-110 transition-all border border-emerald-400"
          >
            <MessageSquare size={20} />
            Bắt đầu trò chuyện
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-emerald-200 font-semibold">🎤</p>
            <p className="text-xs mt-2">Nhận diện giọng nói</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-amber-200 font-semibold">😊</p>
            <p className="text-xs mt-2">Phân tích cảm xúc</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-blue-200 font-semibold">💬</p>
            <p className="text-xs mt-2">AI trả lời thông minh</p>
          </div>
        </div>
      </div>
    </div>
  );
}
