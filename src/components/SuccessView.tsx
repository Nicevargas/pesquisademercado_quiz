import React, { useEffect, useRef } from 'react';
import { LeadFormData, QuizAnswers, DiagnosticResult } from '../types';
import { CheckCircle2, MessageCircle, ShieldCheck, Cpu, Rocket, Sparkles } from 'lucide-react';

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

        {/* WhatsApp Call To Action Button */}
        <div className="flex flex-col items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-95 text-base"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>QUERO RECEBER MEU DIAGNÓSTICO</span>
          </a>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Atendimento via WhatsApp: (11) 99463-7159 • Resposta em até 24h
          </span>
        </div>
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
