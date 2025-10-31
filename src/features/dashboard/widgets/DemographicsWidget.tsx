import { useQuery } from '@tanstack/react-query';
import { Candidate } from '@/lib/db';

export function DemographicsWidget() {
  const { data, isLoading, error } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await fetch('/api/candidates');
      if (!res.ok) throw new Error('Failed to fetch candidates');
      const json = await res.json();
      return json.candidates as Candidate[];
    },
  });

  if (isLoading) return <div className="card">Loading demographics...</div>;
  if (error || !data) return <div className="card text-red-500">Error loading demographics</div>;

  // Group by location
  const byLocation: Record<string, { total: number; hires: number }> = {};
  
  // Process locations and hires in a single pass
  data.forEach((c: Candidate) => {
    const loc = c.location || 'Unknown';
    if (!byLocation[loc]) {
      byLocation[loc] = { total: 0, hires: 0 };
    }
    byLocation[loc].total++;
    if (c.stage === 'hired') {
      byLocation[loc].hires++;
    }
  });

  return (
    <div className="card bg-white rounded-lg shadow p-4 mb-4">
      <div className="font-bold text-lg mb-2">Demographics & Performance</div>
      <div className="font-medium text-gray-700 mb-1">Candidates by Location</div>
      <div className="space-y-2 mt-4">
        {Object.entries(byLocation).map(([loc, stats]) => (
          <div key={loc} className="flex justify-between items-center">
            <span>{loc}</span>
            <span className="text-sm text-gray-600">
              {stats.total} candidates ({stats.hires} hired)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}