import React from 'react';
import { useParams } from 'react-router-dom';
import { AssessmentBuilder } from '../components/AssessmentBuilder';

export function AssessmentPage() {
  const { jobId } = useParams<{ jobId: string }>();

  if (!jobId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Job ID is required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
        <p className="text-gray-600">Create and manage job assessments</p>
      </div>

      <AssessmentBuilder jobId={jobId} />
    </div>
  );
}
