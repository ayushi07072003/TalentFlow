import { db, Job } from '../src/lib/db';

export default async function handler(req: any, res: any) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') || '';
  const tags = url.searchParams.get('tags')?.split(',') || [];

  let jobs = db.jobs.orderBy('orderIndex').toArray();

  if (search) {
    jobs = jobs.filter(job => 
      job.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    jobs = jobs.filter(job => job.status === status);
  }

  if (tags.length > 0) {
    jobs = jobs.filter(job => 
      tags.some(tag => job.tags.includes(tag))
    );
  }

  const total = jobs.length;
  const paginatedJobs = jobs.slice((page - 1) * pageSize, page * pageSize);

  return res.status(200).json({
    jobs: paginatedJobs,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}