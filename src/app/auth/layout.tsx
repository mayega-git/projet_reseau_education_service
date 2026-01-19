// app/protected/layout.tsx
import PublicRoute from '@/components/Routes/PublicRoute';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicRoute>{children}</PublicRoute>;
}
