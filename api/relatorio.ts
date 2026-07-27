import { fetchSingleLeadFromSupabase } from '../src/lib/supabaseServer.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query?.id || req.query?.relatorio;
  if (!id) {
    return res.status(400).json({ error: 'Missing lead ID parameter (?id=xxx)' });
  }

  try {
    const lead = await fetchSingleLeadFromSupabase(id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead or diagnostic not found in database' });
    }

    return res.status(200).json({
      success: true,
      lead,
    });
  } catch (err: any) {
    console.error('API /api/relatorio error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error fetching lead report' });
  }
}
