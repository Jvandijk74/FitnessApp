'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActivityChartsProps {
  streams: any;
  detail: any;
}

export function ActivityCharts({ streams, detail }: ActivityChartsProps) {
  // Process streams data for charts
  const chartData = React.useMemo(() => {
    if (!streams) return [];

    const timeData = streams.time?.data || [];
    const distanceData = streams.distance?.data || [];
    const hrData = streams.heartrate?.data || [];
    const velocityData = streams.velocity_smooth?.data || [];

    return timeData.map((time: number, index: number) => ({
      time: Math.floor(time / 60), // Convert to minutes
      distance: distanceData[index] ? (distanceData[index] / 1000).toFixed(2) : 0, // Convert to km
      heartrate: hrData[index] || null,
      // Convert velocity (m/s) to pace (min/km)
      pace: velocityData[index] ? (1000 / (velocityData[index] * 60)).toFixed(2) : null,
    }));
  }, [streams]);

  if (!streams || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-surface-elevated rounded-lg">
        <p className="text-text-secondary">No chart data available for this activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Heart Rate Chart */}
      {streams.heartrate && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Heart Rate Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                stroke="#888"
                label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#888"
                label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="heartrate"
                stroke="#F44336"
                strokeWidth={2}
                dot={false}
                name="Heart Rate (bpm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pace Chart */}
      {streams.velocity_smooth && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Pace Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                stroke="#888"
                label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#888"
                label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }}
                reversed
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="pace"
                stroke="#FF6B35"
                strokeWidth={2}
                dot={false}
                name="Pace (min/km)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Elevation Chart (if available) */}
      {streams.altitude && (
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Elevation Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData.map((d: any, i: number) => ({
                ...d,
                altitude: streams.altitude.data[i],
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="distance"
                stroke="#888"
                label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#888"
                label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="altitude"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={false}
                name="Elevation (m)"
                fill="url(#colorAltitude)"
              />
              <defs>
                <linearGradient id="colorAltitude" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
