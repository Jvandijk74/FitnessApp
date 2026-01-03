'use server';

import { getServerSupabase } from '@/lib/db/server-client';

export interface WeeklyStats {
  totalDistance: number;
  totalRuns: number;
  averagePace: number;
  averageHR: number;
  totalDuration: number;
}

export interface HealthMetrics {
  aerobicFitness: number; // 0-100 score
  trainingLoad: number; // 0-100 score
  trend: 'improving' | 'stable' | 'declining';
}

export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  try {
    console.log('[Metrics] Calculating weekly stats for user:', userId);
    const supabase = await getServerSupabase();

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const { data: runs, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', weekStart.toISOString());

    if (error) {
      console.error('[Metrics] Error fetching weekly runs:', error);
      throw error;
    }

    if (!runs || runs.length === 0) {
      return {
        totalDistance: 0,
        totalRuns: 0,
        averagePace: 0,
        averageHR: 0,
        totalDuration: 0,
      };
    }

    const totalDistance = runs.reduce((sum, run) => sum + (run.distance_km || 0), 0);
    const totalDuration = runs.reduce((sum, run) => sum + (run.duration_minutes || 0), 0);
    const avgHR = runs.filter(r => r.avg_hr).length > 0
      ? runs.reduce((sum, run) => sum + (run.avg_hr || 0), 0) / runs.filter(r => r.avg_hr).length
      : 0;

    // Average pace in min/km
    const avgPace = totalDistance > 0 ? totalDuration / totalDistance : 0;

    console.log('[Metrics] Weekly stats calculated:', { totalDistance, totalRuns: runs.length });

    return {
      totalDistance,
      totalRuns: runs.length,
      averagePace: avgPace,
      averageHR: avgHR,
      totalDuration,
    };
  } catch (error) {
    console.error('[Metrics] Exception in getWeeklyStats:', error);
    return {
      totalDistance: 0,
      totalRuns: 0,
      averagePace: 0,
      averageHR: 0,
      totalDuration: 0,
    };
  }
}

export async function calculateHealthMetrics(userId: string): Promise<HealthMetrics> {
  try {
    console.log('[Metrics] Calculating health metrics for user:', userId);
    const supabase = await getServerSupabase();

    // Get last 30 days of runs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: runs, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', thirtyDaysAgo.toISOString())
      .order('activity_date', { ascending: true });

    if (error) {
      console.error('[Metrics] Error fetching runs for health metrics:', error);
      throw error;
    }

    if (!runs || runs.length < 3) {
      // Not enough data for meaningful metrics
      return {
        aerobicFitness: 50,
        trainingLoad: 50,
        trend: 'stable',
      };
    }

    // Calculate Aerobic Fitness Score
    // Based on pace/HR efficiency over time
    const recentRuns = runs.slice(-5); // Last 5 runs
    const olderRuns = runs.slice(0, Math.min(5, runs.length - 5)); // First 5 runs

    let aerobicFitness = 50;
    let trend: 'improving' | 'stable' | 'declining' = 'stable';

    if (olderRuns.length > 0 && recentRuns.length > 0) {
      // Calculate efficiency (distance/duration * HR factor)
      const calcEfficiency = (runSet: any[]) => {
        const validRuns = runSet.filter(r => r.distance_km && r.duration_minutes && r.avg_hr);
        if (validRuns.length === 0) return 0;

        const avgPace = validRuns.reduce((sum, r) => sum + (r.duration_minutes / r.distance_km), 0) / validRuns.length;
        const avgHR = validRuns.reduce((sum, r) => sum + r.avg_hr, 0) / validRuns.length;

        // Lower pace (faster) and lower HR = better efficiency
        return (1 / avgPace) * (180 / (avgHR || 150));
      };

      const oldEfficiency = calcEfficiency(olderRuns);
      const recentEfficiency = calcEfficiency(recentRuns);

      if (oldEfficiency > 0) {
        const improvement = ((recentEfficiency - oldEfficiency) / oldEfficiency) * 100;

        // Map improvement to 0-100 scale
        aerobicFitness = Math.max(0, Math.min(100, 50 + improvement * 2));

        if (improvement > 3) trend = 'improving';
        else if (improvement < -3) trend = 'declining';
      }
    }

    // Calculate Training Load
    // Based on recent weekly volume and frequency
    const weeklyStats = await getWeeklyStats(userId);
    const lastWeekDistance = weeklyStats.totalDistance;
    const lastWeekRuns = weeklyStats.totalRuns;

    // Ideal: 3-5 runs per week, 20-50km
    const frequencyScore = Math.min(100, (lastWeekRuns / 4) * 100);
    const volumeScore = Math.min(100, (lastWeekDistance / 35) * 100);
    const trainingLoad = (frequencyScore + volumeScore) / 2;

    console.log('[Metrics] Health metrics calculated:', { aerobicFitness, trainingLoad, trend });

    return {
      aerobicFitness: Math.round(aerobicFitness),
      trainingLoad: Math.round(trainingLoad),
      trend,
    };
  } catch (error) {
    console.error('[Metrics] Exception in calculateHealthMetrics:', error);
    return {
      aerobicFitness: 50,
      trainingLoad: 50,
      trend: 'stable',
    };
  }
}

