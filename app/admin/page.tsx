"use client";

import dynamic from 'next/dynamic';
import { Loader } from 'lucide-react';

// Import dynamique sans SSR
const AdminDashboard = dynamic(
  () => import('./AdminDashboard').then(mod => ({ default: mod.AdminDashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }
);

export default function AdminPage() {
  return <AdminDashboard />;
}