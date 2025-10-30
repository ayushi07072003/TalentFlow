import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MentionInput } from './MentionInput';
import { Badge } from '@/components/ui/badge';
import { Candidate, CandidateTimeline } from '@/lib/db';
import { User, Mail, Calendar, Clock, MessageSquare, Plus } from 'lucide-react';

export function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const queryClient = useQueryClient();

  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const response = await fetch(`/api/candidates/${id}`);
      if (!response.ok) throw new Error('Failed to fetch candidate');
      const data = await response.json();
      return data as Candidate;
    },
    enabled: !!id,
  });

  const { data: timeline = [], isLoading: timelineLoading } = useQuery({
    queryKey: ['candidate-timeline', id],
    queryFn: async () => {
      const response = await fetch(`/api/candidates/${id}/timeline`);
      if (!response.ok) throw new Error('Failed to fetch timeline');
      const data = await response.json();
      return data as CandidateTimeline[];
    },
    enabled: !!id,
  });

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery<any[]>({
    queryKey: ['candidate-assignments', id],
    queryFn: async () => {
      if (!id) return [];
      const res = await fetch(`/api/candidates/${id}/assignments`);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const json = await res.json();
      return json.assignments as any[];
    },
    enabled: !!id,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const response = await fetch(`/api/candidates/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change: note }),
      });
      if (!response.ok) throw new Error('Failed to add note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-timeline', id] });
      setNewNote('');
      setIsAddingNote(false);
    },
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate(newNote.trim());
    }
  };

  const stageColors = {
    applied: 'bg-blue-100 text-blue-800',
    screen: 'bg-yellow-100 text-yellow-800',
    tech: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const timelineIcons = {
    'stage-change': Clock,
    'note': MessageSquare,
    'assessment-submitted': MessageSquare,
  };

  if (candidateLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading candidate...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Candidate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Profile</h1>
        <p className="text-gray-600">View candidate details and timeline</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Candidate Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-gray-500">{candidate.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Applied {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <Badge
                  className={`${stageColors[candidate.stage as keyof typeof stageColors]} text-sm`}
                >
                  {candidate.stage}
                </Badge>
              </div>

              {/* Assigned assessments list */}
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Assigned Assessments</div>
                {assignmentsLoading ? (
                  <div className="text-xs text-gray-500">Loading assigned assessments...</div>
                ) : assignments.length === 0 ? (
                  <div className="text-xs text-gray-500">No assessments assigned</div>
                ) : (
                  <ul className="space-y-2">
                    {assignments.map((a: any) => (
                      <li key={a.id} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{a.assessment?.title ?? 'Assessment'}</div>
                          <div className="text-xs text-gray-500">Status: {a.status}</div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`/assessments/${a.assessment?.id || a.assessmentId}`} className="text-xs text-blue-600">Open</a>
                          {a.assessment && (
                            <a href={`/assessments/${a.assessment.id}/attempts?candidateId=${candidate.id}`} className="text-xs text-blue-600">View Attempts</a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Timeline</span>
                </span>
                <Button
                  size="sm"
                  onClick={() => setIsAddingNote(true)}
                  disabled={isAddingNote}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Note Form */}
              {isAddingNote && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Add a note</label>
                    <div className="space-y-2">
                      <MentionInput
                        value={newNote}
                        onChange={setNewNote}
                        placeholder="Type your note here... Use @ to mention team members"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || addNoteMutation.isPending}
                        >
                          {addNoteMutation.isPending ? 'Adding...' : 'Add'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsAddingNote(false);
                            setNewNote('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Items */}
              <div className="space-y-4">
                {timelineLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading timeline...</p>
                  </div>
                ) : timeline.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No timeline entries yet</p>
                ) : (
                  timeline
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((entry) => {
                      const Icon = timelineIcons[entry.type];
                      return (
                        <div key={entry.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{entry.change}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
