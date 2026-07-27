import React, { useState, useEffect } from 'react';
import { quizQuestions } from './data/questions';
import { QuestionOption, LeadFormData, QuizAnswers, DiagnosticResult, SubmissionData } from './types';
import { Header } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { LeadForm } from './components/LeadForm';
import { SuccessView } from './components/SuccessView';
import { LeadsDashboard } from './components/LeadsDashboard';
import { PublicReportPage } from './components/PublicReportPage';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { saveLeadDirectToSupabase, fetchLeadsDirectFromSupabase } from './lib/supabaseClient';

export default function App() {
  // Check if URL has ?relatorio=ID or ?id=ID or hash #relatorio/ID
  const getUrlReportId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('relatorio') || urlParams.get('id');
    if (paramId) return paramId;

    if (window.location.hash.startsWith('#relatorio/')) {
      return window.location.hash.replace('#relatorio/', '');
    }
    return null;
  };

  const [publicReportId, setPublicReportId] = useState<string | null>(getUrlReportId());

  // Navigation Steps:
  // 1..4 = Quiz Questions (1-4)
  // 5    = Lead Form Capture ("Etapa Final")
  // 6    = Success View & AI Diagnostic
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    const handlePopState = () => {
      setPublicReportId(getUrlReportId());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // User Selections
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [selectedOptionsByStep, setSelectedOptionsByStep] = useState<Record<number, string>>({});

  // Lead Form Data & Result
  const [leadData, setLeadData] = useState<LeadFormData | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isLoadingDiagnostic, setIsLoadingDiagnostic] = useState<boolean>(false);

  // Modals state
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);
  const [leadCount, setLeadCount] = useState<number>(0);

  // Fetch count of captured leads
  const fetchLeadCount = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leads)) {
          setLeadCount(data.leads.length);
          return;
        }
      }
      // Fallback to direct client fetch
      const direct = await fetchLeadsDirectFromSupabase();
      if (direct) {
        setLeadCount(direct.length);
      }
    } catch (e) {
      const direct = await fetchLeadsDirectFromSupabase();
      if (direct) {
        setLeadCount(direct.length);
      }
    }
  };

  useEffect(() => {
    fetchLeadCount();
  }, []);

  // Total user steps (4 question steps + 1 final lead form step = 5)
  const TOTAL_STEPS = 5;

  // Calculate Progress Percent
  const progressPercent = Math.min(Math.round((currentStep / TOTAL_STEPS) * 100), 100);

  // Handle Option Select for Quiz Questions
  const handleSelectOption = (option: QuestionOption) => {
    const currentQuestion = quizQuestions[currentStep - 1];
    setSelectedOptionsByStep((prev) => ({ ...prev, [currentStep]: option.id }));

    // Update Quiz Answers
    setAnswers((prev) => {
      const updated = { ...prev };
      if (currentQuestion.id === 1) updated.atividadePrincipal = option.label;
      if (currentQuestion.id === 2) updated.faturamentoMensal = option.label;
      if (currentQuestion.id === 3) updated.principalDesafio = option.label;
      if (currentQuestion.id === 4) updated.canaisMarketing = option.label;
      return updated;
    });
  };

  // Next Step Action
  const handleNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Back Step Action
  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Lead Form Submission & AI Generation
  const handleLeadSubmit = async (data: LeadFormData) => {
    setIsSubmittingLead(true);
    setLeadData(data);

    const payload = {
      ...data,
      ...answers,
    };

    try {
      // 1. Dual save: Try backend API AND direct Supabase insert
      let apiSuccess = false;
      try {
        const apiRes = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          apiSuccess = Boolean(apiJson.supabaseSynced);
        }
      } catch (apiErr) {
        console.warn('Backend /api/leads failed or unreachable, relying on direct client Supabase sync:', apiErr);
      }

      // If API didn't sync to Supabase (e.g. pure Vercel static deployment or missing server env), save directly from browser
      if (!apiSuccess) {
        await saveLeadDirectToSupabase(payload);
      }

      fetchLeadCount();

      // 2. Advance to Success View
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 3. Request Real AI Diagnostic from Gemini
      setIsLoadingDiagnostic(true);
      try {
        const diagRes = await fetch('/api/diagnostico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (diagRes.ok) {
          const diagJson = await diagRes.json();
          if (diagJson.success && diagJson.data) {
            setDiagnostic(diagJson.data);
          }
        }
      } catch (diagErr) {
        console.warn('Diagnostic API call error:', diagErr);
      }
    } catch (err) {
      console.error('Error in submission flow:', err);
      setCurrentStep(6);
    } finally {
      setIsSubmittingLead(false);
      setIsLoadingDiagnostic(false);
    }
  };

  const isCurrentStepAnswered = currentStep <= 4 ? Boolean(selectedOptionsByStep[currentStep]) : true;

  if (publicReportId) {
    return (
      <PublicReportPage
        reportId={publicReportId}
        onBackToHome={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', window.location.pathname);
          }
          setPublicReportId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        progressPercent={progressPercent}
        canGoBack={currentStep > 1}
        onGoBack={handleGoBack}
        onOpenLeads={() => setIsLeadsModalOpen(true)}
        leadCount={leadCount}
      />

      {/* Main Container Workspace */}
      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-28 sm:pb-32">
        <div className="w-full max-w-4xl mx-auto">
          {/* Step 1 to 4: Quiz Questions */}
          {currentStep >= 1 && currentStep <= 4 && (
            <QuestionCard
              question={quizQuestions[currentStep - 1]}
              selectedOptionId={selectedOptionsByStep[currentStep]}
              onSelectOption={(option) => {
                handleSelectOption(option);
              }}
            />
          )}

          {/* Step 5: Lead Capture Form */}
          {currentStep === 5 && (
            <LeadForm onSubmit={handleLeadSubmit} isSubmitting={isSubmittingLead} />
          )}

          {/* Step 6: Success View & Diagnostic */}
          {currentStep === 6 && leadData && (
            <SuccessView
              lead={leadData}
              answers={answers}
              diagnostic={diagnostic}
              isLoadingDiagnostic={isLoadingDiagnostic}
            />
          )}
        </div>
      </main>

      {/* Footer Controls Bar (For Steps 1 to 4) */}
      {currentStep <= 4 && (
        <footer className="fixed bottom-0 left-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 h-20 shadow-lg">
          <div className="flex justify-between items-center px-4 sm:px-6 max-w-4xl mx-auto h-full">
            {/* Voltar button */}
            <button
              onClick={handleGoBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold text-sm disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            {/* Remaining Info */}
            <div className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {quizQuestions.length - currentStep} perguntas restantes
            </div>

            {/* Next / Continuar Button */}
            <button
              onClick={handleNextStep}
              disabled={!isCurrentStepAnswered}
              className={`flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer ${
                isCurrentStepAnswered
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}

      {/* Admin Leads Dashboard Modal */}
      <LeadsDashboard
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        leadCount={leadCount}
      />
    </div>
  );
}
