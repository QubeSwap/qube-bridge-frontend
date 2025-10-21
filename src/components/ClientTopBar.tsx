'use client';

import dynamic from 'next/dynamic';

// Dynamically import TopBar with ssr: false inside the client component
const TopBarDynamic = dynamic(() => import('@/components/layout/TopBar'), { ssr: false });

export function ClientTopBar() {
  return <TopBarDynamic />;
}
