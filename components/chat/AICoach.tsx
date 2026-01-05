'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICoachProps {
  /** If true, shows as a compact version for embedding in dashboard */
  compact?: boolean;
}

export function AICoach({ compact = false }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Replace this with actual AI agent API call
    // For now, simulating a response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Simulated responses - replace with actual AI agent
  const getSimulatedResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('volume') || input.includes('progressive overload')) {
      return "Progressive overload is tracked through total volume (weight × reps × sets). I monitor your weekly volume trends and suggest small increases (2.5-5%) when you're recovering well and hitting target RPE/RIR consistently.";
    }

    if (input.includes('rpe') || input.includes('rir')) {
      return "RPE (Rate of Perceived Exertion) is a 1-10 scale where 10 is maximum effort. RIR (Reps in Reserve) indicates how many more reps you could do. RPE 8 ≈ 2 RIR. I use these to ensure you're training hard enough for adaptation without overreaching.";
    }

    if (input.includes('rest') || input.includes('recovery')) {
      return "Your rest days (Tue, Wed, Sat, Sun) are crucial for adaptation. I recommend light mobility work, stretching, and proper nutrition. If fatigue is high, I may suggest active recovery like walking or light cycling.";
    }

    if (input.includes('monday') || input.includes('strength')) {
      return "Monday is your main strength day focusing on mechanical tension with heavier loads (RPE 7-8) and longer rest periods (2-3 min). This builds maximal strength which transfers to your hypertrophy work.";
    }

    if (input.includes('friday') || input.includes('hypertrophy')) {
      return "Friday targets hypertrophy with higher volume (10-15+ reps), shorter rest (60-90s), and a pump-focused approach. This metabolic stress complements Monday's mechanical tension for complete muscle development.";
    }

    return "I'm here to help you understand your training program, explain exercise selection, discuss progressive overload strategies, and optimize your recovery. What specific aspect of your training would you like to discuss?";
  };

  const suggestedQuestions = [
    "How does progressive overload work?",
    "What's the difference between RPE and RIR?",
    "Why is Monday focused on strength?",
    "How should I approach rest days?",
    "Explain Friday's hypertrophy focus",
  ];

  if (compact) {
    return (
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-text-primary">Ask AI Coach</h3>
          </div>
          <a
            href="/coach"
            className="text-xs text-primary-400 hover:text-primary-300 transition"
          >
            Full chat →
          </a>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-lg border border-surface-elevated bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ask about your training..."
            disabled={isLoading}
          />
          <button
            className="btn-primary text-sm px-4"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Ask'}
          </button>
        </form>

        {messages.length > 0 && (
          <div className="max-h-32 overflow-y-auto space-y-2">
            {messages.slice(-2).map((msg) => (
              <div
                key={msg.id}
                className={`text-sm ${
                  msg.role === 'user' ? 'text-primary-400' : 'text-text-secondary'
                }`}
              >
                <span className="font-semibold">
                  {msg.role === 'user' ? 'You: ' : '🤖 Coach: '}
                </span>
                {msg.content}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🤖</div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                AI Training Coach
              </h3>
              <p className="text-text-secondary mb-6">
                Ask me anything about your training program, exercises, or recovery strategies.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-text-tertiary uppercase tracking-wide">
                Suggested questions
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(question)}
                    className="text-xs px-3 py-2 rounded-lg bg-surface-elevated text-text-secondary hover:bg-surface hover:text-primary-400 transition border border-surface-elevated"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-elevated text-text-primary border border-surface'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="bg-surface-elevated text-text-primary border border-surface rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-surface-elevated p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-surface-elevated bg-surface px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ask about training, exercises, recovery..."
            disabled={isLoading}
          />
          <button
            className="btn-primary px-6"
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
        <p className="text-xs text-text-tertiary mt-2 text-center">
          AI Coach provides guidance based on your training data and progressive overload principles
        </p>
      </div>
    </div>
  );
}
