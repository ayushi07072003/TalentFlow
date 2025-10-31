// IMPORTANT: Avoid top-level ESM imports of heavy libs in serverless functions.
// We lazy-load faker within the generator so a bundling/runtime mismatch
// does not crash function initialization in Vercel.

type Job = {
  id: string;
  title: string;
  slug: string;
  status: string;
  tags: string[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  jobId: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
};

type Assessment = {
  id: string;
  jobId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

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
  'Machine Learning Engineer'
];

const TAGS = ['React','TypeScript','Node.js','Python','AWS','Docker','Kubernetes','PostgreSQL'];

export async function generateMockData() {
  try {
    const { faker } = await import('@faker-js/faker');
    faker.seed(12345);

    const jobs: Job[] = [];
    for (let i = 0; i < 50; i++) {
      const title = faker.helpers.arrayElement(JOB_TITLES);
      const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + i;
      jobs.push({
        id: faker.string.uuid(),
        title,
        slug,
        status: faker.helpers.arrayElement(['active','archived']),
        tags: faker.helpers.arrayElements(TAGS, faker.number.int({ min: 1, max: 4 })),
        orderIndex: i,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString()
      });
    }

    const candidates: Candidate[] = [];
    for (let i = 0; i < 500; i++) {
      const job = faker.helpers.arrayElement(jobs);
      candidates.push({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        jobId: job.id,
        stage: faker.helpers.arrayElement(['applied','screen','tech','offer','hired','rejected']),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString()
      });
    }

    const assessments: Assessment[] = [];
    for (let i = 0; i < 5; i++) {
      const job = faker.helpers.arrayElement(jobs);
      assessments.push({
        id: faker.string.uuid(),
        jobId: job.id,
        title: `${job.title} Assessment`,
        description: faker.lorem.paragraph(),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString()
      });
    }

    return { jobs, candidates, assessments };
  } catch (err) {
    // Fallback deterministic dataset if faker import fails in serverless env
    // eslint-disable-next-line no-console
    console.error('[api/_mock] Falling back to static mock data:', String(err));
    const now = new Date().toISOString();
    const jobs: Job[] = [
      { id: 'j-1', title: 'Frontend Engineer', slug: 'frontend-engineer-1', status: 'active', tags: ['React','TypeScript'], orderIndex: 0, createdAt: now, updatedAt: now },
      { id: 'j-2', title: 'Backend Developer', slug: 'backend-developer-2', status: 'active', tags: ['Node.js','PostgreSQL'], orderIndex: 1, createdAt: now, updatedAt: now },
      { id: 'j-3', title: 'DevOps Engineer', slug: 'devops-engineer-3', status: 'archived', tags: ['AWS','Docker'], orderIndex: 2, createdAt: now, updatedAt: now }
    ];
    const candidates: Candidate[] = [
      { id: 'c-1', name: 'Alex Johnson', email: 'alex@example.com', jobId: 'j-1', stage: 'applied', createdAt: now, updatedAt: now },
      { id: 'c-2', name: 'Priya Singh', email: 'priya@example.com', jobId: 'j-2', stage: 'screen', createdAt: now, updatedAt: now }
    ];
    const assessments: Assessment[] = [
      { id: 'a-1', jobId: 'j-1', title: 'Frontend Engineer Assessment', description: 'Static assessment (fallback)', createdAt: now, updatedAt: now }
    ];
    return { jobs, candidates, assessments };
  }
}

// Initialize cache asynchronously to avoid failing function init
let _mockData: { jobs: Job[]; candidates: Candidate[]; assessments: Assessment[] } = { jobs: [], candidates: [], assessments: [] };
let _initPromise: Promise<void> | null = null;

async function ensureDataReady() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const data = await generateMockData();
    _mockData = data;
  })();
  return _initPromise;
}

export const mockData = new Proxy(_mockData as any, {
  get(target, prop, receiver) {
    // Kick off async init without blocking
    // Consumers should handle empty arrays on first cold hit
    void ensureDataReady();
    return Reflect.get(_mockData as any, prop, receiver);
  }
}) as { jobs: Job[]; candidates: Candidate[]; assessments: Assessment[] };
