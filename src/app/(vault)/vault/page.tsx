import React from 'react';
import BentoGrid from '@/components/vault/home/BentoGrid';

export default function VaultHomePage() {
  return (
    <div className="w-full mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to your Vault</h2>
        <p className="text-gray-500 mt-2 text-lg">Your health organized in one safe place.</p>
      </div>
      <BentoGrid />
    </div>
  );
}
