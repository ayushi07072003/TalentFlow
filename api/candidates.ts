import { db } from '../src/lib/db';

export default async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    let query = db.candidates;

    if (search) {
      query = query.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      query = query.filter(candidate => candidate.status === status);
    }

    const total = await query.count();
    const candidates = await query
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return res.status(200).json({
      candidates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error in /api/candidates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}