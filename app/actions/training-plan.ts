'use server';

import { getServerSupabase } from '@/lib/db/server-client';

export interface WeekPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  runWorkouts: any[];
  strengthWorkouts: any[];
}

export interface MuscleGroupVolume {
  chest: number;
  back: number;
  legs: number;
  shoulders: number;
  arms: number;
  core: number;
}

export async function getWeekPlan(userId: string, weekNumber: number) {
  try {
    console.log('[Training Plan] Getting plan for user:', userId, 'week:', weekNumber);
    const supabase = await getServerSupabase();

    // Calculate week start/end dates
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday

    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + (weekNumber - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Get run workouts for this week
    const { data: runs } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', weekStart.toISOString())
      .lte('activity_date', weekEnd.toISOString())
      .order('activity_date', { ascending: true });

    // Get strength workouts for this week
    const { data: strength } = await supabase
      .from('strength_exercises')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', weekStart.toISOString())
      .lte('activity_date', weekEnd.toISOString())
      .order('activity_date', { ascending: true });

    return {
      weekNumber,
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
      runWorkouts: runs || [],
      strengthWorkouts: strength || [],
    };
  } catch (error) {
    console.error('[Training Plan] Error getting week plan:', error);
    throw error;
  }
}

export async function calculateMuscleGroupVolumes(userId: string, weekNumber: number): Promise<MuscleGroupVolume> {
  try {
    const supabase = await getServerSupabase();

    // Calculate week start/end
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1);

    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + (weekNumber - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Get all strength exercises for the week
    const { data: exercises } = await supabase
      .from('strength_exercises')
      .select('*, strength_sets_logged(*)')
      .eq('user_id', userId)
      .gte('activity_date', weekStart.toISOString())
      .lte('activity_date', weekEnd.toISOString());

    const volumes: MuscleGroupVolume = {
      chest: 0,
      back: 0,
      legs: 0,
      shoulders: 0,
      arms: 0,
      core: 0,
    };

    if (!exercises) return volumes;

    // Map exercises to muscle groups and calculate volume
    exercises.forEach((exercise: any) => {
      const name = exercise.name.toLowerCase();
      const sets = exercise.strength_sets_logged || [];

      // Calculate total volume (weight * reps) for this exercise
      const totalVolume = sets.reduce((sum: number, set: any) => {
        return sum + (set.weight * set.reps);
      }, 0);

      // Categorize by muscle group
      if (name.includes('bench') || name.includes('chest') || name.includes('press') && name.includes('chest')) {
        volumes.chest += totalVolume;
      } else if (name.includes('squat') || name.includes('deadlift') || name.includes('leg') || name.includes('lunge')) {
        volumes.legs += totalVolume;
      } else if (name.includes('row') || name.includes('pull') || name.includes('back') || name.includes('lat')) {
        volumes.back += totalVolume;
      } else if (name.includes('shoulder') || name.includes('press') && !name.includes('bench') || name.includes('ohp')) {
        volumes.shoulders += totalVolume;
      } else if (name.includes('curl') || name.includes('tricep') || name.includes('bicep') || name.includes('arm')) {
        volumes.arms += totalVolume;
      } else if (name.includes('core') || name.includes('plank') || name.includes('ab')) {
        volumes.core += totalVolume;
      }
    });

    return volumes;
  } catch (error) {
    console.error('[Training Plan] Error calculating muscle group volumes:', error);
    return {
      chest: 0,
      back: 0,
      legs: 0,
      shoulders: 0,
      arms: 0,
      core: 0,
    };
  }
}

export async function checkVolumeWarnings(userId: string, currentWeek: number) {
  try {
    console.log('[Training Plan] Checking volume warnings for week:', currentWeek);

    const warnings = [];

    // Get current week and previous week volumes
    const currentVolumes = await calculateMuscleGroupVolumes(userId, currentWeek);
    const previousVolumes = await calculateMuscleGroupVolumes(userId, currentWeek - 1);

    // Check each muscle group for >10% increase
    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core'] as const;

    for (const group of muscleGroups) {
      const current = currentVolumes[group];
      const previous = previousVolumes[group];

      if (previous > 0 && current > 0) {
        const increase = ((current - previous) / previous) * 100;

        if (increase > 10) {
          warnings.push({
            type: 'volume_increase' as const,
            muscleGroup: group,
            increase: Math.round(increase),
            message: `${group.charAt(0).toUpperCase() + group.slice(1)} volume increased by ${Math.round(increase)}% (recommended <10%)`,
          });
        }
      }
    }

    // Check total weekly running volume increase
    const supabase = await getServerSupabase();
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1);

    const thisWeekStart = new Date(currentWeekStart);
    thisWeekStart.setDate(currentWeekStart.getDate() + (currentWeek - 1) * 7);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

    const { data: thisWeekRuns } = await supabase
      .from('run_logged')
      .select('distance_km')
      .eq('user_id', userId)
      .gte('activity_date', thisWeekStart.toISOString())
      .lte('activity_date', thisWeekEnd.toISOString());

    const { data: lastWeekRuns } = await supabase
      .from('run_logged')
      .select('distance_km')
      .eq('user_id', userId)
      .gte('activity_date', lastWeekStart.toISOString())
      .lte('activity_date', lastWeekEnd.toISOString());

    const thisWeekDistance = thisWeekRuns?.reduce((sum, r) => sum + (r.distance_km || 0), 0) || 0;
    const lastWeekDistance = lastWeekRuns?.reduce((sum, r) => sum + (r.distance_km || 0), 0) || 0;

    if (lastWeekDistance > 0 && thisWeekDistance > 0) {
      const runningIncrease = ((thisWeekDistance - lastWeekDistance) / lastWeekDistance) * 100;

      if (runningIncrease > 10) {
        warnings.push({
          type: 'running_volume_increase' as const,
          increase: Math.round(runningIncrease),
          message: `Running volume increased by ${Math.round(runningIncrease)}% (recommended <10% per week)`,
        });
      }
    }

    console.log('[Training Plan] Found', warnings.length, 'volume warnings');
    return warnings;
  } catch (error) {
    console.error('[Training Plan] Error checking volume warnings:', error);
    return [];
  }
}