export async function getMonthlyAnalytics(userId: string) {
  try {
    console.log('[Metrics] Calculating monthly analytics for user:', userId);
    const supabase = await getServerSupabase();

    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: runs, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', thirtyDaysAgo.toISOString())
      .order('activity_date', { ascending: true });

    if (error) throw error;

    // Calculate weekly data for the last 4 weeks
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const weekRuns = runs?.filter(r => {
        const date = new Date(r.activity_date);
        return date >= weekStart && date < weekEnd;
      }) || [];

      const distance = weekRuns.reduce((sum, r) => sum + (r.distance_km || 0), 0);
      const duration = weekRuns.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
      const avgHR = weekRuns.filter(r => r.avg_hr).length > 0
        ? weekRuns.reduce((sum, r) => sum + (r.avg_hr || 0), 0) / weekRuns.filter(r => r.avg_hr).length
        : 0;
      const avgPace = distance > 0 ? duration / distance : 0; // min/km

      weeklyData.push({
        week: `Week ${4 - i}`,
        distance: Math.round(distance * 10) / 10,
        avgHR: Math.round(avgHR),
        avgPace: Math.round(avgPace * 100) / 100, // Round to 2 decimals
        runs: weekRuns.length,
      });
    }

    // Calculate totals
    const totalDistance = runs?.reduce((sum, r) => sum + (r.distance_km || 0), 0) || 0;
    const totalRuns = runs?.length || 0;
    const totalDuration = runs?.reduce((sum, r) => sum + (r.duration_minutes || 0), 0) || 0;
    const avgPace = totalDistance > 0 ? totalDuration / totalDistance : 0;

    // Find best week
    const bestWeek = weeklyData.reduce((best, week) =>
      week.distance > best.distance ? week : best
    , weeklyData[0]);

    // Calculate consistency (weeks with at least 1 run)
    const weeksWithRuns = weeklyData.filter(w => w.runs > 0).length;
    const consistency = (weeksWithRuns / 4) * 100;

    console.log('[Metrics] Monthly analytics calculated');

    return {
      weeklyData,
      totals: {
        distance: totalDistance,
        runs: totalRuns,
        duration: totalDuration,
        avgPace,
      },
      insights: {
        bestWeek: bestWeek.distance,
        bestWeekName: bestWeek.week,
        consistency: Math.round(consistency),
        improvement: weeklyData[3].distance > weeklyData[0].distance
          ? Math.round(((weeklyData[3].distance - weeklyData[0].distance) / (weeklyData[0].distance || 1)) * 100)
          : 0,
      },
    };
  } catch (error) {
    console.error('[Metrics] Exception in getMonthlyAnalytics:', error);
    return {
      weeklyData: [
        { week: 'Week 1', distance: 0, avgHR: 0, runs: 0 },
        { week: 'Week 2', distance: 0, avgHR: 0, runs: 0 },
        { week: 'Week 3', distance: 0, avgHR: 0, runs: 0 },
        { week: 'Week 4', distance: 0, avgHR: 0, runs: 0 },
      ],
      totals: { distance: 0, runs: 0, duration: 0, avgPace: 0 },
      insights: { bestWeek: 0, bestWeekName: 'Week 1', consistency: 0, improvement: 0 },
    };
  }
}

