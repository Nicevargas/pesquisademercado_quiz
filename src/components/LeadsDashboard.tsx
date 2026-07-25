import React, { useState, useEffect } from 'react';
import { X, Users, RefreshCw, Mail, Phone, Building, Calendar, Sparkles, Instagram, Globe } from 'lucide-react';
import { SubmissionData } from '../types';

interface LeadsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  leadCount: number;
}

export const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<SubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [leadSource, setLeadSource] = useState<'supabase' | 'memory' | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
        setLeadSource(data.source || 'memory');
      }
    } catch (e) {
      console.error('Failed to load leads:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/80 rounded-lg text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
                Painel de Leads Recebidos ({leads.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Respostas enviadas através da pesquisa Market Insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeads}
              disabled={isLoading}
              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Carregando respostas de leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-medium">Nenhum lead recebido ainda.</p>
              <p className="text-xs text-slate-400">
                Preencha a pesquisa na tela inicial para testar a captação e o diagnóstico IA.
              </p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {lead.nome}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      <Building className="w-3.5 h-3.5" />
                      <span>{lead.empresa || 'Empresa não informada'}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full w-fit">
                    <Calendar className="w-3 h-3" />
                    {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <a
                    href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.nome}! Vi seu formulário de diagnóstico da empresa ${lead.empresa}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-medium"
                    title="Abrir conversa no WhatsApp com este Lead"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lead.whatsapp}</span>
                  </a>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  {lead.instagram && (
                    <div className="flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      <span className="font-medium">{lead.instagram}</span>
                    </div>
                  )}
                  {lead.site && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate font-medium">{lead.site}</span>
                    </div>
                  )}
                </div>

                {/* Survey responses summary */}
                <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Atividade</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {lead.atividadePrincipal || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Faturamento</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {lead.faturamentoMensal || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Desafio</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {lead.principalDesafio || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Canais</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {lead.canaisMarketing || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-2 justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Backend Tchê Tech
            </span>
            {leadSource === 'supabase' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase Ativo (Tabela: leads)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title="Defina SUPABASE_URL e SUPABASE_ANON_KEY no servidor">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Memória do Servidor (Configure SUPABASE_URL no .env)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
