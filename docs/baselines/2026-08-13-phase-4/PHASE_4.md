# Evidências da Fase 4 — painel administrativo

Implementação e validação concluídas em 13 de agosto de 2026.

## Entrega

- `/admin` protegido por Supabase Auth e verificação adicional de `public.admin_users`.
- Login por e-mail/senha, logout, recuperação e definição inicial de senha.
- CRUD de produtos e coleções com busca, preço, tema, descrição, status, destaque, ordem, SEO e múltiplas coleções.
- Confirmação antes de exclusões; coleção relacionada não pode ser excluída.
- Imagens JPEG, PNG ou WebP limitadas a 10 MB e mínimo de 640 × 640.
- Geração no navegador de quatro WebP: 1000 × 1000, 320 × 320, 640 × 640 e social 1200 × 630.
- Publicação ocorre somente depois do upload das variantes; falha parcial remove os objetos recém-enviados.
- Objetos antigos são preservados em exclusões para evitar perda irreversível.
- Autoria `created_by`/`updated_by` e log de insert/update/delete protegidos por RLS.

## Segurança remota

O relatório [`rls-report.json`](rls-report.json) confirma:

- escrita e upload negados para anônimo e autenticado sem papel;
- auditoria invisível para usuário comum;
- escrita, upload e exclusão permitidos para administrador;
- autoria e logs de inserção/exclusão registrados;
- identificador do administrador indisponível na API pública;
- usuário, produto, auditoria e objeto sentinela removidos.

As migrations `20260813204000_catalog_admin_audit.sql` e `20260813205500_catalog_actor_privacy.sql` estão aplicadas, possuem rollback versionado e passaram `supabase db lint --linked --level warning` sem alertas.

## Ciclo ponta a ponta

O relatório [`admin-e2e-report.json`](admin-e2e-report.json) registra nove verificações Playwright em build de produção local:

1. acesso anônimo a `/admin` redireciona ao login;
2. administrador autenticado vê os 341 produtos;
3. cria uma coleção;
4. cria e publica um produto com imagem;
5. confirma quatro variantes no banco/Storage;
6. visualiza o produto na coleção pública;
7. exclui o produto após confirmação;
8. exclui a coleção vazia após confirmação;
9. encerra a sessão.

Após o teste: zero produtos, coleções, logs e usuários Auth temporários; o único `admin_users` restante corresponde ao convite real enviado ao proprietário.

## Qualidade e rollback

- `npm test`: 16/16 testes aprovados.
- `npm run typecheck`: aprovado.
- `npm run build`: aprovado.
- Banco: cinco migrations locais/remotas reconciliadas e lint sem alertas.

Rollback do banco, em ordem:

1. `supabase/rollback/20260813205500_catalog_actor_privacy.sql`;
2. `supabase/rollback/20260813204000_catalog_admin_audit.sql`.

O rollback remove somente auditoria/autoria e restaura os privilégios anteriores; tabelas e dados do catálogo permanecem.
