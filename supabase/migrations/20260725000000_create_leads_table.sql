-- Migration: Create leads and market_diagnostics tables
-- Target DB: Supabase (PostgreSQL)

-- 1. Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  empresa TEXT NOT NULL,
  atividade_principal TEXT,
  faturamento_mensal TEXT,
  principal_desafio TEXT,
  canais_marketing TEXT,
  diagnostic_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert new leads (for public web survey form)
CREATE POLICY "Allow public insert on leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow public read access to leads (or restrict to service role if required)
CREATE POLICY "Allow public read on leads"
  ON public.leads
  FOR SELECT
  USING (true);
