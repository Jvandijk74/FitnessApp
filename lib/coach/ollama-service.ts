interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama2';
  }

  async chat(messages: OllamaMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.message.content;
    } catch (error) {
      console.error('Error calling Ollama:', error);
      throw new Error('Failed to get response from Ollama');
    }
  }

  async generateCoachResponse(userMessage: string, context?: string): Promise<string> {
    const systemPrompt = `You are an AI Fitness Coach assistant. You provide helpful explanations about training plans, but you NEVER override the Coach Engine's decisions.

Your role is to:
- Explain WHY certain workouts are prescribed
- Clarify training concepts (e.g., tempo runs, easy runs, threshold pace)
- Answer questions about training principles
- Provide motivation and encouragement
- Help interpret the weekly training plan

You should NOT:
- Modify the training plan
- Suggest different workouts than what the Coach Engine prescribed
- Override any decisions made by the deterministic Coach Engine

${context ? `Current context:\n${context}` : ''}

Be concise, supportive, and educational in your responses.`;

    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    return await this.chat(messages);
  }
}

export const ollamaService = new OllamaService();