export async function assessInjuryRisk(userId: string) {
  try {
    console.log('[Injury Risk] Assessing injury risk for user:', userId);
    const supabase = await getServerSupabase();

    let riskScore = 0; // 0-100, higher = more risk
    const riskFactors = [];

    // Get last 14 days of activity
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: recentRuns } = await supabase
      .from('run_logged')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', fourteenDaysAgo.toISOString())
      .order('activity_date', { ascending: true });

    const { data: recentStrength } = await supabase
      .from('strength_exercises')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', fourteenDaysAgo.toISOString())
      .order('activity_date', { ascending: true });

    // Risk Factor 1: Rapid weekly distance increase
    const currentWeekVolume = await checkVolumeWarnings(userId, 1);
    if (currentWeekVolume.some(w => w.increase > 15)) {
      riskScore += 25;
      riskFactors.push('Rapid training volume increase detected');
    } else if (currentWeekVolume.some(w => w.increase > 10)) {
      riskScore += 15;
      riskFactors.push('Moderate volume increase - monitor closely');
    }

    // Risk Factor 2: High-intensity workouts too close together
    if (recentRuns && recentRuns.length > 1) {
      for (let i = 1; i < recentRuns.length; i++) {
        const current = recentRuns[i];
        const previous = recentRuns[i - 1];

        const daysBetween = (new Date(current.activity_date).getTime() - new Date(previous.activity_date).getTime()) / (1000 * 60 * 60 * 24);

        // Check if tempo/hard run (pace < 5:00/km or high avg HR) followed quickly by strength
        const isHardRun = previous.duration_minutes / previous.distance_km < 5 || (previous.avg_hr && previous.avg_hr > 165);

        if (isHardRun && daysBetween < 2) {
          const strengthSameDay = recentStrength?.find(s =>
            new Date(s.activity_date).toDateString() === new Date(current.activity_date).toDateString()
          );

          if (strengthSameDay) {
            riskScore += 20;
            riskFactors.push('High-load strength training after intense run');
          }
        }
      }
    }

    // Risk Factor 3: Insufficient recovery days
    if (recentRuns && recentRuns.length >= 7) {
      const last7Days = recentRuns.slice(-7);
      const restDays = 7 - last7Days.length;

      if (restDays < 2) {
        riskScore += 15;
        riskFactors.push('Insufficient rest days (need 2+ per week)');
      }
    }

    // Risk Factor 4: High RPE/RIR trends in strength training
    if (recentStrength && recentStrength.length > 3) {
      const exercisesWithHighEffort = recentStrength.filter(e =>
        e.name.toLowerCase().includes('rpe 8') ||
        e.name.toLowerCase().includes('rpe 9') ||
        e.name.toLowerCase().includes('rpe 10')
      );

      if (exercisesWithHighEffort.length > recentStrength.length * 0.6) {
        riskScore += 10;
        riskFactors.push('Consistently training at very high effort levels');
      }
    }

    // Risk Factor 5: Pace variability (could indicate fatigue)
    if (recentRuns && recentRuns.length >= 5) {
      const paces = recentRuns
        .filter(r => r.distance_km > 0 && r.duration_minutes > 0)
        .map(r => r.duration_minutes / r.distance_km);

      if (paces.length >= 5) {
        const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
        const variance = paces.reduce((sum, pace) => sum + Math.pow(pace - avgPace, 2), 0) / paces.length;
        const stdDev = Math.sqrt(variance);

        // High variability in pace (>15% coefficient of variation)
        const coefficientOfVariation = (stdDev / avgPace) * 100;
        if (coefficientOfVariation > 15) {
          riskScore += 10;
          riskFactors.push('High pace variability - may indicate fatigue');
        }
      }
    }

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high';
    if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 25) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }

    console.log('[Injury Risk] Risk assessment complete:', { riskLevel, riskScore, factorCount: riskFactors.length });

    return {
      riskScore: Math.min(100, riskScore),
      riskLevel,
      riskFactors,
    };
  } catch (error) {
    console.error('[Injury Risk] Error assessing injury risk:', error);
    return {
      riskScore: 0,
      riskLevel: 'low' as const,
      riskFactors: [],
    };
  }
}
