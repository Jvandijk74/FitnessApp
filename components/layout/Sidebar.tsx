'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  { name: 'Activity Log', href: '/log', icon: '📝' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

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
        <div className="mt-3 pt-3 border-t border-surface space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-text-tertiary">Threshold Pace</span>
            <span className="text-text-secondary font-medium">4:54 /km</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-text-tertiary">Threshold HR</span>
            <span className="text-text-secondary font-medium">170 bpm</span>
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
        </div>
      </div>
    </aside>
  );
}
