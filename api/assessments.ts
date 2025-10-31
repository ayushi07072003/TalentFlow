import { mockData } from './_mock';

export default async function handler(req: any, res: any) {
  try {
    if (!mockData) {
      console.error('[api/assessments] mockData is null or undefined');
      return res.status(500).json({ error: 'Server mock data unavailable' });
    }
    console.debug('[api/assessments] mock assessments count', Array.isArray(mockData.assessments) ? mockData.assessments.length : 0);
    return res.status(200).json(Array.isArray(mockData.assessments) ? mockData.assessments : []);
  } catch (error) {
    console.error('Error in /api/assessments:', String(error));
    return res.status(500).json({ error: 'Internal server error' });
  }
}