import { faker } from '@faker-js/faker';
import { db, Job, Candidate, Assessment, CandidateTimeline, AssessmentQuestion } from './db';

const JOB_TITLES = [
  'Senior Frontend Developer',
  'Full Stack Engineer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Backend Developer',
  'Mobile Developer',
  'QA Engineer',
  'Technical Lead',
  'Software Architect',
  'Cloud Engineer',
  'Security Engineer',
  'Data Engineer',
  'Frontend Engineer',
  'JavaScript Developer',
  'TypeScript Developer',
  'Vue.js Developer',
  'Angular Developer',
  'iOS Developer',
  'Android Developer'
];

const TAGS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'JavaScript', 'AWS', 'Docker',
  'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
  'Microservices', 'Agile', 'Remote', 'Senior', 'Mid-level', 'Junior',
  'Full-time', 'Part-time', 'Contract', 'Frontend', 'Backend', 'Full-stack'
];

const LOCATIONS = [
  'New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Remote', 'Austin', 'Seattle', 'Bangalore', 'Sydney'
];

const STAGES: Array<'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'> = [
  'applied', 'screen', 'tech', 'offer', 'hired', 'rejected'
];

export async function seedDatabase() {
  try {
    // Flexible seeding: if jobs/candidates already exist, don't duplicate them.
    console.log('Seeding database (if needed)...');

    // Jobs: create if none exist, otherwise load existing
    const jobCount = await db.jobs.count();
    let jobs: Job[] = [];
    if (jobCount === 0) {
      for (let i = 0; i < 50; i++) {
        const title = faker.helpers.arrayElement(JOB_TITLES);
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const job: Job = {
          id: faker.string.uuid(),
          title,
          slug,
          status: faker.helpers.arrayElement(['active', 'archived']),
          tags: faker.helpers.arrayElements(TAGS, faker.number.int({ min: 2, max: 5 })),
          milestones: [
            'Resume screen',
            'Phone screen',
            'Technical interview',
            'Onsite interview',
            'Offer'
          ],
          orderIndex: i,
          createdAt: faker.date.past({ years: 2 }),
          updatedAt: faker.date.recent()
        };
        jobs.push(job);
      }

      await db.jobs.bulkAdd(jobs);
    } else {
      jobs = await db.jobs.toArray();
    }

    // Candidates: create only if none exist
    const candidateCount = await db.candidates.count();
    let candidates: Candidate[] = [];
    if (candidateCount === 0) {
      for (let i = 0; i < 2000; i++) {
        const candidate: Candidate = {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          jobId: faker.helpers.arrayElement(jobs).id,
          location: faker.helpers.arrayElement(LOCATIONS),
          stage: faker.helpers.arrayElement(STAGES),
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent()
        };
        candidates.push(candidate);
      }

      await db.candidates.bulkAdd(candidates);
    } else {
      candidates = await db.candidates.toArray();
    }

    // Candidate timeline: create if empty
    const timelineCount = await db.candidateTimeline.count();
    if (timelineCount === 0) {
      const timelineEntries: CandidateTimeline[] = [];
      for (const candidate of candidates) {
        timelineEntries.push({
          id: faker.string.uuid(),
          candidateId: candidate.id,
          change: 'Applied for position',
          timestamp: candidate.createdAt,
          type: 'stage-change'
        });

        if (candidate.stage !== 'applied') {
          const stageProgression = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
          const currentIndex = stageProgression.indexOf(candidate.stage);
          for (let i = 1; i <= currentIndex; i++) {
            const timestamp = new Date(
              candidate.createdAt.getTime() + 
              Math.random() * (candidate.updatedAt.getTime() - candidate.createdAt.getTime())
            );
            timelineEntries.push({
              id: faker.string.uuid(),
              candidateId: candidate.id,
              change: `Moved from ${stageProgression[i-1]} to ${stageProgression[i]}`,
              timestamp,
              type: 'stage-change'
            });
          }
        }

        if (faker.datatype.boolean()) {
          const timestamp = new Date(
            candidate.createdAt.getTime() + 
            Math.random() * (candidate.updatedAt.getTime() - candidate.createdAt.getTime())
          );
          timelineEntries.push({
            id: faker.string.uuid(),
            candidateId: candidate.id,
            change: faker.lorem.sentence(),
            timestamp,
            type: 'note'
          });
        }
      }

      if (timelineEntries.length > 0) {
        await db.candidateTimeline.bulkAdd(timelineEntries);
      }
    }

    // Assessments: ensure at least 3 assessments exist, each with 10+ questions
    const existingAssessmentsCount = await db.assessments.count();
    const assessmentsToCreate = Math.max(0, 3 - existingAssessmentsCount);

    if (assessmentsToCreate > 0) {
      const newAssessments: Assessment[] = [];

      const QUESTION_TYPES: AssessmentQuestion['type'][] = [
        'single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric', 'file-upload'
      ];

      for (let a = 0; a < assessmentsToCreate; a++) {
        const job = jobs[a % jobs.length];
        const questions: any[] = [];

        // Create at least 12 questions to exceed 10
        for (let q = 0; q < 12; q++) {
          const qtype = faker.helpers.arrayElement(QUESTION_TYPES);
          const question: any = {
            id: faker.string.uuid(),
            type: qtype,
            title: faker.lorem.sentence().replace(/\.$/, ''),
            required: faker.datatype.boolean(),
          };

          if (qtype === 'single-choice' || qtype === 'multi-choice') {
            const optionCount = faker.number.int({ min: 3, max: 6 });
            question.options = Array.from({ length: optionCount }).map(() => faker.lorem.words(faker.number.int({ min: 1, max: 3 })));
          }

          if (qtype === 'numeric') {
            const min = faker.number.int({ min: 0, max: 10 });
            const max = min + faker.number.int({ min: 5, max: 100 });
            question.min = min;
            question.max = max;
          }

          if (qtype === 'short-text' || qtype === 'long-text') {
            question.maxLength = faker.number.int({ min: 50, max: 1000 });
          }

          questions.push(question);
        }

        const section = {
          id: faker.string.uuid(),
          title: 'General Questions',
          questions,
        };

        const assessment: Assessment = {
          id: faker.string.uuid(),
          jobId: job.id,
          title: `${job.title} Assessment`,
          description: faker.lorem.paragraph(),
          sections: [section],
          completionRate: faker.number.int({ min: 0, max: 100 }),
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent()
        };

        newAssessments.push(assessment);
      }

      if (newAssessments.length > 0) {
        await db.assessments.bulkAdd(newAssessments);
      }
    }

    console.log('Database seeded (assessments ensured)');
    
      // Ensure specific sample assessments exist with registered/attempted counts
      try {
        const desiredAssessments = [
          { title: 'Frontend Engineer Assessment', date: new Date('2025-10-27'), registered: 120, attempted: 80 },
          { title: 'Backend Developer Assessment', date: new Date('2025-10-27'), registered: 95, attempted: 60 },
          { title: 'Mobile Developer Assessment', date: new Date('2025-10-27'), registered: 70, attempted: 45 },
          { title: 'Full Stack Engineer Assessment', date: new Date('2025-10-27'), registered: 150, attempted: 110 },
          { title: 'Security Engineer Assessment', date: new Date('2025-10-27'), registered: 55, attempted: 30 },
        ];

        const existing = await db.assessments.toArray();
        const toAdd: any[] = [];

        for (const d of desiredAssessments) {
          const found = existing.find((e) => e.title === d.title);
          if (!found) {
            // Try to associate with a job that matches the role, fallback to first job
            const matchingJob = jobs.find((j) => j.title.toLowerCase().includes(d.title.split(' ')[0].toLowerCase())) || jobs[0];
            const assessment: any = {
              id: faker.string.uuid(),
              jobId: matchingJob.id,
              title: d.title,
              description: `Sample ${d.title} created for demo`,
              sections: [
                {
                  id: faker.string.uuid(),
                  title: 'General',
                  questions: []
                }
              ],
              completionRate: Math.round((d.attempted / Math.max(1, d.registered)) * 100),
              registeredCount: d.registered,
              attemptedCount: d.attempted,
              createdAt: d.date,
              updatedAt: d.date
            };

            toAdd.push(assessment);
          }
        }

        if (toAdd.length > 0) {
          await db.assessments.bulkAdd(toAdd);
          console.log(`Seeded ${toAdd.length} demo assessments with registered/attempted counts`);
        }
      } catch (err) {
        console.warn('Could not add demo assessments:', err);
      }

      // Create assessment assignments (link candidates <-> assessments) and some responses
      try {
        const assignmentCount = await db.assessmentAssignments.count().catch(() => 0);
        if ((assignmentCount ?? 0) === 0) {
          const allAssessments = await db.assessments.toArray();
          const allCandidates = await db.candidates.toArray();
          const assignmentsToAdd: any[] = [];
          const responsesToAdd: any[] = [];

          for (const a of allAssessments) {
            // choose between 20 and 150 candidates for each assessment (bounded by available candidates)
            const max = Math.min(allCandidates.length, 150);
            const min = Math.min(20, max);
            const k = faker.number.int({ min, max });
            const selected = faker.helpers.arrayElements(allCandidates, k);

            for (const c of selected) {
              const statusProb = Math.random();
              const status = statusProb > 0.85 ? 'invited' : statusProb > 0.25 ? 'registered' : 'started';
              assignmentsToAdd.push({
                id: faker.string.uuid(),
                assessmentId: a.id,
                candidateId: c.id,
                status,
                createdAt: faker.date.recent({ days: 90 }),
                updatedAt: faker.date.recent({ days: 30 })
              });

              // Some of the assigned candidates will attempt/submit the assessment
              if (Math.random() < 0.6) {
                responsesToAdd.push({
                  id: faker.string.uuid(),
                  assessmentId: a.id,
                  candidateId: c.id,
                  responses: {},
                  submittedAt: faker.date.recent({ days: 20 })
                });
              }
            }
          }

          if (assignmentsToAdd.length > 0) {
            await db.assessmentAssignments.bulkAdd(assignmentsToAdd);
          }
          if (responsesToAdd.length > 0) {
            await db.assessmentResponses.bulkAdd(responsesToAdd);
          }

          console.log(`Seeded ${assignmentsToAdd.length} assessment assignments and ${responsesToAdd.length} responses`);
        }
      } catch (err) {
        console.warn('Could not seed assessment assignments/responses:', err);
      }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
