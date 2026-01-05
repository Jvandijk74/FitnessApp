import { PageContainer } from '@/components/layout/PageContainer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <PageContainer>{children}</PageContainer>;
}
