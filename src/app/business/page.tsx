"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import HomeAudienceSwitcher from '@/components/HomeAudienceSwitcher';
import BusinessView from '@/components/BusinessView';

export default function BusinessPage() {
  const router = useRouter();

  const handleModeChange = (mode: 'earn' | 'grow') => {
    if (mode === 'earn') {
      router.push('/');
    }
  };

  return (
    <div className="business-page-wrapper">
      <HomeAudienceSwitcher activeMode="grow" onModeChange={handleModeChange} />
      <BusinessView onSwitchToEarn={() => router.push('/')} />
    </div>
  );
}
