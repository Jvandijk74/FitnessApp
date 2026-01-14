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

    // Get last 120 days to ensure we have 4 full months of data
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    const { data: runs, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', fourMonthsAgo.toISOString())
      .order('activity_date', { ascending: true });

    if (error) throw error;

    // Calculate monthly data for the last 4 months
    const monthlyData = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 3; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);

      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      const monthRuns = runs?.filter(r => {
        const date = new Date(r.activity_date);
        return date >= monthStart && date <= monthEnd;
      }) || [];

      const distance = monthRuns.reduce((sum, r) => sum + (r.distance_km || 0), 0);
      const duration = monthRuns.reduce((sum, r) => sum + (r.duration_minutes || 0), 0);
      const avgHR = monthRuns.filter(r => r.avg_hr).length > 0
        ? monthRuns.reduce((sum, r) => sum + (r.avg_hr || 0), 0) / monthRuns.filter(r => r.avg_hr).length
        : 0;
      const avgPace = distance > 0 ? duration / distance : 0; // min/km

      monthlyData.push({
        month: monthNames[monthDate.getMonth()],
        distance: Math.round(distance * 10) / 10,
        avgHR: Math.round(avgHR),
        avgPace: Math.round(avgPace * 100) / 100, // Round to 2 decimals
        runs: monthRuns.length,
      });
    }

    // Calculate totals for last 120 days
    const totalDistance = runs?.reduce((sum, r) => sum + (r.distance_km || 0), 0) || 0;
    const totalRuns = runs?.length || 0;
    const totalDuration = runs?.reduce((sum, r) => sum + (r.duration_minutes || 0), 0) || 0;
    const avgPace = totalDistance > 0 ? totalDuration / totalDistance : 0;

    // Find best month
    const bestMonth = monthlyData.reduce((best, month) =>
      month.distance > best.distance ? month : best
    , monthlyData[0]);

    // Calculate consistency (months with at least 1 run)
    const monthsWithRuns = monthlyData.filter(m => m.runs > 0).length;
    const consistency = (monthsWithRuns / 4) * 100;

    console.log('[Metrics] Monthly analytics calculated');

    // Also get weekly stats for summary cards
    const weeklyStats = await getWeeklyStats(userId);

    return {
      weeklyData: monthlyData, // Keep name for backward compatibility
      weeklyStats, // NEW: Current week stats for summary cards
      totals: {
        distance: totalDistance,
        runs: totalRuns,
        duration: totalDuration,
        avgPace,
      },
      insights: {
        bestWeek: bestMonth.distance,
        bestWeekName: bestMonth.month,
        consistency: Math.round(consistency),
        improvement: monthlyData[3].distance > monthlyData[0].distance
          ? Math.round(((monthlyData[3].distance - monthlyData[0].distance) / (monthlyData[0].distance || 1)) * 100)
          : 0,
      },
    };
  } catch (error) {
    console.error('[Metrics] Exception in getMonthlyAnalytics:', error);
    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      weeklyData: [
        { month: monthNames[(now.getMonth() - 3 + 12) % 12], distance: 0, avgHR: 0, avgPace: 0, runs: 0 },
        { month: monthNames[(now.getMonth() - 2 + 12) % 12], distance: 0, avgHR: 0, avgPace: 0, runs: 0 },
        { month: monthNames[(now.getMonth() - 1 + 12) % 12], distance: 0, avgHR: 0, avgPace: 0, runs: 0 },
        { month: monthNames[now.getMonth()], distance: 0, avgHR: 0, avgPace: 0, runs: 0 },
      ],
      weeklyStats: { totalDistance: 0, totalRuns: 0, averagePace: 0, averageHR: 0, totalDuration: 0 },
      totals: { distance: 0, runs: 0, duration: 0, avgPace: 0 },
      insights: { bestWeek: 0, bestWeekName: monthNames[now.getMonth()], consistency: 0, improvement: 0 },
    };
  }
}

