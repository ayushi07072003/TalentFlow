import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AssessmentAssignments() {
  const { id } = useParams<{ id: string }>();

  const { data: assignments = [], isLoading } = useQuery<any[]>({
    queryKey: ['assessment-assignments', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await fetch(`/api/assessments/${id}/assignments`);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const json = await res.json();
      return json.assignments as any[];
    },
  });

  if (isLoading) return <div className="text-center py-8">Loading assignments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assigned Candidates</h1>
        <Link to="/assessments">
          <Button variant="ghost">Back</Button>
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className="text-sm text-gray-500">No candidates assigned to this assessment.</div>
      ) : (
        <div className="grid gap-3">
          {assignments.map((a: any) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className="text-sm">{a.candidate?.name ?? a.candidateId}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">Email: {a.candidate?.email ?? '—'}</div>
                  <div className="text-xs text-gray-600">Status: {a.status}</div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Assigned: {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</div>
                <div className="mt-2">
                  <Link to={`/candidates/${a.candidateId}`}>
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