export async function generateInsights(userId: string) {
  try {
    console.log('[Metrics] Generating insights for user:', userId);
    const supabase = await getServerSupabase();

    const insights = [];

    // Get last 14 days of runs
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: recentRuns, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', fourteenDaysAgo.toISOString())
      .order('activity_date', { ascending: true });

    if (error) throw error;

    if (!recentRuns || recentRuns.length === 0) {
      insights.push({
        id: 'no-data',
        title: 'Start tracking your runs',
        detail: 'Connect to Strava or log your first run to get personalized insights.',
        type: 'info' as const,
        timestamp: 'Just now',
      });
      return insights;
    }

    // Insight 1: Pace trend
    const runsWithPace = recentRuns.filter(r => r.distance_km && r.duration_minutes);
    if (runsWithPace.length >= 3) {
      const paces = runsWithPace.map(r => r.duration_minutes / r.distance_km);
      const recentAvgPace = paces.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const olderAvgPace = paces.slice(0, Math.min(3, paces.length - 3)).reduce((a, b) => a + b, 0) / Math.min(3, paces.length - 3);

      if (olderAvgPace > 0) {
        const improvement = ((olderAvgPace - recentAvgPace) / olderAvgPace) * 100;

        if (improvement > 2) {
          const oldPaceFormatted = `${Math.floor(olderAvgPace)}:${String(Math.round((olderAvgPace % 1) * 60)).padStart(2, '0')}`;
          const newPaceFormatted = `${Math.floor(recentAvgPace)}:${String(Math.round((recentAvgPace % 1) * 60)).padStart(2, '0')}`;

          insights.push({
            id: 'pace-improving',
            title: 'Pace improving consistently',
            detail: `Your average pace improved from ${oldPaceFormatted}/km to ${newPaceFormatted}/km in recent runs.`,
            type: 'success' as const,
            timestamp: '2 hours ago',
          });
        } else if (improvement < -5) {
          insights.push({
            id: 'pace-declining',
            title: 'Pace slowing down',
            detail: 'Recent runs are slower than usual. Consider recovery or check for overtraining.',
            type: 'warning' as const,
            timestamp: '2 hours ago',
          });
        }
      }
    }

    // Insight 2: Heart rate efficiency
    const runsWithHR = recentRuns.filter(r => r.avg_hr && r.distance_km && r.duration_minutes);
    if (runsWithHR.length >= 4) {
      const recent = runsWithHR.slice(-2);
      const older = runsWithHR.slice(0, 2);

      const recentAvgHR = recent.reduce((sum, r) => sum + r.avg_hr, 0) / recent.length;
      const olderAvgHR = older.reduce((sum, r) => sum + r.avg_hr, 0) / older.length;

      if (recentAvgHR < olderAvgHR - 3) {
        insights.push({
          id: 'hr-efficiency',
          title: 'Heart rate efficiency improving',
          detail: `Average HR decreased by ${Math.round(olderAvgHR - recentAvgHR)} bpm at similar pace - great aerobic adaptation!`,
          type: 'success' as const,
          timestamp: '5 hours ago',
        });
      }
    }

    // Insight 3: Training consistency
    const daysWithRuns = new Set(recentRuns.map(r => new Date(r.activity_date).toDateString())).size;
    if (daysWithRuns >= 3 && recentRuns.length >= 3) {
      insights.push({
        id: 'consistency',
        title: 'Training consistency strong',
        detail: `${recentRuns.length} runs in ${daysWithRuns} days. Consistency builds fitness!`,
        type: 'success' as const,
        timestamp: '1 day ago',
      });
    } else if (recentRuns.length === 1) {
      insights.push({
        id: 'consistency-low',
        title: 'Time to get back out there',
        detail: 'Only 1 run in the last 14 days. Aim for 3-4 runs per week for steady progress.',
        type: 'info' as const,
        timestamp: '1 day ago',
      });
    }

    // Insight 4: Weekly volume
    const weeklyStats = await getWeeklyStats(userId);
    if (weeklyStats.totalDistance > 0) {
      if (weeklyStats.totalDistance > 40) {
        insights.push({
          id: 'high-volume',
          title: 'High training volume this week',
          detail: `${weeklyStats.totalDistance.toFixed(1)}km logged. Ensure adequate recovery between runs.`,
          type: 'warning' as const,
          timestamp: '3 hours ago',
        });
      } else if (weeklyStats.totalDistance >= 20 && weeklyStats.totalDistance <= 40) {
        insights.push({
          id: 'optimal-volume',
          title: 'Training volume in optimal range',
          detail: `${weeklyStats.totalDistance.toFixed(1)}km this week provides good fitness stimulus with manageable fatigue.`,
          type: 'success' as const,
          timestamp: '3 hours ago',
        });
      }
    }

    console.log('[Metrics] Generated', insights.length, 'insights');
    return insights.slice(0, 3); // Return top 3 insights
  } catch (error) {
    console.error('[Metrics] Exception in generateInsights:', error);
    return [
      {
        id: 'error',
        title: 'Unable to generate insights',
        detail: 'Keep logging your runs to get personalized training insights.',
        type: 'info' as const,
        timestamp: 'Just now',
      },
    ];
  }
}
