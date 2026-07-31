'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.full_name || user?.username}</div>
            <p className="text-xs text-slate-500 mt-1">Role: {user?.role}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
