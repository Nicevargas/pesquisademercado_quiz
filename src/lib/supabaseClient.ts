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
    const { data, error } = await client.from('leads').insert({
      id: leadData.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      nome: leadData.nome,
      whatsapp: leadData.whatsapp,
      email: leadData.email,
      empresa: leadData.empresa,
      instagram: leadData.instagram || null,
      site: leadData.site || null,
      atividade_principal: leadData.atividadePrincipal || null,
      faturamento_mensal: leadData.faturamentoMensal || null,
      principal_desafio: leadData.principalDesafio || null,
      canais_marketing: leadData.canaisMarketing || null,
      created_at: leadData.createdAt || new Date().toISOString(),
    }).select();

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
      atividadePrincipal: item.atividade_principal,
      faturamentoMensal: item.faturamento_mensal,
      principalDesafio: item.principal_desafio,
      canaisMarketing: item.canais_marketing,
      createdAt: item.created_at,
      diagnostic: item.diagnostic_data,
    }));
  } catch (e) {
    console.error('Direct client fetch unexpected error:', e);
    return null;
  }
}

export async function fetchSingleLeadDirectFromSupabase(leadId: string) {
  const client = getClientSupabase();
  if (!client) return null;

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
      atividadePrincipal: data.atividade_principal,
      faturamentoMensal: data.faturamento_mensal,
      principalDesafio: data.principal_desafio,
      canaisMarketing: data.canais_marketing,
      createdAt: data.created_at,
      diagnostic: data.diagnostic_data,
    };
  } catch (e) {
    console.error('Direct single lead fetch unexpected error:', e);
    return null;
  }
}
