import { mockData } from './_mock';

export default async function handler(req: any, res: any) {
  try {
    return res.status(200).json(mockData.assessments);
  } catch (error) {
    console.error('Error in /api/assessments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}