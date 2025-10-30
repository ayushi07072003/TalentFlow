import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AssessmentsList() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jobId = params.get('jobId') || undefined;
  const { data: assessments = [], isLoading } = useQuery<any[]>({
    queryKey: ['assessments'],
    queryFn: async () => {
      const res = await fetch('/api/assessments');
      if (!res.ok) throw new Error('Failed to fetch assessments');
      const json = await res.json();
      return json.assessments as any[];
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading assessments...</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-700">No assessments available</h2>
        <p className="text-sm text-gray-500 mt-2">Create an assessment from a Job page or the builder.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobId && (
        <div>
          <Link to={`/jobs/${jobId}`}>
            <Button variant="ghost">Back to Job</Button>
          </Link>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <p className="text-gray-600">Browse and manage job assessments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.filter((a: any) => !jobId || a.jobId === jobId).map((assessment: any) => (
          <Card key={assessment.id} className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{assessment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 truncate">{assessment.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">{assessment.sections?.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0)} questions</div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold">Reg: {assessment.registeredCount ?? 0}</div>
                  <div className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold">Att: {assessment.attemptedCount ?? 0}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center -ml-1">
                <div className="flex justify-between ">
                  <Link to={`/assessments/${assessment.jobId}`}>
                    <Button size="sm">Open</Button>
                  </Link>
                  <Link to={`/assessments/${assessment.id}/assignments`}>
                    <Button size="sm" variant="ghost">View Candidates</Button>
                  </Link>
                  <Link to={`/assessments/${assessment.id}/attempts`}>
                    <Button size="sm" variant="ghost">View Attempts</Button>
                  </Link>
                </div>
                <p className="text-xs text-gray-500">Updated {new Date(assessment.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
