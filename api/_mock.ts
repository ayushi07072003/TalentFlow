import { faker } from '@faker-js/faker';

faker.seed(12345);

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

export function generateMockData() {
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
}

// Cache the generated data so every function invocation (cold start aside) returns same data
export const mockData = generateMockData();
