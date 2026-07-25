import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  canGoBack: boolean;
  onGoBack: () => void;
  onOpenImageLinks?: () => void;
  onOpenLeads?: () => void;
  leadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  progressPercent,
  canGoBack,
  onGoBack,
}) => {
  return (
    <>
      {/* Top Fixed Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 dark:bg-slate-800 z-[70] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-16 shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-6 max-w-4xl mx-auto h-full">
          {/* Left Side: Back button + Brand Title */}
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button
                onClick={onGoBack}
                className="p-2 -ml-2 rounded-full text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                title="Voltar etapa"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                Market Insights
              </span>
            </div>
          </div>

          {/* Right Side: Step counter */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Step Badge */}
            <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              {currentStep <= totalSteps ? (
                <span>Etapa {currentStep} de {totalSteps}</span>
              ) : (
                <span className="text-emerald-600 font-bold">Concluído</span>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
