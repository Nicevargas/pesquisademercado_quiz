import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Building,
  User,
  Phone,
  Mail,
  Instagram,
  Globe,
  MessageCircle,
  Copy,
  Check,
  Share2,
  Printer,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import { fetchSingleLeadDirectFromSupabase, getLocalReport, fetchLeadsDirectFromSupabase } from '../lib/supabaseClient';
import { formatFullReportText } from '../lib/webhookAutoSend';

interface PublicReportPageProps {
  reportId: string;
  onBackToHome?: () => void;
  onNewDiagnostic?: () => void;
}

export const PublicReportPage: React.FC<PublicReportPageProps> = ({ reportId, onBackToHome, onNewDiagnostic }) => {
  const [lead, setLead] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      setError(null);

      // 0. Check local report cache first for instant display
      const localData = getLocalReport(reportId);
      if (localData && isMounted) {
        setLead(localData);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        // 1. Try server endpoint
        const res = await fetch(`/api/relatorio?id=${encodeURIComponent(reportId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.lead) {
            if (isMounted) {
              setLead(data.lead);
              setIsLoading(false);
            }
            return;
          }
        }

        // 2. Fallback to direct client Supabase query
        const directLead = await fetchSingleLeadDirectFromSupabase(reportId);
        if (directLead) {
          if (isMounted) {
            setLead(directLead);
            setIsLoading(false);
          }
          return;
        }

        // 3. Fallback: search all leads in Supabase
        const allLeads = await fetchLeadsDirectFromSupabase();
        if (allLeads && allLeads.length > 0) {
          const match = allLeads.find((l: any) => l.id === reportId || l.id?.includes(reportId));
          if (match && isMounted) {
            setLead(match);
            setIsLoading(false);
            return;
          }
        }

        if (!localData && isMounted) {
          setError('Relatório não encontrado no banco de dados. Verifique o ID digitado ou o link acessado.');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('Error fetching public report:', err);
        const directLead = await fetchSingleLeadDirectFromSupabase(reportId);
        if (directLead && isMounted) {
          setLead(directLead);
          setIsLoading(false);
        } else if (localData && isMounted) {
          setLead(localData);
          setIsLoading(false);
        } else if (isMounted) {
          setError('Não foi possível carregar o relatório no momento. Tente novamente mais tarde.');
          setIsLoading(false);
        }
      }
    }

    if (reportId) {
      loadReport();
    } else {
      setIsLoading(false);
      setError('ID de relatório inválido.');
    }

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  const handleCopyShareLink = () => {
    const fullUrl = `${window.location.origin}/?relatorio=${encodeURIComponent(reportId)}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyTextReport = () => {
    if (!lead) return;
    const formatted = formatFullReportText(lead, lead.diagnostic);
    navigator.clipboard.writeText(formatted);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-slate-400 font-medium text-sm">Buscando diagnóstico no banco de dados Supabase...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl text-red-400 max-w-md w-full space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-red-500" />
          <h2 className="text-lg font-bold text-slate-100">Relatório Não Encontrado</h2>
          <p className="text-xs text-slate-300">{error || 'Não foi possível encontrar este relatório no sistema.'}</p>
        </div>
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Fazer Novo Diagnóstico</span>
          </button>
        )}
      </div>
    );
  }

  // Helper to safely parse and fill diagnostic data
  const rawDiag = typeof lead.diagnostic === 'string' ? (() => {
    try { return JSON.parse(lead.diagnostic); } catch (e) { return null; }
  })() : lead.diagnostic;

  const resolvedDiagnostic = {
    analiseSetor: rawDiag?.analiseSetor || `Análise estratégica personalizada para o setor de ${lead.atividadePrincipal || 'serviços'} focada em solucionar o desafio de ${lead.principalDesafio || 'atração e retenção de clientes'}.`,
    pontosFortes: Array.isArray(rawDiag?.pontosFortes) && rawDiag.pontosFortes.length > 0
      ? rawDiag.pontosFortes
      : [
          'Agilidade no atendimento e proximidade com clientes',
          'Flexibilidade para implementação rápida de estratégias digitais'
        ],
    oportunidades: Array.isArray(rawDiag?.oportunidades) && rawDiag.oportunidades.length > 0
      ? rawDiag.oportunidades
      : [
          'Otimização da presença no Google Meu Negócio e buscas locais',
          'Funil automatizado de atração e conversão via WhatsApp'
        ],
    planoAcao: Array.isArray(rawDiag?.planoAcao) && rawDiag.planoAcao.length > 0
      ? rawDiag.planoAcao
      : [
          '1. Padronizar a mensagem de saudação e catálogo no WhatsApp',
          '2. Criar oferta direta de diagnóstico inicial gratuito para novos leads',
          '3. Estruturar anúncios direcionados para sua região de atuação'
        ],
    resumoWhatsapp: rawDiag?.resumoWhatsapp || `Olá ${lead.nome || ''}! Fiz o diagnóstico para a empresa ${lead.empresa || ''}. Podemos conversar sobre as oportunidades?`
  };

  const companyWhatsapp = '5511994637159';
  const reportText = formatFullReportText(lead, resolvedDiagnostic);
  const whatsappUrl = `https://wa.me/${companyWhatsapp}?text=${encodeURIComponent(reportText)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white pb-16">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="px-3 py-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-slate-700/60"
                title="Voltar ao Relatório / Diagnóstico"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                Curtatchê Insights
              </span>
              <h1 className="text-sm font-bold text-slate-100">Relatório Web de Diagnóstico Estratégico</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNewDiagnostic && (
              <button
                onClick={onNewDiagnostic}
                className="hidden md:inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700"
              >
                <span>Novo Diagnóstico</span>
              </button>
            )}

            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copiado!' : 'Compartilhar Link Web'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 mt-4">
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DIAGNÓSTICO DIGITAL DE IA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {lead.empresa || 'Projeto Comercial'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Relatório gerado exclusivamente para <strong className="text-slate-200">{lead.nome}</strong> via inteligência de mercado Curtatchê Insights.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 shrink-0">
              <div className="text-slate-400 text-[11px] font-mono">ID do Relatório:</div>
              <div className="font-mono text-blue-300 font-bold select-all bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {lead.id}
              </div>
              <div className="text-[11px] text-slate-500">
                Data: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          {/* Business Lead Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-400" /> Empreendedor
              </span>
              <span className="font-semibold text-slate-200 truncate block">{lead.nome || 'N/A'}</span>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp
              </span>
              <span className="font-semibold text-slate-200 truncate block">{lead.whatsapp || 'N/A'}</span>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1 flex items-center gap-1">
                <Instagram className="w-3 h-3 text-pink-400" /> Instagram
              </span>
              <span className="font-semibold text-slate-200 truncate block">{lead.instagram || 'Não informado'}</span>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[11px] mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-400" /> Site / Link
              </span>
              <span className="font-semibold text-slate-200 truncate block">{lead.site || 'Não informado'}</span>
            </div>
          </div>
        </div>

        {/* Survey Inputs Mapping */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" />
            Mapeamento do Negócio & Desafios
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Setor / Atividade Principal:</span>
              <span className="font-bold text-slate-100">{lead.atividadePrincipal || 'Serviços'}</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Faturamento Estimado:</span>
              <span className="font-bold text-slate-100">{lead.faturamentoMensal || 'Não informado'}</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Principal Desafio Atual:</span>
              <span className="font-bold text-amber-400">{lead.principalDesafio || 'Atração de clientes'}</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Results Content */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Diagnóstico e Plano de Ação Estratégico
                </h3>
                <p className="text-xs text-slate-400">Análise contextual do setor e direcionamento prático</p>
              </div>
            </div>
          </div>

          {/* Sector Analysis */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Análise Conjuntural do Setor
            </h4>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 text-sm leading-relaxed text-slate-300">
              {resolvedDiagnostic.analiseSetor}
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Pontos Fortes Identificados
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resolvedDiagnostic.pontosFortes.map((pf: string, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pf}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Oportunidades de Crescimento Rápido
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resolvedDiagnostic.oportunidades.map((op: string, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{op}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Plano de Ação Recomendado (Etapa a Etapa)
            </h4>
            <div className="space-y-3">
              {resolvedDiagnostic.planoAcao.map((step: string, idx: number) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3.5 text-xs text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="pt-0.5 leading-relaxed">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 text-center">
          <h3 className="text-sm font-bold text-slate-200">Ações para este Relatório Web</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleCopyShareLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3.5 rounded-xl transition-all active:scale-95 text-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Web do Relatório'}</span>
            </button>

            <button
              onClick={handleCopyTextReport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-3.5 rounded-xl border border-slate-700 transition-all active:scale-95 text-sm"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? 'Texto Copiado!' : 'Copiar Texto Completo'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <footer className="text-center text-xs text-slate-500 pt-4 border-t border-slate-900 space-y-1">
          <p className="font-semibold text-slate-400">Curtatchê Insights • Inteligência de Mercado para Empreendedores</p>
          <p>WhatsApp Atendimento: (11) 99463-7159</p>
        </footer>
      </main>
    </div>
  );
};
