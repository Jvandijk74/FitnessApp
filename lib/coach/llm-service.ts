interface Message {
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

interface GroqResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

type LLMProvider = 'ollama' | 'groq';

export class LLMService {
  private provider: LLMProvider;
  private baseUrl: string;
  private model: string;
  private apiKey?: string;

  constructor() {
    // Determine provider based on environment variables
    this.apiKey = process.env.GROQ_API_KEY;

    if (this.apiKey) {
      this.provider = 'groq';
      this.baseUrl = 'https://api.groq.com/openai/v1';
      this.model = process.env.LLM_MODEL || 'llama-3.1-8b-instant';
    } else {
      this.provider = 'ollama';
      this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      this.model = process.env.OLLAMA_MODEL || 'llama2';
    }

    console.log(`Using LLM provider: ${this.provider} with model: ${this.model}`);
  }

  async chat(messages: Message[]): Promise<string> {
    if (this.provider === 'groq') {
      return this.chatWithGroq(messages);
    } else {
      return this.chatWithOllama(messages);
    }
  }

  private async chatWithOllama(messages: Message[]): Promise<string> {
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

  private async chatWithGroq(messages: Message[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Groq:', error);
      throw new Error('Failed to get response from Groq');
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

    const messages: Message[] = [
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

export const llmService = new LLMService();
