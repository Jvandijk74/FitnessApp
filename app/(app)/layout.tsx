import { PageContainer } from '@/components/layout/PageContainer';
import { StravaAutoSync } from '@/components/strava/StravaAutoSync';

const DEMO_USER = 'demo-user';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      {/* Auto-sync Strava activities when app opens */}
      <StravaAutoSync userId={DEMO_USER} />
      {children}
    </PageContainer>
  );
}
