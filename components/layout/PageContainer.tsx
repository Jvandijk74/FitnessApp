import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main content */}
      <main className="lg:pl-64 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}
