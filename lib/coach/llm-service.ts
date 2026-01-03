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
      console.log('🤖 [LLM Service] Initialized with Groq AI');
      console.log(`   ✅ Provider: Groq`);
      console.log(`   ✅ Model: ${this.model}`);
      console.log(`   ✅ API Key: ${this.apiKey.substring(0, 10)}...`);
      console.log(`   ✅ Base URL: ${this.baseUrl}`);
    } else {
      this.provider = 'ollama';
      this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      this.model = process.env.OLLAMA_MODEL || 'llama2';
      console.log('🤖 [LLM Service] Initialized with Ollama (Groq API key not found)');
      console.log(`   ⚠️  Provider: Ollama (Fallback)`);
      console.log(`   ⚠️  Model: ${this.model}`);
      console.log(`   ⚠️  Base URL: ${this.baseUrl}`);
    }
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
    const startTime = Date.now();
    const userMessage = messages.find(m => m.role === 'user')?.content || '';

    console.log('\n🚀 [Groq API] Starting request');
    console.log(`   📝 User message: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"`);
    console.log(`   🔧 Model: ${this.model}`);
    console.log(`   📊 Message count: ${messages.length}`);

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

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`\n❌ [Groq API] Request failed (${duration}ms)`);
        console.error(`   Status: ${response.status} ${response.statusText}`);
        console.error(`   Error: ${errorText}`);
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: GroqResponse = await response.json();
      const responseContent = data.choices[0].message.content;

      console.log(`\n✅ [Groq API] Request successful (${duration}ms)`);
      console.log(`   📝 Response: "${responseContent.substring(0, 100)}${responseContent.length > 100 ? '...' : ''}"`);
      console.log(`   📏 Response length: ${responseContent.length} characters`);
      console.log(`   ⏱️  Duration: ${duration}ms`);

      return responseContent;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`\n❌ [Groq API] Exception occurred (${duration}ms)`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
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
