import React from 'react';
import { useQuery } from '@tanstack/react-query';

export function ActivityTimeline() {
  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await fetch('/api/activity');
      if (!res.ok) throw new Error('Failed to fetch activity');
      const json = await res.json();
      return json.activity as any[];
    },
  });

  if (isLoading) return <div className="card">Loading activity...</div>;
  if (error || !data) return <div className="card text-red-500">Error loading activity</div>;

  return (
    <div className="card bg-white rounded-lg shadow p-4 mb-4">
      <div className="font-bold text-lg mb-2">Recent Activity</div>
      <ul className="text-xs text-gray-600">
        {data.slice(0, 10).map((item: any) => (
          <li key={item.id} className="mb-2">
            <span className="font-medium text-gray-800">{item.type}</span>: {item.description} <span className="text-gray-400">({new Date(item.timestamp).toLocaleString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
