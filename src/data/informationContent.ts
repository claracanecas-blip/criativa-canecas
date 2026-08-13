export const informationIconNames = ['Sparkles', 'PackageCheck', 'Coffee', 'ShieldCheck'] as const

export type InformationIconName = typeof informationIconNames[number]
export type InformationContentKind = 'card' | 'faq'
export type InformationContentStatus = 'draft' | 'published' | 'archived'

export interface PublicInformationContent {
  content_key: string
  kind: InformationContentKind
  title: string
  body: string
  icon_name: InformationIconName | null
  display_order: number
}

export const fallbackInformationContent: PublicInformationContent[] = [
  { content_key: 'card_personalization', kind: 'card', title: 'Personalização', body: 'Compartilhe a ideia e revise a prévia. A produção começa somente depois da confirmação combinada no atendimento.', icon_name: 'Sparkles', display_order: 10 },
  { content_key: 'card_production_delivery', kind: 'card', title: 'Produção e entrega', body: 'Prazo, disponibilidade, embalagem, forma de envio e custo de entrega são informados antes da confirmação.', icon_name: 'PackageCheck', display_order: 20 },
  { content_key: 'card_materials_care', kind: 'card', title: 'Materiais e cuidados', body: 'As características variam conforme o modelo. Use lavagem suave e confirme compatibilidade com micro-ondas/lava-louças no atendimento.', icon_name: 'Coffee', display_order: 30 },
  { content_key: 'card_service_rights', kind: 'card', title: 'Atendimento e direitos', body: 'Dúvidas, correções e solicitações pós-venda são tratadas pelo mesmo WhatsApp. Guarde as mensagens e a confirmação do pedido.', icon_name: 'ShieldCheck', display_order: 40 },
  { content_key: 'faq_personalization', kind: 'faq', title: 'Como funciona a personalização?', body: 'Envie sua ideia, foto, frase ou arte pelo WhatsApp. Antes da produção, confirme no atendimento o modelo, a composição visual, o valor e o prazo.', icon_name: null, display_order: 100 },
  { content_key: 'faq_price', kind: 'faq', title: 'O valor mostrado já é o total final?', body: 'Não. O catálogo e o orçamento exibem estimativas. Personalização, quantidade, embalagem e entrega podem alterar o valor; tudo é confirmado antes do pedido.', icon_name: null, display_order: 110 },
  { content_key: 'faq_timing', kind: 'faq', title: 'Quanto tempo leva para produzir e entregar?', body: 'O prazo depende da arte, quantidade, disponibilidade e destino. Peça a estimativa atual no WhatsApp antes de confirmar.', icon_name: null, display_order: 120 },
  { content_key: 'faq_care', kind: 'faq', title: 'Como cuidar da caneca?', body: 'Para conservar a estampa, use esponja macia e sabão neutro. Evite abrasivos e impactos. Confirme no atendimento as orientações específicas do modelo escolhido.', icon_name: null, display_order: 130 },
  { content_key: 'faq_after_sales', kind: 'faq', title: 'Como solicitar correção, troca ou cancelamento?', body: 'Entre em contato pelo WhatsApp com os dados do atendimento e fotos, quando aplicável. A situação será analisada conforme o pedido e os direitos previstos na legislação de consumo.', icon_name: null, display_order: 140 },
]

export function isInformationIconName(value: string | null): value is InformationIconName {
  return value !== null && informationIconNames.some((name) => name === value)
}

export function normalizePublicInformationContent(rows: Array<{
  content_key: string
  kind: string
  title: string
  body: string
  icon_name: string | null
  display_order: number
}>): PublicInformationContent[] {
  return rows
    .filter((row): row is typeof row & { kind: InformationContentKind } => row.kind === 'card' || row.kind === 'faq')
    .map((row) => ({
      ...row,
      icon_name: row.kind === 'card' && isInformationIconName(row.icon_name) ? row.icon_name : null,
    }))
    .sort((left, right) => left.display_order - right.display_order || left.content_key.localeCompare(right.content_key))
}
