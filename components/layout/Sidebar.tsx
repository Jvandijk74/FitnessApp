'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Training Plan', href: '/plan', icon: '📅' },
  { name: 'Create Training', href: '/create-training', icon: '✏️' },
  { name: 'AI Coach', href: '/coach', icon: '🤖' },
  { name: 'Nutrition', href: '/nutrition', icon: '🥗' },
  { name: 'Activity Log', href: '/log', icon: '📝' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

interface LactateThresholds {
  lt1HR: number;
  lt2HR: number;
  lt1Pace: number;
  lt2Pace: number;
  explanation: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [thresholds, setThresholds] = useState<LactateThresholds | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  useEffect(() => {
    // Fetch lactate thresholds
    const fetchThresholds = async () => {
      try {
        const response = await fetch('/api/metrics/thresholds');
        if (response.ok) {
          const data = await response.json();
          setThresholds(data);
        }
      } catch (error) {
        console.error('Failed to fetch thresholds:', error);
      }
    };

    fetchThresholds();
  }, []);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface border-r border-surface-elevated">
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-surface-elevated">
        <span className="text-2xl">🏃</span>
        <h1 className="text-lg font-bold text-text-primary">Fitness Coach</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-surface-elevated">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 font-semibold">
            DU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Demo User</p>
            <p className="text-xs text-text-tertiary truncate">demo@fitness.app</p>
          </div>
        </div>

        {/* Athlete Stats */}
        <div className="mt-3 pt-3 border-t border-surface space-y-2 relative">
          <div
            className="flex justify-between text-xs cursor-help hover:bg-surface-elevated/50 -mx-2 px-2 py-1 rounded transition-colors"
            onMouseEnter={() => setHoveredMetric('lt1')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <span className="text-text-tertiary">LT1 (Aerobic)</span>
            <span className="text-text-secondary font-medium">
              {thresholds ? `${thresholds.lt1HR} bpm` : '... bpm'}
            </span>
          </div>
          <div
            className="flex justify-between text-xs cursor-help hover:bg-surface-elevated/50 -mx-2 px-2 py-1 rounded transition-colors"
            onMouseEnter={() => setHoveredMetric('lt2')}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <span className="text-text-tertiary">LT2 (Threshold)</span>
            <span className="text-text-secondary font-medium">
              {thresholds ? `${thresholds.lt2HR} bpm` : '... bpm'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-tertiary">Readiness</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i <= 3 ? 'bg-primary-500' : 'bg-surface-elevated'
                    }`}
                  />
                ))}
              </div>
              <span className="text-text-secondary font-medium ml-1">62%</span>
            </div>
          </div>

          {/* Hover Tooltip */}
          {hoveredMetric && thresholds && (
            <div className="absolute z-50 w-64 p-3 bg-surface-elevated border-2 border-primary-500/30 rounded-lg shadow-2xl left-full ml-2 top-0">
              <h4 className="font-semibold text-text-primary text-xs mb-2">
                {hoveredMetric === 'lt1' ? 'LT1 - Aerobic Threshold' : 'LT2 - Lactate Threshold'}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-2">
                {hoveredMetric === 'lt1'
                  ? `${thresholds.lt1HR} bpm | ${Math.floor(thresholds.lt1Pace)}:${String(Math.round((thresholds.lt1Pace % 1) * 60)).padStart(2, '0')}/km - Your aerobic threshold where you can maintain conversation. Train below this for base building.`
                  : `${thresholds.lt2HR} bpm | ${Math.floor(thresholds.lt2Pace)}:${String(Math.round((thresholds.lt2Pace % 1) * 60)).padStart(2, '0')}/km - Your lactate threshold pace. Tempo runs target this "comfortably hard" effort.`}
              </p>
              <p className="text-xs text-text-tertiary border-t border-surface pt-2 mt-2">
                💡 Based on your training data
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
