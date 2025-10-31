import { mockData } from './_mock';

export default async function handler(req: any, res: any) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    let candidates = mockData.candidates.slice();

    if (search) {
      const q = search.toLowerCase();
      candidates = candidates.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }

    if (status) {
      candidates = candidates.filter(c => c.stage === status);
    }

    const total = candidates.length;
    const paginated = candidates.slice((page - 1) * pageSize, page * pageSize);

    return res.status(200).json({ candidates: paginated, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    console.error('Error in /api/candidates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}