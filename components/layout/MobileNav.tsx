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
  { name: 'Plan', href: '/plan', icon: '📅' },
  { name: 'Log', href: '/log', icon: '📝' },
  { name: 'More', href: '/settings', icon: '⚙️' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-elevated z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-all duration-150
                ${
                  isActive
                    ? 'text-primary-400'
                    : 'text-text-tertiary active:text-text-primary'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
