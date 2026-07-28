import { getSupabaseClient } from '../src/lib/supabaseServer.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isSupabaseConfigured = Boolean(getSupabaseClient());
  return res.status(200).json({
    status: 'ok',
    environment: 'vercel_serverless',
    supabase: isSupabaseConfigured ? 'connected' : 'not_configured',
    timestamp: new Date().toISOString(),
  });
}
