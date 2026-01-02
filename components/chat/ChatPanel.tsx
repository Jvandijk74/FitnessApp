'use client';

import { useState } from 'react';

export function ChatPanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">Ask AI Coach</h3>
          <p className="text-xs text-white/60">Get explanations about your training plan</p>
        </div>
        <span className="badge-primary">Beta</span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg p-4 bg-white/5 mb-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-white/60 text-sm">Ask about rationale, intensity, or how deloads trigger</p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <button
                onClick={() => setInput('Explain my Friday double day')}
                className="badge badge-primary hover:bg-primary/30 cursor-pointer transition-colors"
              >
                Friday double day
              </button>
              <button
                onClick={() => setInput('Why is my tempo run scheduled on Wednesday?')}
                className="badge badge-primary hover:bg-primary/30 cursor-pointer transition-colors"
              >
                Tempo scheduling
              </button>
              <button
                onClick={() => setInput('How do deloads trigger?')}
                className="badge badge-primary hover:bg-primary/30 cursor-pointer transition-colors"
              >
                Deload triggers
              </button>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary/20 text-white border border-primary/30'
                  : 'bg-white/10 text-white border border-white/10'
              }`}
            >
              <p className="text-xs font-semibold mb-1 opacity-60">
                {msg.role === 'assistant' ? 'AI Coach' : 'You'}
              </p>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        className="flex gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!input.trim()) return;
          const payload = input;
          setMessages((prev) => [...prev, { role: 'user', content: payload }]);
          setInput('');
          // Placeholder for tool calling: call API route that uses deterministic data
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content:
                  'The coach engine keeps Friday as a capped double: easy aerobic run at RPE 6 and strength capped at RPE 6 to protect recovery heading into Sunday. This ensures you\'re fresh for your long run.'
              }
            ]);
          }, 500);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="form-input flex-1"
          placeholder="Ask how progressions are calculated..."
        />
        <button className="btn-primary" type="submit" disabled={!input.trim()}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
      </form>
    </div>
  );
}
