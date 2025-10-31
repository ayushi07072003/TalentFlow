import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AssessmentRuntime } from './AssessmentRuntime';
import { Assessment } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, User } from 'lucide-react';

interface AssessmentSubmitProps {
  assessment: Assessment;
}

export function AssessmentSubmit({ assessment }: AssessmentSubmitProps) {
  const { jobId } = useParams<{ jobId: string }>();
  const [candidateId, setCandidateId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const submitAssessmentMutation = useMutation({
    mutationFn: async (responses: Record<string, any>) => {
      const response = await fetch(`/api/assessments/${jobId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          responses,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit assessment');
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['candidate-timeline', candidateId] });
    },
  });

  const handleSubmit = (data: Record<string, any>) => {
    if (!candidateId.trim()) {
      alert('Please enter a candidate ID');
      return;
    }
    submitAssessmentMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for completing the assessment. Your responses have been recorded.
          </p>
          <Button onClick={() => {
            setIsSubmitted(false);
            setCandidateId('');
          }}>
            Submit Another Response
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Candidate Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidate ID
              </label>
              <input
                type="text"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                placeholder="Enter candidate ID (e.g., candidate-123)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This ID will be used to track the assessment response.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AssessmentRuntime
        assessment={assessment}
        onSubmit={handleSubmit}
        isReadOnly={false}
      />
    </div>
  );
}
