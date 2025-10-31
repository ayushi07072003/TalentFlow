// Minimal Vercel serverless function to handle login in production.
// Keeps parity with the MSW handler used in development.

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Simple demo credential check to match the mock handler used in dev
  if (email === 'admin@talentflow.io' && password === 'password123') {
    return res.status(200).json({
      user: {
        name: 'HR Admin',
        email: 'admin@talentflow.io',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}
