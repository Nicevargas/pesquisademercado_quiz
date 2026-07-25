export interface QuestionOption {
  id: string;
  label: string;
  icon: string; // Lucide icon name or Material Symbol name
}

export interface Question {
  id: number;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}

export interface LeadFormData {
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
}

export interface QuizAnswers {
  atividadePrincipal?: string;
  faturamentoMensal?: string;
  principalDesafio?: string;
  canaisMarketing?: string;
}

export interface SubmissionData extends LeadFormData, QuizAnswers {
  id: string;
  createdAt: string;
  diagnosticSummary?: string;
}

export interface DiagnosticResult {
  analiseSetor: string;
  pontosFortes: string[];
  oportunidades: string[];
  planoAcao: string[];
  resumoWhatsapp: string;
}

export interface ImageAssetInfo {
  id: string;
  name: string;
  url: string;
  description: string;
  aspectRatio: string;
}
