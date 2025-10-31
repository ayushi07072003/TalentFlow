import { http, HttpResponse } from 'msw';
import { db, Job, Candidate, Assessment, AssessmentResponse } from '../lib/db';

// Simulate network latency
const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));

// Simulate occasional errors (5-10% error rate)
const shouldError = () => Math.random() < 0.08;

export const handlers = [
  // Auth handlers
  http.post('/api/login', async ({ request }) => {
    await delay();
    
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'admin@talentflow.io' && body.password === 'password123') {
      return HttpResponse.json({ user: { name: 'HR Admin' } });
    }
    
    return new HttpResponse(null, { status: 401 });
  }),

  // Jobs handlers
  http.get('/jobs', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const tags = url.searchParams.get('tags')?.split(',') || [];

    let query = db.jobs.orderBy('orderIndex');

    if (search) {
      query = query.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      query = query.filter(job => job.status === status);
    }

    if (tags.length > 0) {
      query = query.filter(job => 
        tags.some(tag => job.tags.includes(tag))
      );
    }

    const total = await query.count();
    const jobs = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();

    return HttpResponse.json({
      jobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  }),

  http.get('/api/jobs', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const tags = url.searchParams.get('tags')?.split(',') || [];

    let query = db.jobs.orderBy('orderIndex');

    if (search) {
      query = query.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      query = query.filter(job => job.status === status);
    }

    if (tags.length > 0) {
      query = query.filter(job => 
        tags.some(tag => job.tags.includes(tag))
      );
    }

    const total = await query.count();
    const jobs = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();

    return HttpResponse.json({
      jobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }
    
    const job = await db.jobs.get(params.id as string);
    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(job);
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Partial<Job>;
    const job: Job = {
      id: crypto.randomUUID(),
      title: body.title!,
      slug: body.slug!,
      status: 'active',
      tags: body.tags || [],
      orderIndex: await db.jobs.count(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if slug is unique
    const existingJob = await db.jobs.where('slug').equals(job.slug).first();
    if (existingJob) {
      return new HttpResponse(null, { status: 400 });
    }

    await db.jobs.add(job);
    return HttpResponse.json(job);
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Partial<Job>;
    const job = await db.jobs.get(params.id as string);
    
    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedJob = { ...job, ...body, updatedAt: new Date() };
    await db.jobs.update(params.id as string, updatedJob);
    
    return HttpResponse.json(updatedJob);
  }),

  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as { fromOrder: number; toOrder: number };
    const { fromOrder, toOrder } = body;

    // Get all jobs and reorder them
    const jobs = await db.jobs.orderBy('orderIndex').toArray();
    
    // Remove the job from its current position
    const jobToMove = jobs.find(job => job.orderIndex === fromOrder);
    if (!jobToMove) {
      return new HttpResponse(null, { status: 404 });
    }

    // Update order indices
    for (const job of jobs) {
      if (job.orderIndex > fromOrder) {
        await db.jobs.update(job.id, { orderIndex: job.orderIndex - 1 });
      }
    }

    for (const job of jobs) {
      if (job.orderIndex >= toOrder) {
        await db.jobs.update(job.id, { orderIndex: job.orderIndex + 1 });
      }
    }

    await db.jobs.update(jobToMove.id, { orderIndex: toOrder, updatedAt: new Date() });

    return HttpResponse.json({ success: true });
  }),

    // Delete job
    http.delete('/api/jobs/:id', async ({ params }) => {
      await delay();
      const job = await db.jobs.get(params.id as string);
      if (!job) {
        return new HttpResponse(null, { status: 404 });
      }
      await db.jobs.delete(params.id as string);
      // Optionally, delete related candidates, assessments, etc.
      return HttpResponse.json({ success: true });
    }),

  // Candidates handlers
  // Support both /candidates and /api/candidates with search, stage and pagination
  http.get('/api/candidates', async ({ request }) => {
    await delay();

    const url = new URL(request.url);
  const stage = url.searchParams.get('stage') || '';
  const jobId = url.searchParams.get('jobId') || '';
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    let query = db.candidates.orderBy('createdAt');

    if (stage) {
      query = query.filter(candidate => candidate.stage === stage);
    }

    if (jobId) {
      query = query.filter(candidate => candidate.jobId === jobId);
    }

    if (search) {
      const s = search.toLowerCase();
      query = query.filter(candidate =>
        candidate.name.toLowerCase().includes(s) || candidate.email.toLowerCase().includes(s)
      );
    }

    const total = await query.count();
    const candidates = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();

    return HttpResponse.json({ candidates, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  http.get('/candidates', async ({ request }) => {
    // Mirror /api/candidates
    await delay();

    const url = new URL(request.url);
  const stage = url.searchParams.get('stage') || '';
  const search = url.searchParams.get('search') || '';
  const jobId = url.searchParams.get('jobId') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    let query = db.candidates.orderBy('createdAt');

    if (stage) {
      query = query.filter(candidate => candidate.stage === stage);
    }

    if (jobId) {
      query = query.filter(candidate => candidate.jobId === jobId);
    }

    if (search) {
      const s = search.toLowerCase();
      query = query.filter(candidate =>
        candidate.name.toLowerCase().includes(s) || candidate.email.toLowerCase().includes(s)
      );
    }

    const total = await query.count();
    const candidates = await query.offset((page - 1) * pageSize).limit(pageSize).toArray();

    return HttpResponse.json({ candidates, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  }),

  // Create candidate
  http.post('/api/candidates', async ({ request }) => {
    await delay();

    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Partial<Candidate>;
    if (!body.name || !body.email) {
      return new HttpResponse(null, { status: 400 });
    }

    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      jobId: body.jobId || '',
      stage: (body.stage as any) || 'applied',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.candidates.add(candidate);

    // Add initial timeline entry
    await db.candidateTimeline.add({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      change: 'Applied for position',
      timestamp: candidate.createdAt,
      type: 'stage-change'
    });

    return HttpResponse.json(candidate);
  }),

  http.post('/candidates', async ({ request }) => {
    // Mirror /api/candidates create
    await delay();

    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Partial<Candidate>;
    if (!body.name || !body.email) {
      return new HttpResponse(null, { status: 400 });
    }

    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      jobId: body.jobId || '',
      stage: (body.stage as any) || 'applied',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.candidates.add(candidate);

    await db.candidateTimeline.add({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      change: 'Applied for position',
      timestamp: candidate.createdAt,
      type: 'stage-change'
    });

    return HttpResponse.json(candidate);
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await delay();
    
    const candidate = await db.candidates.get(params.id as string);
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(candidate);
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay();
    
    const timeline = await db.candidateTimeline
      .where('candidateId')
      .equals(params.id as string)
      .sortBy('timestamp');
    
    return HttpResponse.json(timeline);
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Partial<Candidate>;
    const candidate = await db.candidates.get(params.id as string);
    
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedCandidate = { ...candidate, ...body, updatedAt: new Date() };
    await db.candidates.update(params.id as string, updatedCandidate);

    // Add timeline entry if stage changed
    if (body.stage && body.stage !== candidate.stage) {
      await db.candidateTimeline.add({
        id: crypto.randomUUID(),
        candidateId: candidate.id,
        change: `Moved from ${candidate.stage} to ${body.stage}`,
        timestamp: new Date(),
        type: 'stage-change'
      });
    }
    
    return HttpResponse.json(updatedCandidate);
  }),

    // Delete candidate
    http.delete('/api/candidates/:id', async ({ params }) => {
      await delay();
      const candidate = await db.candidates.get(params.id as string);
      if (!candidate) {
        return new HttpResponse(null, { status: 404 });
      }
      await db.candidates.delete(params.id as string);
      // Optionally, delete related timeline entries, etc.
      return HttpResponse.json({ success: true });
    }),

  http.post('/api/candidates/:id/timeline', async ({ params, request }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as { change: string };
    const candidate = await db.candidates.get(params.id as string);
    
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }

    const timelineEntry = {
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      change: body.change,
      timestamp: new Date(),
      type: 'note' as const
    };

    await db.candidateTimeline.add(timelineEntry);
    return HttpResponse.json(timelineEntry);
  }),

  // Assessments handlers
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay();
    
    const assessment = await db.assessments
      .where('jobId')
      .equals(params.jobId as string)
      .first();
    
    if (!assessment) {
      return new HttpResponse(null, { status: 404 });
    }

    // compute linked counts from assignments/responses
    const registeredCount = await db.assessmentAssignments.where('assessmentId').equals(assessment.id).count().catch(() => 0);
    const attemptedCount = await db.assessmentResponses.where('assessmentId').equals(assessment.id).count().catch(() => 0);

    return HttpResponse.json({ ...assessment, registeredCount, attemptedCount });
  }),

  // List assessments
  http.get('/api/assessments', async () => {
    await delay();
    const assessments = await db.assessments.toArray();

    // enrich with registered/attempted counts using assignment/response tables
    const enriched = await Promise.all(assessments.map(async (a) => {
      const registeredCount = await db.assessmentAssignments.where('assessmentId').equals(a.id).count().catch(() => 0);
      const attemptedCount = await db.assessmentResponses.where('assessmentId').equals(a.id).count().catch(() => 0);
      return { ...a, registeredCount, attemptedCount };
    }));

    return HttpResponse.json({ assessments: enriched });
  }),

  // Assignments for a specific candidate (which assessments they were assigned to)
  http.get('/api/candidates/:id/assignments', async ({ params }) => {
    await delay();

    const candidateId = params.id as string;
    // Find assignments for the candidate and enrich with assessment metadata
    const assignments = await db.assessmentAssignments
      .where('candidateId')
      .equals(candidateId)
      .toArray()
      .catch(() => [] as any[]);

    const enriched = await Promise.all(assignments.map(async (asgmt) => {
      const assessment = await db.assessments.get(asgmt.assessmentId).catch(() => null);
      return { ...asgmt, assessment };
    }));

    return HttpResponse.json({ assignments: enriched });
  }),

  // Assignments for a specific assessment (which candidates are registered/started)
  http.get('/api/assessments/:id/assignments', async ({ params }) => {
    await delay();

    const assessmentId = params.id as string;
    const assignments = await db.assessmentAssignments
      .where('assessmentId')
      .equals(assessmentId)
      .toArray()
      .catch(() => [] as any[]);

    const enriched = await Promise.all(assignments.map(async (asgmt) => {
      const candidate = await db.candidates.get(asgmt.candidateId).catch(() => null);
      return { ...asgmt, candidate };
    }));

    return HttpResponse.json({ assignments: enriched });
  }),

  // Attempts/submissions for a specific assessment
  http.get('/api/assessments/:id/attempts', async ({ params }) => {
    await delay();

    const assessmentId = params.id as string;
    const attempts = await db.assessmentResponses
      .where('assessmentId')
      .equals(assessmentId)
      .toArray()
      .catch(() => [] as any[]);

    // Enrich attempts with candidate info
    const enriched = await Promise.all(attempts.map(async (att) => {
      const candidate = await db.candidates.get(att.candidateId).catch(() => null);
      return { ...att, candidate };
    }));

    return HttpResponse.json({ attempts: enriched });
  }),

  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Assessment;
    const existingAssessment = await db.assessments
      .where('jobId')
      .equals(params.jobId as string)
      .first();

    if (existingAssessment) {
      await db.assessments.update(existingAssessment.id, {
        ...body,
        updatedAt: new Date()
      });
      return HttpResponse.json({ ...existingAssessment, ...body, updatedAt: new Date() });
    } else {
      const assessment: Assessment = {
        ...body,
        id: crypto.randomUUID(),
        jobId: params.jobId as string,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.assessments.add(assessment);
      return HttpResponse.json(assessment);
    }
  }),

  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    await delay();
    
    if (shouldError()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as { candidateId: string; responses: Record<string, any> };
    const response: AssessmentResponse = {
      id: crypto.randomUUID(),
      assessmentId: params.jobId as string,
      candidateId: body.candidateId,
      responses: body.responses,
      submittedAt: new Date()
    };

    await db.assessmentResponses.add(response);

    // Add timeline entry
    await db.candidateTimeline.add({
      id: crypto.randomUUID(),
      candidateId: body.candidateId,
      change: 'Assessment submitted',
      timestamp: new Date(),
      type: 'assessment-submitted'
    });

    return HttpResponse.json(response);
  })
  ,
  // Activity feed - aggregate candidate timeline, job create events, assessment submissions
  http.get('/api/activity', async () => {
    await delay();

    // Gather candidate timeline entries
    const timeline = await db.candidateTimeline.toArray();

    // Map timeline entries to a simple activity shape
    const activities: any[] = timeline.map(t => ({
      id: t.id,
      type: t.type,
      description: t.change,
      timestamp: t.timestamp,
    }));

    // Add job creation events
    const jobs = await db.jobs.toArray();
    for (const job of jobs) {
      activities.push({
        id: `job-${job.id}`,
        type: 'job-created',
        description: `Job created: ${job.title}`,
        timestamp: job.createdAt,
      });
    }

    // Add assessment submissions
    const submissions = await db.assessmentResponses.toArray();
    for (const s of submissions) {
      activities.push({
        id: `submission-${s.id}`,
        type: 'assessment-submitted',
        description: `Assessment submitted by candidate ${s.candidateId}`,
        timestamp: s.submittedAt,
      });
    }

    // Sort by timestamp desc
    activities.sort((a, b) => new Date(b.timestamp as any).getTime() - new Date(a.timestamp as any).getTime());

    return HttpResponse.json({ activity: activities });
  })
];
