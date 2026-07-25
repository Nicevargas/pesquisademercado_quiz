import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (url && key && url !== 'https://your-project.supabase.co' && !url.includes('your-project')) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export async function saveLeadToSupabase(leadData: {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  instagram?: string;
  site?: string;
  atividadePrincipal?: string;
  faturamentoMensal?: string;
  principalDesafio?: string;
  canaisMarketing?: string;
  createdAt: string;
}) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      reason: 'SUPABASE_NOT_CONFIGURED',
      message: 'As variáveis SUPABASE_URL e SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY não estão configuradas no ambiente.'
    };
  }

  try {
    const { data, error } = await client.from('leads').insert({
      id: leadData.id,
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
      created_at: leadData.createdAt,
    }).select();

    if (error) {
      console.error('Error inserting lead to Supabase:', error.message, error.details);
      return {
        success: false,
        reason: 'SUPABASE_INSERT_ERROR',
        message: error.message
      };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error inserting lead to Supabase:', err);
    return {
      success: false,
      reason: 'UNEXPECTED_ERROR',
      message: err?.message || 'Erro inesperado ao conectar ao Supabase'
    };
  }
}

export async function updateLeadDiagnosticInSupabase(leadId: string, diagnosticData: any) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('leads')
      .update({ diagnostic_data: diagnosticData })
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('Error updating diagnostic in Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error updating diagnostic in Supabase:', err);
    return null;
  }
}

export async function fetchLeadsFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads from Supabase:', error.message);
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
  } catch (err) {
    console.error('Unexpected error fetching leads from Supabase:', err);
    return null;
  }
}
