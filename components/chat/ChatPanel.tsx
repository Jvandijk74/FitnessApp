'use client';

import { useState } from 'react';

export function ChatPanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('Explain my Friday double day.');

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Coach (explanations only)</h3>
        <p className="text-xs text-white/60">Uses backend tools, never overrides the Coach Engine.</p>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto border border-white/5 rounded-lg p-3">
        {messages.length === 0 && (
          <p className="text-white/60 text-sm">Ask about rationale, intensity, or how deloads trigger.</p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'assistant' ? 'text-white' : 'text-sky-300'}>
            <span className="font-semibold">{msg.role === 'assistant' ? 'Coach' : 'You'}: </span>
            {msg.content}
          </div>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const payload = input;
          setMessages((prev) => [...prev, { role: 'user', content: payload }]);
          setInput('');
          // Placeholder for tool calling: call API route that uses deterministic data
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content:
                'The coach engine keeps Friday as a capped double: easy aerobic run at RPE 6 and strength capped at RPE 6 to protect recovery heading into Sunday.'
            }
          ]);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 p-2"
          placeholder="Ask how progressions are calculated"
        />
        <button className="btn-primary" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
