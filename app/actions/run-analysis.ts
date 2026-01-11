'use server';

import { LLMService } from '@/lib/coach/llm-service';
import type { RunData } from '@/lib/metrics/running';

export async function generateRunAnalysis(runData: RunData) {
  try {
    console.log('[Run Analysis] Generating AI analysis for run');

    const distanceKm = (runData.distance / 1000).toFixed(2);
    const durationMin = Math.floor(runData.duration / 60);
    const pace = runData.averageSpeed
      ? `${Math.floor(1000 / (runData.averageSpeed * 60))}:${String(Math.floor((1000 / runData.averageSpeed) % 60)).padStart(2, '0')}`
      : 'N/A';

    const prompt = `You are an expert running coach analyzing a completed run. Provide a brief, actionable analysis.

Run Data:
- Distance: ${distanceKm} km
- Duration: ${durationMin} minutes
- Average Pace: ${pace} /km
- Average Heart Rate: ${runData.averageHR || 'N/A'} bpm
- Max Heart Rate: ${runData.maxHR || 'N/A'} bpm
- Elevation Gain: ${runData.totalElevationGain || 0}m

Provide a response in TWO sections:

1. RUN ANALYSIS (2-3 sentences):
Brief analysis of the run quality, intensity, and execution.

2. TRAINING BENEFIT (2-3 sentences):
Explain specifically how this run contributes to the runner's improvement and fitness development.

Keep it concise, actionable, and motivating. Focus on physiological adaptations.`;

    const llm = new LLMService();
    const analysis = await llm.chat([
      { role: 'user', content: prompt }
    ]);

    console.log('[Run Analysis] AI analysis generated successfully');
    return {
      success: true,
      analysis
    };
  } catch (error) {
    console.error('[Run Analysis] Error generating analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate analysis'
    };
  }
}
