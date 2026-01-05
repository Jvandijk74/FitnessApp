import { AICoach } from '@/components/chat/AICoach';

export default function CoachPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">AI Training Coach</h1>
        <p className="text-text-secondary">
          Get personalized guidance on your training program, progressive overload, and recovery
        </p>
      </div>

      <div className="card h-[calc(100%-6rem)]">
        <AICoach />
      </div>
    </div>
  );
}
