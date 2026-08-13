# Evidências da Fase 8 — base técnica de confiança

Parte técnica concluída em 13 de agosto de 2026. A fase permanece em andamento por depender de domínio/DNS e conteúdo empresarial oficial.

## Entregue

- `/informacoes` com personalização, produção/entrega, materiais/cuidados, pós-venda e FAQ, sem prometer prazo, frete, disponibilidade ou condição não confirmada.
- Link permanente no rodapé e HTML prerenderizado; sitemap passou de 360 para 361 URLs.
- Tabela `testimonials` vazia por padrão, com estados rascunho/publicado/arquivado.
- Home exibe apenas depoimentos publicados e permanece sem seção vazia quando não há conteúdo real.
- `/admin/depoimentos` permite criação, edição, moderação, ordem e exclusão.
- Foto só pode ser salva com uma referência de consentimento; nenhuma avaliação fictícia foi criada.

## Segurança e qualidade

- Migrations remotas `20260813214500`, `20260813215000` e `20260813215500` aplicadas; lint sem erros. Referências de consentimento/autoria ficam fora das colunas públicas e a leitura completa exige RPC administrativa.
- RLS: anônimo não escreve; foto sem consentimento falha; admin cria rascunho; anônimo recebe `[]` para rascunho; publicado fica visível. O reforço de privacidade passou sete verificações remotas positivas/negativas e removeu todos os registros e usuários temporários.
- Registros e usuário temporários removidos.
- 26/26 testes unitários, typecheck e build aprovados.
- 9/9 Playwright/axe, incluindo `/informacoes`, sem violações automáticas WCAG 2.2 A/AA.

## Dependências externas restantes

- nome empresarial/CPF ou CNPJ, endereço e e-mail oficiais para identificação do fornecedor;
- condições comerciais oficiais de produção, entrega, troca e pós-venda;
- conteúdo real de avaliações e referências de consentimento;
- escolha/compra do domínio e acesso ao DNS.

Rollback: aplicar, em ordem reversa, `20260813215500_testimonials_privacy.sql`, `20260813215000_testimonials_admin_hardening.sql` e `20260813214500_moderated_testimonials.sql` de `supabase/rollback/`, além de reverter frontend. Nenhum produto ou pedido é alterado.
