import { db } from '../src/lib/db';

export default async function handler(req: any, res: any) {
  try {
    const assessments = await db.assessments.toArray();
    return res.status(200).json(assessments);
  } catch (error) {
    console.error('Error in /api/assessments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}