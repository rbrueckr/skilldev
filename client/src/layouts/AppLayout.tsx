'use client';

import SessionNavBar from '../components/ui/sidebar';
import { cn } from '../lib/utils';

export default function AppLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className='flex h-screen w-screen overflow-hidden bg-background'>
      <SessionNavBar />
      <main className={cn('flex-1 overflow-auto', className)}>{children}</main>
    </div>
  );
}
