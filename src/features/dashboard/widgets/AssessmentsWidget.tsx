import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Assessment } from '@/lib/db';

export function AssessmentsWidget() {
  const { data, isLoading, error } = useQuery<Assessment[]>({
    queryKey: ['assessments'],
    queryFn: async () => {
      const res = await fetch('/api/assessments');
      if (!res.ok) throw new Error('Failed to fetch assessments');
      const json = await res.json();
      return json.assessments as Assessment[];
    },
  });

  if (isLoading) return <div className="card">Loading assessments...</div>;
  if (error || !data) return <div className="card text-red-500">Error loading assessments</div>;

  const total = data.length;
  const completed = data.filter((a) => (a as any).completionRate >= 100).length;
  const totalRegistered = data.reduce((sum, a: any) => sum + (a.registeredCount ?? a.totalRegistered ?? 0), 0);
  const totalAttempted = data.reduce((sum, a: any) => sum + (a.attemptedCount ?? a.totalAttempted ?? 0), 0);
  const recent = [...data].sort((a, b) => new Date((b as any).updatedAt).getTime() - new Date((a as any).updatedAt).getTime()).slice(0, 5);

  return (
    <div className="card bg-white rounded-lg shadow p-4 mb-4">
      <div className="font-bold text-lg mb-2">Assessments Overview</div>
      <div className="text-3xl font-bold text-purple-600">{total}</div>
      <div className="text-xs text-gray-500 mb-2">Total Assessments</div>
      <div className="mt-2 flex gap-4 items-center">
        <div>
          <div className="text-sm font-medium text-gray-600">Total Registered</div>
          <div className="text-xl font-bold text-orange-600">{totalRegistered}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-600">Total Attempted</div>
          <div className="text-xl font-bold text-orange-600">{totalAttempted}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Completion Rate</div>
        <div className="text-lg font-bold text-green-600">{Math.round((completed/total)*100)}%</div>
      </div>
      <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Recently Updated</div>
        <ul className="text-xs text-gray-600">
          {recent.map((a: any) => (
            <li key={a.id} className="mb-1 flex items-center justify-between">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-gray-500">{new Date(a.updatedAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold">
                  Registered: {a.registeredCount ?? a.totalRegistered ?? 0}
                </div>
                <div className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold">
                  Attempted: {a.attemptedCount ?? a.totalAttempted ?? 0}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
