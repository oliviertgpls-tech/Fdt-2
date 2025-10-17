"use client";

import { Suspense } from 'react';
import { Loader } from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}