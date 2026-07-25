import React, { useEffect, useRef, useState } from 'react';
import { LeadFormData, QuizAnswers, DiagnosticResult } from '../types';
import { CheckCircle2, MessageCircle, ShieldCheck, Cpu, Rocket, Sparkles, Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface SuccessViewProps {
  lead: LeadFormData;
  answers: QuizAnswers;
  diagnostic: DiagnosticResult | null;
  isLoadingDiagnostic: boolean;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  lead,
  answers,
  diagnostic,
  isLoadingDiagnostic,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Confetti effect on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 3 + 2,
      color: ['#2563EB', '#7C3AED', '#60A5FA', '#34D399', '#F59E0B'][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3,
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.y += p.speed;
        p.rotation += p.rotationSpeed;
        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const companyWhatsapp = '5511994637159';
  const whatsappMessage = encodeURIComponent(
    `Olá! Sou ${lead.nome} da empresa ${lead.empresa}.\n\n` +
    `Acabei de preencher a pesquisa Market Insights no site e gostaria de receber o meu diagnóstico de mercado detalhado!` +
    (lead.instagram ? `\nInstagram: ${lead.instagram}` : '') +
    (lead.site ? `\nSite: ${lead.site}` : '')
  );

  const whatsappUrl = `https://wa.me/${companyWhatsapp}?text=${whatsappMessage}`;

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 18;

      // Header Brand Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('TCHÊ TECH INSIGHTS', 15, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Relatório & Diagnóstico Estratégico de Mercado', 15, 19);

      const today = new Date().toLocaleDateString('pt-BR');
      doc.setFontSize(8.5);
      doc.text(`Data: ${today}`, pageWidth - 15, 19, { align: 'right' });

      y = 36;

      // Section 1: Perfil do Empreendedor
      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(15, y, pageWidth - 30, 36, 2, 2, 'F');

      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. Informações do Negócio', 20, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      doc.text(`Empreendedor: ${lead.nome || 'N/I'}`, 20, y + 16);
      doc.text(`Empresa / Projeto: ${lead.empresa || 'N/I'}`, 20, y + 22);
      doc.text(`E-mail: ${lead.email || 'N/I'}`, 20, y + 28);

      doc.text(`WhatsApp: ${lead.whatsapp || 'N/I'}`, 110, y + 16);
      doc.text(`Instagram: ${lead.instagram || 'Não informado'}`, 110, y + 22);
      doc.text(`Site: ${lead.site || 'Não informado'}`, 110, y + 28);

      y += 44;

      // Section 2: Resumo da Pesquisa
      if (answers.atividadePrincipal || answers.faturamentoMensal || answers.principalDesafio) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text('2. Mapeamento de Mercado', 15, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        if (answers.atividadePrincipal) {
          doc.text(`• Setor / Atividade Principal: ${answers.atividadePrincipal}`, 18, y);
          y += 5;
        }
        if (answers.faturamentoMensal) {
          doc.text(`• Faturamento Mensal Estimado: ${answers.faturamentoMensal}`, 18, y);
          y += 5;
        }
        if (answers.principalDesafio) {
          doc.text(`• Principal Desafio Atual: ${answers.principalDesafio}`, 18, y);
          y += 5;
        }
        if (answers.canaisMarketing && answers.canaisMarketing.length > 0) {
          doc.text(`• Canais de Divulgação Utilizados: ${answers.canaisMarketing.join(', ')}`, 18, y);
          y += 5;
        }
        y += 4;
      }

      // Section 3: AI Diagnostic
      if (diagnostic) {
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(15, y, pageWidth - 30, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('3. Diagnóstico Estratégico de IA (Tchê Tech Insights)', 18, y + 5.5);

        y += 14;

        // Análise do setor
        doc.setTextColor(37, 99, 235); // blue-600
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text('Análise Conjuntural do Setor:', 15, y);
        y += 5;

        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const splitAnalise = doc.splitTextToSize(diagnostic.analiseSetor, pageWidth - 30);
        doc.text(splitAnalise, 15, y);
        y += splitAnalise.length * 4.2 + 4;

        // Check for page overflow
        if (y > pageHeight - 60) {
          doc.addPage();
          y = 20;
        }

        // Pontos Fortes
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(16, 185, 129); // emerald-600
        doc.text('Pontos Fortes Identificados:', 15, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        diagnostic.pontosFortes.forEach((pf) => {
          const splitPf = doc.splitTextToSize(`• ${pf}`, pageWidth - 30);
          doc.text(splitPf, 15, y);
          y += splitPf.length * 4.2;
        });

        y += 3;
        if (y > pageHeight - 50) {
          doc.addPage();
          y = 20;
        }

        // Oportunidades
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(147, 51, 234); // purple-600
        doc.text('Oportunidades de Crescimento:', 15, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        diagnostic.oportunidades.forEach((op) => {
          const splitOp = doc.splitTextToSize(`• ${op}`, pageWidth - 30);
          doc.text(splitOp, 15, y);
          y += splitOp.length * 4.2;
        });

        y += 4;
        if (y > pageHeight - 50) {
          doc.addPage();
          y = 20;
        }

        // Plano de Ação
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(37, 99, 235);
        doc.text('Plano de Ação Recomendado:', 15, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        diagnostic.planoAcao.forEach((acao, idx) => {
          const splitAcao = doc.splitTextToSize(`${idx + 1}. ${acao}`, pageWidth - 30);
          doc.text(splitAcao, 15, y);
          y += splitAcao.length * 4.2;
        });
      }

      // Footer
      const footerY = pageHeight - 12;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, footerY - 4, pageWidth - 15, footerY - 4);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Tchê Tech Insights • WhatsApp: (11) 99463-7159', 15, footerY);
      doc.text('Relatório gerado em formato PDF', pageWidth - 15, footerY, { align: 'right' });

      // Save PDF
      const sanitizedCompany = (lead.empresa || 'empresa').toLowerCase().replace(/[^a-z0-9]/g, '_');
      doc.save(`Diagnostico_Estrategico_${sanitizedCompany}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
      {/* Confetti Background Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]" />

      {/* Success Hero Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 sm:p-10 text-center border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-full" />

        {/* Animated Checkmark Badge */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center relative animate-bounce">
            <div className="absolute inset-0 rounded-full border-2 border-blue-600/30 scale-125 opacity-50" />
            <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
          Parabéns! Sua pesquisa foi enviada com sucesso.
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8">
          Em breve nossa equipe analisará suas respostas. Se você solicitou o diagnóstico gratuito, entraremos em contato pelo WhatsApp.
        </p>

        {/* WhatsApp & PDF Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-95 text-sm sm:text-base"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>QUERO RECEBER MEU DIAGNÓSTICO</span>
          </a>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 transition-all duration-200 active:scale-95 text-sm sm:text-base disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
            <span>{isGeneratingPdf ? 'Gerando PDF...' : 'Baixar Diagnóstico em PDF'}</span>
          </button>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-3">
          Atendimento via WhatsApp: (11) 99463-7159 • Resposta em até 24h
        </span>
      </div>

      {/* AI Market Diagnostic Generated Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg text-slate-100">
              Diagnóstico Preliminar IA (Tchê Tech Insights)
            </h3>
          </div>
          <span className="text-xs font-semibold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-800/50">
            Gerado ao vivo
          </span>
        </div>

        {isLoadingDiagnostic ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Analisando respostas do seu setor com IA...</p>
          </div>
        ) : diagnostic ? (
          <div className="space-y-6 text-sm text-slate-300">
            {/* Sector Analysis */}
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <h4 className="font-semibold text-blue-400 text-xs uppercase tracking-wider mb-1">
                Análise do Setor ({answers.atividadePrincipal || 'Sua Área'})
              </h4>
              <p className="text-slate-200 leading-relaxed">{diagnostic.analiseSetor}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                  Pontos Fortes Identificados
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300">
                  {diagnostic.pontosFortes.map((pf, i) => (
                    <li key={i}>{pf}</li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                <h4 className="font-semibold text-purple-400 text-xs uppercase tracking-wider">
                  Oportunidades de Crescimento
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-300">
                  {diagnostic.oportunidades.map((op, i) => (
                    <li key={i}>{op}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-900/50 space-y-2">
              <h4 className="font-semibold text-blue-300 text-xs uppercase tracking-wider">
                Plano de Ação Recomendado
              </h4>
              <div className="space-y-2 text-xs">
                {diagnostic.planoAcao.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-slate-200">
                    <span className="bg-blue-600 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick PDF Export inside Card */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>Baixar Diagnóstico em PDF</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Trust Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 w-fit text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dados Protegidos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Suas informações estão seguras conosco seguindo rigorosamente a LGPD.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 w-fit text-blue-600 dark:text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Análise Humana & IA</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            A combinação entre diagnósticos inteligentes por IA e curadoria de especialistas.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 w-fit text-emerald-600 dark:text-emerald-400">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Próximos Passos</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Fique atento ao seu WhatsApp e e-mail para receber o material complementar.
          </p>
        </div>
      </div>

      {/* Visual Workspace Banner Section */}
      <div className="rounded-2xl overflow-hidden relative h-64 sm:h-72 shadow-lg border border-slate-200/80 dark:border-slate-800 group">
        <img
          src="/src/assets/images/office_workspace_1784945414869.jpg"
          alt="High tech office workspace for market insights"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
          <div className="text-white">
            <h4 className="font-bold text-lg sm:text-xl">Sua jornada empreendedora começa aqui.</h4>
            <p className="text-xs sm:text-sm text-slate-200 opacity-90">
              Estamos prontos para impulsionar o seu negócio no mercado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
