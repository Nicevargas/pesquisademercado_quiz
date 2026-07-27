export function formatFullReportText(lead: any, diagnostic: any): string {
  if (!diagnostic) {
    return `*Curtatchê Insights - Diagnóstico Estratégico*\n\n` +
      `👤 *Empreendedor:* ${lead.nome || 'N/A'}\n` +
      `🏢 *Empresa:* ${lead.empresa || 'N/A'}\n` +
      `📱 *WhatsApp:* ${lead.whatsapp || 'N/A'}\n\n` +
      `Olá ${lead.nome}! Seu formulário foi recebido e seu relatório está em processamento.`;
  }

  const pontos = (diagnostic.pontosFortes || []).map((p: string) => `  ✅ ${p}`).join('\n');
  const oportunidades = (diagnostic.oportunidades || []).map((o: string) => `  🚀 ${o}`).join('\n');
  const plano = (diagnostic.planoAcao || []).map((a: string, i: number) => `  ${i + 1}️⃣ ${a}`).join('\n');

  return `📊 *RELATÓRIO DE DIAGNÓSTICO ESTRATÉGICO DE MERCADO*\n` +
    `*Curtatchê Insights*\n` +
    `───────────────────────────────\n\n` +
    `👤 *Cliente:* ${lead.nome || 'N/A'}\n` +
    `🏢 *Empresa:* ${lead.empresa || 'N/A'}\n` +
    (lead.instagram ? `📸 *Instagram:* ${lead.instagram}\n` : '') +
    (lead.site ? `🌐 *Site:* ${lead.site}\n` : '') +
    `🎯 *Setor:* ${lead.atividadePrincipal || 'Serviços'}\n` +
    `💰 *Faturamento Estimado:* ${lead.faturamentoMensal || 'Não informado'}\n` +
    `⚠️ *Desafio Principal:* ${lead.principalDesafio || 'Atração de clientes'}\n\n` +
    `🔍 *ANÁLISE DO SETOR:*\n${diagnostic.analiseSetor || 'Análise de mercado realizada com IA.'}\n\n` +
    `💪 *PONTOS FORTES:*\n${pontos || '  ✅ Atuação focada em mercado ativo'}\n\n` +
    `🚀 *OPORTUNIDADES DE CRESCIMENTO:*\n${oportunidades || '  🚀 Presença digital com automação'}\n\n` +
    `📋 *PLANO DE AÇÃO RECOMENDADO:*\n${plano || '  1️⃣ Alinhar presença digital'}\n\n` +
    `───────────────────────────────\n` +
    `💬 *Mensagem para Atendimento:* ${diagnostic.resumoWhatsapp || 'Vamos agendar nossa reunião de alinhamento!'}`;
}

export async function triggerAutoWebhookSend(lead: any, diagnostic: any) {
  const metaEnv = (import.meta as any).env || {};
  const webhookUrl = process.env?.WEBHOOK_URL || metaEnv.VITE_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false, reason: 'NO_WEBHOOK_URL' };

  try {
    const payload = {
      event: 'DIAGNOSTIC_COMPLETED',
      timestamp: new Date().toISOString(),
      lead: {
        id: lead.id,
        nome: lead.nome,
        empresa: lead.empresa,
        whatsapp: lead.whatsapp,
        email: lead.email,
        instagram: lead.instagram,
        site: lead.site,
        atividadePrincipal: lead.atividadePrincipal,
        faturamentoMensal: lead.faturamentoMensal,
        principalDesafio: lead.principalDesafio,
      },
      diagnostic,
      formattedReportText: formatFullReportText(lead, diagnostic),
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return { sent: res.ok, status: res.status };
  } catch (err: any) {
    console.warn('Auto webhook dispatch failed:', err);
    return { sent: false, error: err?.message };
  }
}
