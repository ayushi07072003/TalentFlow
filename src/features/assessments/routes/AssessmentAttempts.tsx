import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AssessmentAttempts() {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const candidateFilter = search.get('candidateId') || undefined;

  const { data: attempts = [], isLoading } = useQuery<any[]>({
    queryKey: ['assessment-attempts', id, candidateFilter],
    queryFn: async () => {
      if (!id) return [];
      const res = await fetch(`/api/assessments/${id}/attempts`);
      if (!res.ok) throw new Error('Failed to fetch attempts');
      const json = await res.json();
      return json.attempts as any[];
    },
  });

  const filtered = candidateFilter ? attempts.filter(a => a.candidateId === candidateFilter) : attempts;

  if (isLoading) return <div className="text-center py-8">Loading attempts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessment Attempts</h1>
        <Link to="/assessments">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-gray-500">No attempts submitted yet.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((att: any) => (
            <Card key={att.id}>
              <CardHeader>
                <CardTitle className="text-sm">{att.candidate?.name ?? att.candidateId}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-600">Submitted: {att.submittedAt ? new Date(att.submittedAt).toLocaleString() : '—'}</div>
                <div className="mt-2 text-xs text-gray-500">Response summary not available in demo</div>
                <div className="mt-2">
                  <Link to={`/candidates/${att.candidateId}`}>
                    <Button size="sm" variant="ghost">Open Candidate</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