export interface RacePaceEstimates {
  pace5k: number; // min/km
  pace10k: number;
  paceHalfMarathon: number;
  paceMarathon: number;
  basedOnDistance: number; // The distance used for calculation
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface LactateThresholds {
  lt1Pace: number; // min/km - Aerobic threshold
  lt1HR: number; // bpm
  lt2Pace: number; // min/km - Anaerobic/Lactate threshold
  lt2HR: number; // bpm
  maxHR: number; // Estimated or actual max HR
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

/**
 * Calculate estimated race paces using Riegel's formula and recent training data
 * Formula: T2 = T1 × (D2/D1)^1.06
 */
export async function calculateRacePaces(userId: string): Promise<RacePaceEstimates> {
  try {
    const supabase = await getServerSupabase();

    // Get last 60 days of runs to find best performances
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: runs, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', sixtyDaysAgo.toISOString())
      .order('activity_date', { ascending: false });

    if (error || !runs || runs.length === 0) {
      return {
        pace5k: 0,
        pace10k: 0,
        paceHalfMarathon: 0,
        paceMarathon: 0,
        basedOnDistance: 0,
        confidence: 'low',
        explanation: 'Insufficient training data. Complete more runs to get accurate estimates.',
      };
    }

    // Find best recent performances at different distances
    const runsWithPace = runs.filter(r => r.distance_km > 3 && r.duration_minutes > 0);

    if (runsWithPace.length === 0) {
      return {
        pace5k: 0,
        pace10k: 0,
        paceHalfMarathon: 0,
        paceMarathon: 0,
        basedOnDistance: 0,
        confidence: 'low',
        explanation: 'No runs over 3km found. Complete longer runs for accurate predictions.',
      };
    }

    // Calculate pace for each run and find best performances
    const runsByDistance = runsWithPace.map(r => ({
      distance: r.distance_km,
      pace: r.duration_minutes / r.distance_km,
      duration: r.duration_minutes,
    }));

    // Find best pace (fastest) for distances close to common race distances
    const findBestPace = (targetDistance: number, tolerance: number) => {
      const relevantRuns = runsByDistance.filter(r =>
        Math.abs(r.distance - targetDistance) <= tolerance
      );
      if (relevantRuns.length === 0) return null;
      return relevantRuns.reduce((best, run) => run.pace < best.pace ? run : best);
    };

    // Try to find actual race data
    let baseRun = findBestPace(5, 1.5) || findBestPace(10, 2) || findBestPace(21.1, 3);

    // If no race-specific data, use best pace from any run
    if (!baseRun) {
      baseRun = runsByDistance.reduce((best, run) => run.pace < best.pace ? run : best);
    }

    const basePace = baseRun.pace;
    const baseDistance = baseRun.distance;

    // Riegel's formula: T2 = T1 × (D2/D1)^1.06
    const calculatePaceForDistance = (targetDistance: number) => {
      const ratio = Math.pow(targetDistance / baseDistance, 1.06);
      return basePace * ratio;
    };

    const pace5k = calculatePaceForDistance(5);
    const pace10k = calculatePaceForDistance(10);
    const paceHalfMarathon = calculatePaceForDistance(21.0975);
    const paceMarathon = calculatePaceForDistance(42.195);

    // Determine confidence based on data quality
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (runsWithPace.length >= 10 && baseDistance >= 8) {
      confidence = 'high';
    } else if (runsWithPace.length < 5 || baseDistance < 5) {
      confidence = 'low';
    }

    const explanation = `Calculated using Riegel's formula (T2 = T1 × (D2/D1)^1.06) based on your best ${baseDistance.toFixed(1)}km performance at ${Math.floor(basePace)}:${String(Math.round((basePace % 1) * 60)).padStart(2, '0')}/km pace from the last 60 days. ${runsWithPace.length} qualifying runs analyzed.`;

    return {
      pace5k,
      pace10k,
      paceHalfMarathon,
      paceMarathon,
      basedOnDistance: baseDistance,
      confidence,
      explanation,
    };
  } catch (error) {
    console.error('[Metrics] Error calculating race paces:', error);
    return {
      pace5k: 0,
      pace10k: 0,
      paceHalfMarathon: 0,
      paceMarathon: 0,
      basedOnDistance: 0,
      confidence: 'low',
      explanation: 'Unable to calculate race paces. Please ensure you have logged recent runs.',
    };
  }
}

/**
 * Calculate lactate thresholds (LT1 and LT2) from heart rate data
 */
export async function calculateLactateThresholds(userId: string): Promise<LactateThresholds> {
  try {
    const supabase = await getServerSupabase();

    // Get user age for max HR estimation
    const { data: user } = await supabase
      .from('users')
      .select('age')
      .eq('id', userId)
      .single();

    const age = user?.age || 30;
    const estimatedMaxHR = 220 - age;

    // Get last 60 days of runs with HR data
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: runs, error } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', sixtyDaysAgo.toISOString())
      .order('activity_date', { ascending: false });

    if (error || !runs || runs.length === 0) {
      return {
        lt1Pace: 0,
        lt1HR: Math.round(estimatedMaxHR * 0.72),
        lt2Pace: 0,
        lt2HR: Math.round(estimatedMaxHR * 0.87),
        maxHR: estimatedMaxHR,
        confidence: 'low',
        explanation: 'Estimated from age-based max HR formula (220 - age). Complete runs with heart rate data for personalized thresholds.',
      };
    }

    // Find actual max HR from data
    const runsWithHR = runs.filter(r => r.avg_hr && r.max_hr);
    const actualMaxHR = runsWithHR.length > 0
      ? Math.max(...runsWithHR.map(r => r.max_hr))
      : estimatedMaxHR;

    // Use actual max if significantly different from estimate
    const maxHR = actualMaxHR > estimatedMaxHR * 0.9 ? actualMaxHR : estimatedMaxHR;

    // Calculate threshold estimates
    // LT1 (Aerobic Threshold): ~70-75% of max HR
    // LT2 (Anaerobic Threshold): ~85-90% of max HR
    const lt1HR = Math.round(maxHR * 0.72);
    const lt2HR = Math.round(maxHR * 0.87);

    // Find runs near threshold HR to estimate threshold pace
    const findThresholdPace = (targetHR: number, tolerance: number) => {
      const thresholdRuns = runsWithHR.filter(r =>
        r.avg_hr >= targetHR - tolerance &&
        r.avg_hr <= targetHR + tolerance &&
        r.distance_km > 3 &&
        r.duration_minutes > 0
      );

      if (thresholdRuns.length === 0) return 0;

      // Average pace of runs at this HR
      const avgPace = thresholdRuns.reduce((sum, r) =>
        sum + (r.duration_minutes / r.distance_km), 0
      ) / thresholdRuns.length;

      return avgPace;
    };

    let lt1Pace = findThresholdPace(lt1HR, 5);
    let lt2Pace = findThresholdPace(lt2HR, 5);

    // If no data at threshold HR, estimate from average pace
    if (lt1Pace === 0 || lt2Pace === 0) {
      const allPaces = runsWithHR
        .filter(r => r.distance_km > 3 && r.duration_minutes > 0)
        .map(r => r.duration_minutes / r.distance_km);

      if (allPaces.length > 0) {
        const avgPace = allPaces.reduce((a, b) => a + b, 0) / allPaces.length;
        // LT1 is typically 10-15% slower than average training pace
        // LT2 is typically 5-8% slower than average training pace
        if (lt1Pace === 0) lt1Pace = avgPace * 1.12;
        if (lt2Pace === 0) lt2Pace = avgPace * 1.06;
      }
    }

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    const hrRunCount = runsWithHR.length;
    const hasActualMax = actualMaxHR > estimatedMaxHR * 0.9;

    if (hrRunCount >= 15 && hasActualMax) {
      confidence = 'high';
    } else if (hrRunCount < 5) {
      confidence = 'low';
    }

    const explanation = `${hasActualMax ? 'Calculated from your actual max HR of ' + maxHR + ' bpm' : 'Estimated using age-based formula (220 - ' + age + ' = ' + maxHR + ' bpm)'}. LT1 (aerobic threshold) at ${Math.round((lt1HR/maxHR)*100)}% max HR, LT2 (lactate threshold) at ${Math.round((lt2HR/maxHR)*100)}% max HR. Based on ${hrRunCount} runs with heart rate data from the last 60 days.`;

    return {
      lt1Pace,
      lt1HR,
      lt2Pace,
      lt2HR,
      maxHR,
      confidence,
      explanation,
    };
  } catch (error) {
    console.error('[Metrics] Error calculating lactate thresholds:', error);
    const estimatedMaxHR = 220 - 30; // Default age 30
    return {
      lt1Pace: 0,
      lt1HR: Math.round(estimatedMaxHR * 0.72),
      lt2Pace: 0,
      lt2HR: Math.round(estimatedMaxHR * 0.87),
      maxHR: estimatedMaxHR,
      confidence: 'low',
      explanation: 'Unable to calculate thresholds. Log runs with heart rate data for personalized estimates.',
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
