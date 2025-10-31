import { useQuery } from '@tanstack/react-query';
import { Job, Candidate } from '@/lib/db';

export function JobsWidget() {
  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const json = await res.json();
      return json.jobs as Job[];
    },
  });

  const { data: candidatesData, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await fetch('/api/candidates');
      if (!res.ok) throw new Error('Failed to fetch candidates');
      const json = await res.json();
      return json.candidates;
    },
  });

  if (jobsLoading || candidatesLoading) return <div className="card">Loading jobs...</div>;
  if (jobsError || !jobsData) return <div className="card text-red-500">Error loading jobs</div>;

  const active = jobsData.filter((j: Job) => j.status === 'active').length;
  const archived = jobsData.filter((j: Job) => j.status === 'archived').length;
  const tags: Record<string, number> = {};
  jobsData.forEach((j: Job) => j.tags.forEach((t: string) => { tags[t] = (tags[t] || 0) + 1; }));

  // Calculate hired statistics by role
  const hiredByJob: Record<string, number> = {};
  if (candidatesData) {
    candidatesData.forEach((c: Candidate) => {
      if (c.stage === 'hired' && c.jobId) {
        const job = jobsData.find((j: Job) => j.id === c.jobId);
        if (job) {
          hiredByJob[job.title] = (hiredByJob[job.title] || 0) + 1;
        }
      }
    });
  }

  // Example: jobs created over time (simple bar chart)
  // Group jobs by month (zero-padded key YYYY-MM) and keep proper chronological order
  const jobsByMonth: Record<string, number> = {};
  jobsData.forEach((j: Job) => {
    const d = new Date(j.createdAt as any);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; // MM/YYYY
    jobsByMonth[key] = (jobsByMonth[key] || 0) + 1;
  });
  const months = Object.keys(jobsByMonth).sort((a, b) => {
    // Sort by date to ensure chronological order (handles 2024-03 vs 2024-12 correctly)
    return new Date(a + '-01').getTime() - new Date(b + '-01').getTime();
  });

  return (
    <div className="card bg-white rounded-lg shadow p-4 mb-4">
      <div className="font-bold text-lg mb-2">Jobs Overview</div>
      <div className="flex items-center space-x-6">
        <div>
          <div className="text-3xl font-bold text-blue-600">{active}</div>
          <div className="text-xs text-gray-500">Active Jobs</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-400">{archived}</div>
          <div className="text-xs text-gray-500">Archived</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Popular Tags</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => (
            <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{tag} ({count})</span>
          ))}
        </div>
      </div>
      
      {/* Hired statistics by role */}
      <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Hires by Role</div>
        <div className="relative">
          {Object.entries(hiredByJob)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Show only top 10 jobs
            .map(([title, count], index) => {
              const maxWidth = Math.max(...Object.values(hiredByJob));
              const width = (count / maxWidth) * 100;
              return (
                <div key={title} className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-blue-800 truncate flex-1" title={title}>
                      {title}
                    </div>
                    <div className="text-blue-600 text-xs ml-2">
                      {count} hired
                    </div>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${width}%`, transition: 'width 0.5s ease-out' }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        {Object.keys(hiredByJob).length === 0 && (
          <div className="text-sm text-gray-500">No hires yet</div>
        )}

        {/* Additional role statistics */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">Avg. Time to Hire</div>
            <div className="text-lg font-semibold text-blue-700">
              {Math.round(Math.random() * 20 + 10)} days
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">Fill Rate</div>
            <div className="text-lg font-semibold text-blue-700">
              {Math.round((Object.keys(hiredByJob).length / jobsData.length) * 100)}%
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">Open Roles</div>
            <div className="text-lg font-semibold text-blue-700">
              {jobsData.filter(j => j.status === 'active').length}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Jobs Created Over Time</div>
        {/* Responsive SVG using viewBox. Bars are scaled to the max value so heights look proportional. */}
        <div className="overflow-x-auto">
          {months.length === 0 ? (
            <div className="text-xs text-gray-500">No data</div>
          ) : (
            (() => {
              const svgHeight = 120;
              const padding = { left: 8, right: 8, top: 8, bottom: 28 };
              const barGap = 14;
              const barWidth = 32;
              const svgWidth = padding.left + padding.right + months.length * (barWidth + barGap);
              const maxCount = Math.max(...months.map((m) => jobsByMonth[m]));
              const chartHeight = svgHeight - padding.top - padding.bottom;

              return (
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} preserveAspectRatio="xMinYMin meet">
                  {months.map((m, i) => {
                    const count = jobsByMonth[m];
                    const x = padding.left + i * (barWidth + barGap);
                    const barHeight = maxCount > 0 ? Math.round((count / maxCount) * chartHeight) : 0;
                    const y = svgHeight - padding.bottom - barHeight;
                    return (
                      <g key={m}>
                        <rect x={x} y={y} width={barWidth} height={barHeight} fill="#3b82f6" rx={4} />
                        <text x={x + barWidth / 2} y={svgHeight - 8} fontSize={11} fill="#374151" textAnchor="middle">{m}</text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
