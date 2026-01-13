'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NutritionCoachProps {
  userId: string;
  currentRequirements: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null;
  currentSummary: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  } | null;
}

export function NutritionCoach({ userId, currentRequirements, currentSummary }: NutritionCoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your nutrition coach. I can help you with meal recommendations, answer nutrition questions, and provide guidance based on your daily goals. What would you like to know?",
    },
  ]);
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

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    try {
      // Build context for the AI
      let context = '';
      if (currentRequirements && currentSummary) {
        const remaining = {
          calories: currentRequirements.calories - currentSummary.totalCalories,
          protein: currentRequirements.protein - currentSummary.totalProtein,
          carbs: currentRequirements.carbs - currentSummary.totalCarbs,
          fat: currentRequirements.fat - currentSummary.totalFat,
        };

        context = `\n\nUser's Daily Goals:\n- Calories: ${currentRequirements.calories} kcal\n- Protein: ${currentRequirements.protein}g\n- Carbs: ${currentRequirements.carbs}g\n- Fat: ${currentRequirements.fat}g\n\nConsumed Today:\n- Calories: ${currentSummary.totalCalories} kcal\n- Protein: ${Math.round(currentSummary.totalProtein)}g\n- Carbs: ${Math.round(currentSummary.totalCarbs)}g\n- Fat: ${Math.round(currentSummary.totalFat)}g\n\nRemaining:\n- Calories: ${remaining.calories} kcal\n- Protein: ${Math.round(remaining.protein)}g\n- Carbs: ${Math.round(remaining.carbs)}g\n- Fat: ${Math.round(remaining.fat)}g`;
      }

      const response = await fetch('/api/nutrition/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error getting nutrition advice:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'What should I eat for lunch?',
    'Suggest a high-protein snack',
    'What are good pre-workout meals?',
    'Give me a healthy dinner idea',
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="card h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-1">AI Nutrition Coach</h3>
        <p className="text-sm text-text-tertiary">
          Get personalized meal recommendations and nutrition advice
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-elevated text-text-primary'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-elevated text-text-primary rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-pulse">Thinking...</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-xs text-text-tertiary mb-2">Quick questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-xs p-2 rounded-lg bg-surface-elevated text-text-secondary hover:bg-surface hover:text-text-primary transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about meals, snacks, or nutrition..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
