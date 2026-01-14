'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavTile {
  name: string;
  href: string;
  icon: string;
  description: string;
  color: string;
}

const navTiles: NavTile[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    description: 'Overview & insights',
    color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
  },
  {
    name: 'Training Plan',
    href: '/plan',
    icon: '📅',
    description: 'Weekly schedule',
    color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
  },
  {
    name: 'Create Training',
    href: '/create-training',
    icon: '✏️',
    description: 'Build workouts',
    color: 'from-green-500/20 to-green-600/20 border-green-500/30'
  },
  {
    name: 'AI Coach',
    href: '/coach',
    icon: '🤖',
    description: 'Personal guidance',
    color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30'
  },
  {
    name: 'Nutrition',
    href: '/nutrition',
    icon: '🥗',
    description: 'Track your meals',
    color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30'
  },
  {
    name: 'Activity Log',
    href: '/log',
    icon: '📝',
    description: 'Record workouts',
    color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: '📈',
    description: 'Performance stats',
    color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: '⚙️',
    description: 'App preferences',
    color: 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
  },
];

interface LactateThresholds {
  lt1HR: number;
  lt2HR: number;
  lt1Pace: number;
  lt2Pace: number;
}

export default function HomePage() {
  const router = useRouter();
  const [thresholds, setThresholds] = useState<LactateThresholds | null>(null);

  // Redirect to dashboard on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        router.replace('/dashboard');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [router]);

  // Fetch lactate thresholds
  useEffect(() => {
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
    <div className="lg:hidden min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏃</span>
          <h1 className="text-2xl font-bold">Fitness Coach</h1>
        </div>
        <p className="text-primary-100 text-sm mt-1">Choose where you want to go</p>
      </div>

      {/* Navigation Tiles */}
      <div className="px-4 py-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {navTiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group"
            >
              <div className={`
                relative overflow-hidden
                bg-gradient-to-br ${tile.color}
                border rounded-2xl p-6
                transition-all duration-200
                active:scale-95
                hover:shadow-lg
              `}>
                {/* Icon */}
                <div className="text-5xl mb-3">
                  {tile.icon}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  {tile.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-text-tertiary">
                  {tile.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>

        {/* User Info Card */}
        <div className="mt-8 bg-surface border border-surface-elevated rounded-2xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 text-primary-400 font-bold text-xl">
              DU
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-text-primary">Demo User</p>
              <p className="text-sm text-text-tertiary">demo@fitness.app</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-elevated">
            <div className="text-center">
              <p className="text-xs text-text-tertiary mb-1">LT1</p>
              <p className="text-sm font-semibold text-text-primary">
                {thresholds ? `${thresholds.lt1HR} bpm` : '...'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary mb-1">LT2</p>
              <p className="text-sm font-semibold text-text-primary">
                {thresholds ? `${thresholds.lt2HR} bpm` : '...'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-text-tertiary mb-1">Readiness</p>
              <p className="text-sm font-semibold text-text-primary">62%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
