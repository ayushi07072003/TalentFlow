import Dexie, { Table } from 'dexie';

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  milestones?: string[];
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: string;
  location?: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description: string;
  sections: AssessmentSection[];
  completionRate?: number; // 0-100 percent, optional metric for dashboard
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSection {
  id: string;
  title: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  title: string;
  description?: string;
  required: boolean;
  options?: string[]; // For single-choice and multi-choice
  min?: number; // For numeric
  max?: number; // For numeric
  maxLength?: number; // For text fields
  conditionalLogic?: ConditionalLogic;
}

export interface ConditionalLogic {
  questionId: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: string | number;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  submittedAt: Date;
}

export interface AssessmentAssignment {
  id: string;
  assessmentId: string;
  candidateId: string;
  status: 'invited' | 'registered' | 'started' | 'submitted';
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateTimeline {
  id: string;
  candidateId: string;
  change: string;
  timestamp: Date;
  type: 'stage-change' | 'note' | 'assessment-submitted';
}

export class TalentFlowDB extends Dexie {
  seed() {
    throw new Error('Method not implemented.');
  }
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;
  assessmentAssignments!: Table<AssessmentAssignment>;
  candidateTimeline!: Table<CandidateTimeline>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, slug, status, orderIndex, createdAt, updatedAt',
      candidates: 'id, name, email, jobId, stage, createdAt, updatedAt',
      assessments: 'id, jobId, createdAt, updatedAt',
      assessmentResponses: 'id, assessmentId, candidateId, submittedAt',
      candidateTimeline: 'id, candidateId, timestamp, type, *timestamp'
    });

    // New stores added in version 2: assessment assignments linking candidates to assessments
    this.version(2).stores({
      jobs: 'id, title, slug, status, orderIndex, createdAt, updatedAt',
      candidates: 'id, name, email, jobId, stage, createdAt, updatedAt',
      assessments: 'id, jobId, createdAt, updatedAt',
      assessmentResponses: 'id, assessmentId, candidateId, submittedAt',
      assessmentAssignments: 'id, assessmentId, candidateId, status, createdAt',
      candidateTimeline: 'id, candidateId, timestamp, type'
    });
  }
}

export const db = new TalentFlowDB();

