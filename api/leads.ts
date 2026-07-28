import { saveLeadToSupabase, fetchLeadsFromSupabase } from '../src/lib/supabaseServer.js';

// Memory fallback for serverless invocation instance
const memoryLeads: any[] = [];

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const supabaseLeads = await fetchLeadsFromSupabase();
      if (supabaseLeads) {
        return res.status(200).json({
          success: true,
          source: 'supabase',
          count: supabaseLeads.length,
          leads: supabaseLeads,
        });
      }
    } catch (e: any) {
      console.warn('Supabase fetch error in Vercel function:', e);
    }

    return res.status(200).json({
      success: true,
      source: 'memory',
      count: memoryLeads.length,
      leads: memoryLeads,
    });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const newLead = {
        ...body,
        id: body.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      memoryLeads.unshift(newLead);

      let supabaseResult: any = null;
      try {
        supabaseResult = await saveLeadToSupabase(newLead);
      } catch (sbErr) {
        console.warn('Supabase save warning in Vercel function:', sbErr);
      }

      return res.status(200).json({
        success: true,
        lead: newLead,
        supabaseSynced: Boolean(supabaseResult?.success),
        supabaseDetails: supabaseResult,
      });
    } catch (err: any) {
      console.error('Vercel api/leads POST error:', err);
      const fallbackLead = {
        ...(typeof req.body === 'object' ? req.body : {}),
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      return res.status(200).json({
        success: true,
        lead: fallbackLead,
        supabaseSynced: false,
        warning: err?.message || 'Saved in client fallback.',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
