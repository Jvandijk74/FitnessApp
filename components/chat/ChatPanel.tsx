'use client';

import { useState } from 'react';

export function ChatPanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          if (!input.trim() || isLoading) return;

          const userMessage = input.trim();
          setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
          setInput('');
          setIsLoading(true);

          try {
            const response = await fetch('/api/coach/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
              throw new Error('Failed to get response from AI Coach');
            }

            const data = await response.json();
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: data.response
              }
            ]);
          } catch (error) {
            console.error('Error calling AI Coach:', error);
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure Ollama is running locally and try again.'
              }
            ]);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 p-2"
          placeholder="Ask about your training plan..."
          disabled={isLoading}
        />
        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
