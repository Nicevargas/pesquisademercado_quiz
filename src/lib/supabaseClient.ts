import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

export function getClientSupabase(): SupabaseClient | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  // Read environment variables available in Vite client-side
  const metaEnv = (import.meta as any).env || {};
  const url = metaEnv.VITE_SUPABASE_URL || (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__);
  const key = metaEnv.VITE_SUPABASE_ANON_KEY || (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__);

  if (url && key && url !== 'https://your-project.supabase.co' && !url.includes('your-project')) {
    try {
      supabaseClientInstance = createClient(url, key);
      return supabaseClientInstance;
    } catch (e) {
      console.warn('Client Supabase init failed:', e);
      return null;
    }
  }
  return null;
}

function parseDiagnosticField(data: any): any {
  if (!data) return null;
  const raw = data.diagnostic_data || data.diagnostic || data.diagnosticData;
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function saveLeadDirectToSupabase(leadData: any) {
  const client = getClientSupabase();
  if (!client) {
    return {
      success: false,
      reason: 'NO_CLIENT_CONFIG',
      message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente do Vercel.'
    };
  }

  try {
    const payload: any = {
      id: leadData.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      nome: leadData.nome,
      whatsapp: leadData.whatsapp,
      email: leadData.email,
      empresa: leadData.empresa,
      instagram: leadData.instagram || null,
      site: leadData.site || null,
      atividade_principal: leadData.atividadePrincipal || leadData.atividade_principal || null,
      faturamento_mensal: leadData.faturamentoMensal || leadData.faturamento_mensal || null,
      principal_desafio: leadData.principalDesafio || leadData.principal_desafio || null,
      canais_marketing: leadData.canaisMarketing || leadData.canais_marketing || null,
      created_at: leadData.createdAt || new Date().toISOString(),
    };

    if (leadData.diagnostic) {
      payload.diagnostic_data = leadData.diagnostic;
    }

    const { data, error } = await client.from('leads').upsert(payload).select();

    if (error) {
      console.error('Direct client-side Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('Direct client-side Supabase unexpected error:', err);
    return { success: false, error: err?.message || 'Unexpected error' };
  }
}

export async function updateLeadDiagnosticDirectInSupabase(leadId: string, diagnosticData: any) {
  const client = getClientSupabase();
  if (!client || !leadId) return null;

  try {
    // Try diagnostic_data first
    let res = await client
      .from('leads')
      .update({ diagnostic_data: diagnosticData })
      .eq('id', leadId)
      .select();

    if (res.error) {
      // Try diagnostic column
      res = await client
        .from('leads')
        .update({ diagnostic: diagnosticData })
        .eq('id', leadId)
        .select();
    }
    return res.data;
  } catch (e) {
    console.error('Error updating diagnostic direct:', e);
    return null;
  }
}

export async function fetchLeadsDirectFromSupabase() {
  const client = getClientSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Direct client fetch error:', error.message);
      return null;
    }

    return data.map((item: any) => ({
      id: item.id,
      nome: item.nome,
      whatsapp: item.whatsapp,
      email: item.email,
      empresa: item.empresa,
      instagram: item.instagram,
      site: item.site,
      atividadePrincipal: item.atividade_principal || item.atividadePrincipal,
      faturamentoMensal: item.faturamento_mensal || item.faturamentoMensal,
      principalDesafio: item.principal_desafio || item.principalDesafio,
      canaisMarketing: item.canais_marketing || item.canaisMarketing,
      createdAt: item.created_at || item.createdAt,
      diagnostic: parseDiagnosticField(item),
    }));
  } catch (e) {
    console.error('Direct client fetch unexpected error:', e);
    return null;
  }
}

export async function fetchSingleLeadDirectFromSupabase(leadId: string) {
  const client = getClientSupabase();
  if (!client || !leadId) return null;

  try {
    const { data, error } = await client
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !data) {
      console.error('Direct single lead fetch error:', error?.message);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      whatsapp: data.whatsapp,
      email: data.email,
      empresa: data.empresa,
      instagram: data.instagram,
      site: data.site,
      atividadePrincipal: data.atividade_principal || data.atividadePrincipal,
      faturamentoMensal: data.faturamento_mensal || data.faturamentoMensal,
      principalDesafio: data.principal_desafio || data.principalDesafio,
      canaisMarketing: data.canais_marketing || data.canaisMarketing,
      createdAt: data.created_at || data.createdAt,
      diagnostic: parseDiagnosticField(data),
    };
  } catch (e) {
    console.error('Direct single lead fetch unexpected error:', e);
    return null;
  }
}
