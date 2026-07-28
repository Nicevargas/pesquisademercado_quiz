import { GoogleGenAI } from '@google/genai';
import { updateLeadDiagnosticInSupabase } from '../src/lib/supabaseServer.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { id, atividadePrincipal, faturamentoMensal, principalDesafio, canaisMarketing, nome, empresa, instagram, site } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    let parsed: any = null;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
Você é um consultor de inteligência de mercado sênior especialista em pequenos negócios, startups e empreendedores (Curtatchê Insights).
Análise os dados fornecidos pelo empreendedor:
- Nome do Empreendedor: ${nome || 'Empreendedor'}
- Empresa / Projeto: ${empresa || 'Negócio local'}
- Instagram: ${instagram || 'Não informado'}
- Site / Link: ${site || 'Não informado'}
- Setor / Atividade: ${atividadePrincipal || 'Serviços'}
- Faturamento Estimado: ${faturamentoMensal || 'Não informado'}
- Principal Desafio: ${principalDesafio || 'Atrair mais clientes'}
- Canais de Marketing Usados: ${canaisMarketing || 'Instagram/Redes Sociais'}

Se o Instagram (${instagram}) ou o Site (${site}) forem informados, leve em consideração a maturidade da presença digital dele e faça recomendações específicas de posicionamento no Instagram/Site no plano de ação e oportunidades.

Gere um diagnóstico de mercado estruturado em formato JSON rigoroso contendo:
1. "analiseSetor": Texto curto (2-3 frases) analisando a conjuntura do setor dele.
2. "pontosFortes": Array de 2 a 3 pontos fortes ou vantagens competitivas identificadas.
3. "oportunidades": Array de 2 a 3 oportunidades claras de crescimento rápido no digital.
4. "planoAcao": Array de 3 ações práticas ordenadas (Etapa 1, Etapa 2, Etapa 3).
5. "resumoWhatsapp": Mensagem amigável de 2 frases para envio direto por WhatsApp oferecendo o plano completo.

Responda SOMENTE em JSON válido sem marcação de código extra.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const text = response.text || '{}';
        parsed = JSON.parse(text);
      } catch (geminiErr) {
        console.warn('Gemini call failed in Vercel function:', geminiErr);
      }
    }

    if (!parsed) {
      parsed = {
        analiseSetor: `Análise personalizada para o setor de ${atividadePrincipal || 'serviços'} focada em superar o desafio de ${principalDesafio || 'atração de clientes'}.`,
        pontosFortes: [
          'Atuação direta com demanda real de mercado',
          'Flexibilidade para implementação rápida de novidades digitais',
        ],
        oportunidades: [
          'Otimização da presença na busca local (Google Meu Negócio)',
          'Funil de captação de leads direto pelo WhatsApp',
        ],
        planoAcao: [
          '1. Padronizar o atendimento inicial com mensagens automáticas',
          '2. Criar oferta irresistível de diagnóstico inicial gratuito',
          '3. Estruturar anúncios direcionados para a sua região',
        ],
        resumoWhatsapp: `Olá ${nome || ''}! Fiz seu diagnóstico do projeto ${empresa || ''} no setor de ${atividadePrincipal || 'mercado'}. Podemos conversar sobre o plano de ação?`,
      };
    }

    if (id) {
      try {
        await updateLeadDiagnosticInSupabase(id, parsed);
      } catch (sbErr) {
        console.warn('Supabase update warning:', sbErr);
      }
    }

    return res.status(200).json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Vercel api/diagnostico POST error:', err);
    return res.status(200).json({
      success: true,
      data: {
        analiseSetor: 'Análise personalizada para o setor de serviços focada em otimização de vendas e atração de novos clientes.',
        pontosFortes: [
          'Atuação direta com demanda real de mercado',
          'Agilidade na oferta de soluções para clientes'
        ],
        oportunidades: [
          'Melhoria do posicionamento digital nas buscas locais',
          'Estruturação de funil direto de atendimento'
        ],
        planoAcao: [
          '1. Padronizar a recepção inicial do lead',
          '2. Oferecer diagnóstico de mercado direcionado',
          '3. Ampliar divulgação regional'
        ],
        resumoWhatsapp: 'Olá! Fiz o seu diagnóstico de mercado. Podemos conversar?'
      }
    });
  }
}
