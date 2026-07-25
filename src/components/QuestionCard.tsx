import React from 'react';
import { Question, QuestionOption } from '../types';
import {
  Store,
  Wrench,
  Briefcase,
  Plane,
  Utensils,
  HeartPulse,
  Scissors,
  Building2,
  HardHat,
  MoreHorizontal,
  TrendingUp,
  BarChart3,
  PieChart,
  Award,
  Target,
  Globe,
  DollarSign,
  Users,
  Cpu,
  Share2,
  Zap,
  MessageSquare,
  PhoneCall,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  onSelectOption: (option: QuestionOption) => void;
}

// Icon Mapping dictionary
const iconMap: Record<string, React.ElementType> = {
  store: Store,
  wrench: Wrench,
  briefcase: Briefcase,
  plane: Plane,
  utensils: Utensils,
  'heart-pulse': HeartPulse,
  scissors: Scissors,
  'building-2': Building2,
  'hard-hat': HardHat,
  'more-horizontal': MoreHorizontal,
  'trending-up': TrendingUp,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  award: Award,
  target: Target,
  globe: Globe,
  'dollar-sign': DollarSign,
  users: Users,
  cpu: Cpu,
  'share-2': Share2,
  zap: Zap,
  'message-square': MessageSquare,
  'phone-call': PhoneCall,
  'help-circle': HelpCircle,
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptionId,
  onSelectOption,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full inline-block border border-blue-200/50 dark:border-blue-800/50">
          Pergunta 0{question.id}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {question.title}
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-400">
          {question.subtitle}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
        {question.options.map((opt) => {
          const IconComp = iconMap[opt.icon] || Store;
          const isSelected = selectedOptionId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              className={`group flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 focus:outline-none cursor-pointer border ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-600/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:-translate-y-0.5'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-slate-700 group-hover:text-blue-600'
                }`}
              >
                <IconComp className="w-5 h-5" />
              </div>

              <span
                className={`font-semibold text-sm sm:text-base flex-grow ${
                  isSelected
                    ? 'text-blue-900 dark:text-blue-200'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {opt.label}
              </span>

              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
