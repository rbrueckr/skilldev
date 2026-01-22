'use client';

import SessionNavBar from './sidebar';

export default function SidebarDemo() {
  return (
    <div className='flex h-screen w-screen flex-row'>
      <SessionNavBar />
      <main className='flex h-screen grow flex-col overflow-auto'>
        <div className='p-4'>
          <h1 className='text-2xl font-bold'>Main Content Area</h1>
          <p className='mt-2'>This is where your main content would go.</p>
        </div>
      </main>
    </div>
  );
}
