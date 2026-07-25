import { Question } from '../types';

export const quizQuestions: Question[] = [
  {
    id: 1,
    title: 'Qual é sua atividade principal?',
    subtitle: 'Selecione o setor que melhor representa seu negócio ou atuação profissional.',
    options: [
      { id: 'comercio', label: 'Comércio', icon: 'store' },
      { id: 'servicos', label: 'Prestação de Serviços', icon: 'wrench' },
      { id: 'liberal', label: 'Profissional Liberal', icon: 'briefcase' },
      { id: 'turismo', label: 'Turismo', icon: 'plane' },
      { id: 'alimentacao', label: 'Alimentação', icon: 'utensils' },
      { id: 'saude', label: 'Saúde', icon: 'heart-pulse' },
      { id: 'beleza', label: 'Beleza', icon: 'scissors' },
      { id: 'imobiliaria', label: 'Imobiliária', icon: 'building-2' },
      { id: 'construcao', label: 'Construção', icon: 'hard-hat' },
      { id: 'outro', label: 'Outro', icon: 'more-horizontal' },
    ],
  },
  {
    id: 2,
    title: 'Qual o faturamento mensal estimado do seu negócio?',
    subtitle: 'Essas informações ajudam a identificar o estágio atual de maturidade comercial.',
    options: [
      { id: 'fat_10k', label: 'Até R$ 10.000 / mês', icon: 'trending-up' },
      { id: 'fat_50k', label: 'R$ 10.000 a R$ 50.000 / mês', icon: 'bar-chart-3' },
      { id: 'fat_200k', label: 'R$ 50.000 a R$ 200.000 / mês', icon: 'pie-chart' },
      { id: 'fat_plus', label: 'Acima de R$ 200.000 / mês', icon: 'award' },
    ],
  },
  {
    id: 3,
    title: 'Qual é o seu principal desafio hoje?',
    subtitle: 'Escolha a maior dificuldade que impede o crescimento acelerado da sua empresa.',
    options: [
      { id: 'novos_clientes', label: 'Atrair novos clientes com previsibilidade', icon: 'target' },
      { id: 'presenca_digital', label: 'Melhorar presença digital e posicionamento', icon: 'globe' },
      { id: 'aumentar_vendas', label: 'Aumentar a taxa de conversão e faturamento', icon: 'dollar-sign' },
      { id: 'fidelizar', label: 'Fidelizar clientes e incentivar recompras', icon: 'users' },
      { id: 'automatizacao', label: 'Automatizar atendimento e processos de vendas', icon: 'cpu' },
    ],
  },
  {
    id: 4,
    title: 'Quais canais de marketing você utiliza atualmente?',
    subtitle: 'Selecione o canal principal onde você capta ou se relaciona com potenciais clientes.',
    options: [
      { id: 'redes_sociais', label: 'Instagram e Facebook orgânico', icon: 'share-2' },
      { id: 'anuncios', label: 'Anúncios pagos (Google Ads, Meta Ads)', icon: 'zap' },
      { id: 'indicacao', label: 'Indicação e boca a boca', icon: 'message-square' },
      { id: 'whatsapp_biz', label: 'WhatsApp e listas diretas', icon: 'phone-call' },
      { id: 'nenhum', label: 'Nenhuma estratégia estruturada ainda', icon: 'help-circle' },
    ],
  },
];
