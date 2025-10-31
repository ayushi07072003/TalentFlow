import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/lib/db';
import { ArrowLeft, Edit, Archive, Users, FileText, Calendar, Tag } from 'lucide-react';

export function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      const data = await response.json();
      return data as Job;
    },
    enabled: !!jobId,
  });

  // Dev-only logging to help debug missing job details
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[JobDetail] route jobId:', jobId);
    // eslint-disable-next-line no-console
    console.debug('[JobDetail] fetched job:', job);
  }

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates', { jobId }],
    queryFn: async () => {
      const response = await fetch('/api/candidates');
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const allCandidates = await response.json();
      return allCandidates.filter((c: any) => c.jobId === jobId);
    },
    enabled: !!jobId,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const res = await fetch('/api/assessments');
      if (!res.ok) throw new Error('Failed to fetch assessments');
      const json = await res.json();
      return json.assessments as any[];
    },
    enabled: !!jobId,
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const handleArchive = () => {
    updateJobMutation.mutate({ status: 'archived' });
  };

  const handleUnarchive = () => {
    updateJobMutation.mutate({ status: 'active' });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Job not found</p>
        <Link to="/jobs">
          <Button className="mt-4">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const candidatesByStage = candidates.reduce((acc: any, candidate: any) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600">/{job.slug}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
            {job.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={job.status === 'active' ? handleArchive : handleUnarchive}
            disabled={updateJobMutation.isPending}
          >
            <Archive className="h-4 w-4 mr-2" />
            {job.status === 'active' ? 'Archive' : 'Unarchive'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Title</h3>
                <p className="text-gray-600">{job.title}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">URL Slug</h3>
                <p className="text-gray-600">/{job.slug}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Created</h3>
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Last Updated</h3>
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Candidates ({candidates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(candidatesByStage).map(([stage, count]) => (
                  <div key={stage} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{count as number}</div>
                    <div className="text-sm text-gray-600 capitalize">{stage}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to={`/candidates?jobId=${job.id}`}>
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    View Candidates for this Job
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Assessments for this job */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.filter((a: any) => a.jobId === job.id).length === 0 ? (
                <div className="text-sm text-gray-600">No assessments configured for this job</div>
              ) : (
                <ul className="space-y-2">
                  {assessments.filter((a: any) => a.jobId === job.id).map((a: any) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-gray-500">Updated {new Date(a.updatedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold">Reg: {a.registeredCount ?? 0}</div>
                        <div className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold">Att: {a.attemptedCount ?? 0}</div>
                        <Link to={`/assessments/${job.id}`}>
                          <Button variant="outline" size="sm">Manage</Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`/candidates?jobId=${job.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View Candidates
                </Button>
              </Link>
              <Link to={`/assessments?jobId=${job.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Assessments
                </Button>
              </Link>
              <Link to={`/assessments/${jobId}`}>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Candidates</span>
                <span className="font-semibold">{candidates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Candidates</span>
                <span className="font-semibold">
                  {candidates.filter((c: any) => !['hired', 'rejected'].includes(c.stage)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hired</span>
                <span className="font-semibold text-green-600">
                  {candidates.filter((c: any) => c.stage === 'hired').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">
                  {candidates.filter((c: any) => c.stage === 'rejected').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Dev debug panel - shows route param and raw job object to aid debugging */}
      {(import.meta.env as ImportMetaEnv).DEV && (
        <div className="mt-4 p-3 bg-gray-50 border rounded text-sm">
          <div className="font-medium text-gray-700">Debug</div>
          <div className="text-xs text-gray-600 mt-2">route jobId: <code className="bg-white px-1 rounded">{String(jobId)}</code></div>
          <div className="mt-2 text-xs text-gray-600">job payload:</div>
          <pre className="mt-1 text-xs max-h-48 overflow-auto">{JSON.stringify(job, null, 2)}</pre>
        </div>
      )}
      {/* Milestones - show what candidates must cover */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {job.milestones && job.milestones.length > 0 ? (
              <ul className="space-y-2">
                {job.milestones.map((m, i) => {
                  const milestoneStages = ['applied', 'screen', 'tech', 'offer', 'hired'];
                  const completed = candidates.filter((c: any) => milestoneStages.indexOf(c.stage) >= i).length;
                  return (
                    <li key={m} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m}</div>
                        <div className="text-xs text-gray-500">Required step {i + 1}</div>
                      </div>
                      <div className="text-sm text-gray-700">{completed}/{candidates.length}</div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">No milestones defined for this job</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
