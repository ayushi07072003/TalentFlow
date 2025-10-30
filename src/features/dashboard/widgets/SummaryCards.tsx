import { useQuery } from '@tanstack/react-query';
import { Job } from '@/lib/db';
import { Candidate } from '@/lib/db';
import { Assessment } from '@/lib/db';

export function SummaryCards() {
  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs');
      const json = await res.json();
      return json.jobs as Job[];
    },
  });
  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await fetch('/api/candidates');
      const json = await res.json();
      return json.candidates as Candidate[];
    },
  });
  const { data: assessments } = useQuery<Assessment[]>({
    queryKey: ['assessments'],
    queryFn: async () => {
      const res = await fetch('/api/assessments');
      const json = await res.json();
      return json.assessments as Assessment[];
    },
  });

  // Simulate apply rate: percent of candidates in 'applied' stage
  const applyRate = candidates && candidates.length
    ? Math.round((candidates.filter(c => c.stage === 'applied').length / candidates.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="card bg-blue-50 rounded-lg shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-blue-600">{jobs ? jobs.length : '-'}</div>
        <div className="text-xs text-gray-700 mt-1">Jobs</div>
      </div>
      <div className="card bg-green-50 rounded-lg shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-green-600">{candidates ? candidates.length : '-'}</div>
        <div className="text-xs text-gray-700 mt-1">Candidates</div>
      </div>
      <div className="card bg-yellow-50 rounded-lg shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-yellow-600">{assessments ? assessments.length : '-'}</div>
        <div className="text-xs text-gray-700 mt-1">Assessments</div>
      </div>
      <div className="card bg-purple-50 rounded-lg shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold text-purple-600">{applyRate}%</div>
        <div className="text-xs text-gray-700 mt-1">Apply Rate</div>
      </div>
    </div>
  );
}
