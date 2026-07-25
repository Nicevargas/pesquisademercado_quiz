import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  saveLeadToSupabase,
  fetchLeadsFromSupabase,
  updateLeadDiagnosticInSupabase,
  getSupabaseClient
} from "./src/lib/supabaseServer.ts";

dotenv.config();

interface LeadPayload {
  id?: string;
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  atividadePrincipal?: string;
  faturamentoMensal?: string;
  principalDesafio?: string;
  canaisMarketing?: string;
}

interface StoredLead extends LeadPayload {
  id: string;
  createdAt: string;
  diagnostic?: any;
}

const leadsDatabase: StoredLead[] = [];

// Initialize Gemini AI Client lazily or when API key is available
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    const isSupabaseConfigured = Boolean(getSupabaseClient());
    res.json({
      status: "ok",
      supabase: isSupabaseConfigured ? "connected" : "not_configured",
      timestamp: new Date().toISOString()
    });
  });

  // Get all captured leads (from Supabase if available, or memory)
  app.get("/api/leads", async (req, res) => {
    try {
      const supabaseLeads = await fetchLeadsFromSupabase();
      if (supabaseLeads) {
        return res.json({
          success: true,
          source: "supabase",
          count: supabaseLeads.length,
          leads: supabaseLeads
        });
      }
    } catch (e) {
      console.warn("Supabase fetch fallback to local memory:", e);
    }

    res.json({
      success: true,
      source: "memory",
      count: leadsDatabase.length,
      leads: leadsDatabase
    });
  });

  // Submit new lead survey
  app.post("/api/leads", async (req, res) => {
    try {
      const payload: LeadPayload = req.body;
      const newLead: StoredLead = {
        ...payload,
        id: payload.id || `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      // Always save to memory
      leadsDatabase.unshift(newLead);

      // Attempt to save to Supabase
      const supabaseResult = await saveLeadToSupabase(newLead);

      res.json({
        success: true,
        lead: newLead,
        supabaseSynced: Boolean(supabaseResult)
      });
    } catch (err: any) {
      console.error("Error saving lead:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to save lead." });
    }
  });

  // Generate Real AI Diagnostic via Gemini & save to Supabase
  app.post("/api/diagnostico", async (req, res) => {
    try {
      const { id, atividadePrincipal, faturamentoMensal, principalDesafio, canaisMarketing, nome, empresa } = req.body;

      const ai = getGeminiClient();

      const prompt = `
Você é um consultor de inteligência de mercado sênior especialista em pequenos negócios, startups e empreendedores (Tchê Tech Insights).
Análise os dados fornecidos pelo empreendedor:
- Nome do Empreendedor: ${nome || 'Empreendedor'}
- Empresa / Projeto: ${empresa || 'Negócio local'}
- Setor / Atividade: ${atividadePrincipal || 'Serviços'}
- Faturamento Estimado: ${faturamentoMensal || 'Não informado'}
- Principal Desafio: ${principalDesafio || 'Atrair mais clientes'}
- Canais de Marketing Usados: ${canaisMarketing || 'Instagram/Redes Sociais'}

Gere um diagnóstico de mercado estruturado em formato JSON rigoroso contendo:
1. "analiseSetor": Texto curto (2-3 frases) analisando a conjuntura do setor dele.
2. "pontosFortes": Array de 2 a 3 pontos fortes ou vantagens competitivas identificadas.
3. "oportunidades": Array de 2 a 3 oportunidades claras de crescimento rápido no digital.
4. "planoAcao": Array de 3 ações práticas ordenadas (Etapa 1, Etapa 2, Etapa 3).
5. "resumoWhatsapp": Mensagem amigável de 2 frases para envio direto por WhatsApp oferecendo o plano completo.

Responda SOMENTE em JSON válido sem marcação de código extra.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "{}";
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = {
          analiseSetor: `Análise personalizada para o setor de ${atividadePrincipal || 'serviços'} focada em superar o desafio de ${principalDesafio || 'atração de clientes'}.`,
          pontosFortes: [
            "Atuação direta com demanda real de mercado",
            "Flexibilidade para implementação rápida de novidades digitais"
          ],
          oportunidades: [
            "Otimização da presença na busca local (Google Meu Negócio)",
            "Funil de captação de leads direto pelo WhatsApp"
          ],
          planoAcao: [
            "1. Padronizar o atendimento inicial com mensagens automáticas",
            "2. Criar oferta irresistível de diagnóstico inicial gratuito",
            "3. Estruturar anúncios direcionados para a sua região"
          ],
          resumoWhatsapp: `Olá ${nome || ''}! Fiz seu diagnóstico do projeto ${empresa || ''} no setor de ${atividadePrincipal || 'mercado'}. Podemos conversar sobre o plano de ação?`
        };
      }

      // Update lead with diagnostic in local memory
      if (id) {
        const found = leadsDatabase.find(l => l.id === id);
        if (found) {
          found.diagnostic = parsed;
        }
        // Update in Supabase
        await updateLeadDiagnosticInSupabase(id, parsed);
      }

      res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const fallback = {
        analiseSetor: "Análise estratégica gerada com foco no crescimento sustentável do seu negócio e consolidação de marca no mercado local.",
        pontosFortes: [
          "Presença ativa no segmento com alto potencial de recomendação",
          "Agilidade na tomada de decisão em comparação a grandes concorrentes"
        ],
        oportunidades: [
          "Automação do funil de WhatsApp para dobrar a taxa de resposta",
          "Investimento em tráfego pago geolocalizado com foco em conversão"
        ],
        planoAcao: [
          "Etapa 1: Estruturar catálogo de serviços/produtos com foco no carro-chefe",
          "Etapa 2: Implementar canal ativo de vendas e captação diária de leads",
          "Etapa 3: Monitorar métricas de conversão e custo de aquisição"
        ],
        resumoWhatsapp: "Olá! Acabei de gerar o diagnóstico completo para o seu projeto. Vamos conversar sobre as oportunidades?"
      };

      if (req.body.id) {
        await updateLeadDiagnosticInSupabase(req.body.id, fallback);
      }

      res.json({ success: true, data: fallback });
    }
  });

  // Direct Image Links Registry Endpoint
  app.get("/api/images", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || `localhost:${PORT}`;
    const baseUrl = `${protocol}://${host}`;

    const registeredImages = [
      {
        id: "tche_logo",
        name: "Logo Tchê Tech Insights",
        filename: "tche_logo_1784945402070.jpg",
        directUrl: `${baseUrl}/src/assets/images/tche_logo_1784945402070.jpg`,
        relativeUrl: "/src/assets/images/tche_logo_1784945402070.jpg",
        htmlTag: `<img src="${baseUrl}/src/assets/images/tche_logo_1784945402070.jpg" alt="Tchê Tech Insights Logo" referrerPolicy="no-referrer" />`,
        description: "Logotipo 3D metálico oficial em alta definição"
      },
      {
        id: "office_workspace",
        name: "Banner Workspace Market Insights",
        filename: "office_workspace_1784945414869.jpg",
        directUrl: `${baseUrl}/src/assets/images/office_workspace_1784945414869.jpg`,
        relativeUrl: "/src/assets/images/office_workspace_1784945414869.jpg",
        htmlTag: `<img src="${baseUrl}/src/assets/images/office_workspace_1784945414869.jpg" alt="Market Insights Workspace" referrerPolicy="no-referrer" />`,
        description: "Ambiente de alta tecnologia para relatório final de diagnóstico"
      }
    ];

    res.json({ success: true, baseUrl, images: registeredImages });
  });

  // Vite development middleware vs production static bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
