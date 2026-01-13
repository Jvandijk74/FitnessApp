export interface RunData {
  distance: number; // meters
  duration: number; // seconds
  averageHR?: number;
  maxHR?: number;
  averageSpeed?: number; // m/s
  totalElevationGain?: number;
  splits?: Array<{
    distance: number;
    elapsed_time: number;
    average_heartrate?: number;
  }>;
}

export interface AdvancedRunMetrics {
  hrDrift: number | null; // Percentage drift from first half to second half
  hrDriftCategory: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'N/A';
  trimp: number | null; // Training Impulse
  trimpCategory: 'Low' | 'Moderate' | 'High' | 'Very High' | 'N/A';
  aerobicDecoupling: number | null; // Efficiency drift
  averageCadence: number | null;
  variabilityIndex: number | null; // Pace consistency
  estimatedVO2max: number | null;
}

export function calculateAdvancedMetrics(runData: RunData, userMaxHR: number = 190): AdvancedRunMetrics {
  const metrics: AdvancedRunMetrics = {
    hrDrift: null,
    hrDriftCategory: 'N/A',
    trimp: null,
    trimpCategory: 'N/A',
    aerobicDecoupling: null,
    averageCadence: null,
    variabilityIndex: null,
    estimatedVO2max: null
  };

  // Calculate HR Drift (First half vs Second half)
  if (runData.splits && runData.splits.length >= 4) {
    const halfwayPoint = Math.floor(runData.splits.length / 2);
    const firstHalfSplits = runData.splits.slice(0, halfwayPoint);
    const secondHalfSplits = runData.splits.slice(halfwayPoint);

    const firstHalfAvgHR = firstHalfSplits
      .filter(s => s.average_heartrate)
      .reduce((sum, s) => sum + (s.average_heartrate || 0), 0) / firstHalfSplits.filter(s => s.average_heartrate).length;

    const secondHalfAvgHR = secondHalfSplits
      .filter(s => s.average_heartrate)
      .reduce((sum, s) => sum + (s.average_heartrate || 0), 0) / secondHalfSplits.filter(s => s.average_heartrate).length;

    if (firstHalfAvgHR && secondHalfAvgHR) {
      metrics.hrDrift = ((secondHalfAvgHR - firstHalfAvgHR) / firstHalfAvgHR) * 100;

      // Categorize HR Drift
      if (metrics.hrDrift < 3) metrics.hrDriftCategory = 'Excellent';
      else if (metrics.hrDrift < 5) metrics.hrDriftCategory = 'Good';
      else if (metrics.hrDrift < 8) metrics.hrDriftCategory = 'Moderate';
      else metrics.hrDriftCategory = 'Poor';
    }
  }

  // Calculate TRIMP (Training Impulse)
  if (runData.averageHR && runData.duration) {
    const durationMin = runData.duration / 60;
    const hrReserve = ((runData.averageHR - 60) / (userMaxHR - 60)); // Assuming RHR of 60
    metrics.trimp = durationMin * hrReserve * 0.64 * Math.exp(1.92 * hrReserve);

    // Categorize TRIMP
    if (metrics.trimp < 50) metrics.trimpCategory = 'Low';
    else if (metrics.trimp < 100) metrics.trimpCategory = 'Moderate';
    else if (metrics.trimp < 150) metrics.trimpCategory = 'High';
    else metrics.trimpCategory = 'Very High';
  }

  // Calculate Aerobic Decoupling (Pace:HR efficiency drift)
  if (runData.splits && runData.splits.length >= 4) {
    const halfwayPoint = Math.floor(runData.splits.length / 2);
    const firstHalfSplits = runData.splits.slice(0, halfwayPoint);
    const secondHalfSplits = runData.splits.slice(halfwayPoint);

    const calcEfficiency = (splits: typeof runData.splits) => {
      const validSplits = splits!.filter(s => s.average_heartrate && s.elapsed_time > 0);
      if (validSplits.length === 0) return 0;

      const avgPace = validSplits.reduce((sum, s) => sum + (s.elapsed_time / (s.distance / 1000)), 0) / validSplits.length;
      const avgHR = validSplits.reduce((sum, s) => sum + (s.average_heartrate || 0), 0) / validSplits.length;

      return avgPace / avgHR; // Lower is more efficient
    };

    const firstHalfEfficiency = calcEfficiency(firstHalfSplits);
    const secondHalfEfficiency = calcEfficiency(secondHalfSplits);

    if (firstHalfEfficiency > 0 && secondHalfEfficiency > 0) {
      metrics.aerobicDecoupling = ((secondHalfEfficiency - firstHalfEfficiency) / firstHalfEfficiency) * 100;
    }
  }

  // Calculate Pace Variability Index
  if (runData.splits && runData.splits.length >= 3) {
    const paces = runData.splits.map(s => s.elapsed_time / (s.distance / 1000));
    const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
    const variance = paces.reduce((sum, pace) => sum + Math.pow(pace - avgPace, 2), 0) / paces.length;
    const stdDev = Math.sqrt(variance);
    metrics.variabilityIndex = (stdDev / avgPace) * 100; // Coefficient of variation
  }

  // Estimate VO2max (Simple Cooper formula using pace)
  if (runData.averageSpeed && runData.distance >= 3000) {
    const speedKmH = runData.averageSpeed * 3.6;
    metrics.estimatedVO2max = (speedKmH * 3) + 10; // Simplified estimation
  }

  return metrics;
}
