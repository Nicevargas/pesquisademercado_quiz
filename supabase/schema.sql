-- Supabase SQL Schema for Tchê Tech Insights / Market Insights App
-- Copy and paste this directly into Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

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

-- Index for ordering by creation date
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public lead submissions
DROP POLICY IF EXISTS "Allow public insert on leads" ON public.leads;
CREATE POLICY "Allow public insert on leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Allow reading leads
DROP POLICY IF EXISTS "Allow public read on leads" ON public.leads;
CREATE POLICY "Allow public read on leads"
  ON public.leads
  FOR SELECT
  USING (true);
