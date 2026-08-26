# Substituição de `religiao-01`

Data: 26 de agosto de 2026.

## Decisão e origem

- O proprietário solicitou substituir a caneca `Fé Islâmica` antes da publicação da Fase 10.
- O ID, slug e SKU `religiao-01` foram preservados para não quebrar links, orçamento persistido ou analytics.
- A alternativa escolhida foi `Porque Ele Vive`, tema `Cristã`, baseada na estampa plana existente `Cópia de Religião - Sublimar Digital (136).png`.
- SHA-256 da estampa: `838311b88d1bf34176fe7b1adbd13efc5e2150562bef8c09572d7fbf577ca6cd`.

## Mockup e imagens

- O mockup foi gerado pelo modo integrado da skill `imagegen`, usando o layout anterior de `religiao-01` como alvo e a estampa plana como referência de produção.
- Arquivo local preservado: `source-images/religiao-01-r2.png`, 1254 × 1254, SHA-256 `2971f56fe08317ab4579352b490c4ad391d3697742b1fae7b0c7bc2aface5c9b`.
- Cópia de produção: `D:\estampas\146 - RELIGIÕES DIVERSAS\MOCKUPS - 50 RELIGIÕES\religiao-01-r2.png`.
- Quatro WebPs versionados foram publicados: original 1000 × 1000, cards 320 × 320 e 640 × 640, e social 1200 × 630.
- Todos retornaram HTTP 200, `image/webp`, `public, max-age=31536000` e hash remoto idêntico ao local.
- Os quatro objetos anteriores de `religiao-01` não foram apagados e permanecem disponíveis para rollback.

## Banco e segurança

- Migration remota: `20260826150000_replace_religion_01_mockup.sql`.
- Rollback versionado restaura nome, tema, metadados e os quatro caminhos anteriores, sem excluir objetos do Storage.
- Leitura anônima positiva retornou `Porque Ele Vive`, tema `Cristã`, status publicado e os quatro caminhos `religiao-01-r2`.
- Escrita anônima equivalente foi negada por RLS.
- `supabase db lint --linked` não apontou erros.

## Prompt final

```text
Use case: precise-object-edit
Asset type: ecommerce catalog product mockup
Primary request: replace only the Islamic artwork in the existing catalog layout with the Christian artwork "PORQUE ELE VIVE POSSO CRER NO AMANHÃ", applying it faithfully to the flat preview and both ceramic mugs.
Constraints: preserve the two-mug composition, neutral studio background, lighting, shadows and the caption "Foto Meramente Ilustrativa"; keep the source artwork faithful; no Islamic symbols, cropped text, misspellings, blank lower bands, extra objects or watermark.
```

O relatório estruturado das verificações está em [`verify-report.json`](verify-report.json).
