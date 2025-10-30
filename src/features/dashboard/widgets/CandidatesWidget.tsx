import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Candidate } from '@/lib/db';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
// Darker shades of green for better visibility
const COLORS = ['#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'];

export function CandidatesWidget() {
  const { data, isLoading, error } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await fetch('/api/candidates');
      if (!res.ok) throw new Error('Failed to fetch candidates');
      const json = await res.json();
      return json.candidates as Candidate[];
    },
  });

  if (isLoading) return <div className="card">Loading candidates...</div>;
  if (error || !data) return <div className="card text-red-500">Error loading candidates</div>;

  const total = data.length;
  const stageCounts: Record<string, number> = {};
  STAGES.forEach((s) => { stageCounts[s] = 0; });
  data.forEach((c) => { stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1; });

  // Pie chart data
  const pieData = STAGES.map((s, i) => ({ name: s, value: stageCounts[s], fill: COLORS[i] }));

  // Simulate time series for state movement (group by day, count per stage)
  const formatDate = (dateStr: string | Date) => {
    if (typeof dateStr === 'string') {
      return dateStr.split('T')[0];
    }
    return dateStr.toISOString().split('T')[0];
  };
  const days = Array.from(new Set(data.map(c => c.createdAt ? formatDate(c.createdAt) : ''))).sort();
  const lineData = days.map(day => {
    const dayCandidates = data.filter(c => c.createdAt && formatDate(c.createdAt) === day);
    const obj: any = { day };
    STAGES.forEach(s => { obj[s] = dayCandidates.filter(c => c.stage === s).length; });
    return obj;
  });

  // Conversion rates
  const conversion = STAGES.map((s, i) => i === 0 ? 100 : Math.round((stageCounts[s] / total) * 100));

  return (
    <div className="card bg-white rounded-lg shadow p-4 mb-4">
      <div className="font-bold text-lg mb-2">Candidates Overview</div>
      <div className="text-3xl font-bold text-green-600">{total}</div>
      <div className="text-xs text-gray-500 mb-2">Total Candidates</div>
      {/* Pie chart for status distribution */}
      <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Status Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {pieData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Line chart for state movement over time */}
      <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">State Movement Over Time</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'solid #dce254',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              labelStyle={{ color: '#374151', fontWeight: 600 }}
              itemStyle={{ color: '#4b5563' }}
            />
            <Legend />
            {STAGES.map((s, i) => (
              <Line key={s} type="monotone" dataKey={s} stroke={COLORS[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Conversion rates */}
      {/* <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Stage Conversion Rates</div>
        <div className="flex gap-2">
          {conversion.map((c, i) => (
            <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">{STAGES[i]}: {c}%</span>
          ))}
        </div>
      </div> */}
    </div>
  );
}
