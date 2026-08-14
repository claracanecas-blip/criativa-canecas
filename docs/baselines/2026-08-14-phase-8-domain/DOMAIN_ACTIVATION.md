# Evidência — ativação do domínio próprio

Data: 14 de agosto de 2026.

## Resultado

O domínio `https://criativacanecas.com.br` foi ativado como origem oficial da Criativa Canecas. O hostname `www` e a URL anterior da Vercel redirecionam permanentemente para a raiz, preservando caminho e parâmetros.

## Configuração aplicada

- Registro.br: registros `A` da raiz e de `www` apontando para `76.76.21.21`;
- Vercel: raiz e `www` verificados, sem conflito de DNS;
- TLS: certificado para raiz e `www`, com renovação automática;
- Vercel: `VITE_SITE_URL=https://criativacanecas.com.br` em Production, Preview e Development;
- Supabase Auth: Site URL no domínio novo e redirects permitidos para raiz, `www`, hostname anterior, previews e Vite local;
- deploy de produção reconstruído a partir do último artefato publicado, sem enviar o workspace local;
- redirects `308`: `www.criativacanecas.com.br` e `criativa-canecas.vercel.app` para `criativacanecas.com.br`.

Após a atualização do Supabase, uma segunda reconciliação confirmou `api`, banco, Auth e Storage como `up_to_date`. MFA TOTP, confirmação de e-mail, intervalo de envio de um minuto e OTP de oito dígitos permaneceram ativos e passaram a ser refletidos no `supabase/config.toml` versionado.

## Validação de produção

- HTTPS `200`: `/`, `/colecao/series`, `/produto/arrow-1`, `/informacoes` e `/admin`;
- um único canonical em home, produto e informações, sempre no domínio novo;
- nenhuma referência ao hostname anterior nos HTMLs verificados;
- sitemap com 361 URLs no domínio novo e nenhuma URL antiga;
- `robots.txt` aponta para o sitemap novo e bloqueia `/admin`;
- redirecionamentos `308` preservam caminho e query string;
- navegação real carregou `Arrow 01`, sem requisições com falha;
- `/admin` sem sessão redirecionou para `/admin/login?redirect=/admin`;
- RPC de analytics `record_catalog_event` respondeu `204` a partir do hostname oficial;
- 33 testes unitários, `npm run typecheck` e `npm run build` aprovados;
- build gerou 341 páginas de produto, 17 páginas de coleção e 361 URLs.

## Rollback

1. restaurar `VITE_SITE_URL=https://criativa-canecas.vercel.app` nos três ambientes da Vercel;
2. restaurar esse hostname como Site URL no Supabase Auth, preservando temporariamente os redirects novos;
3. remover o redirect do hostname anterior e criar novo deploy de produção;
4. validar home, produto, `/admin`, canonical, sitemap e analytics no hostname anterior;
5. somente depois da recuperação, avaliar a remoção dos redirects do domínio novo; não apagar registros DNS durante o diagnóstico.

## Pendências externas da Fase 8

A ativação do domínio está concluída. A Fase 8 permanece aberta somente para identidade empresarial aplicável, e-mail/cidade ou endereço público, condições comerciais oficiais e avaliações reais autorizadas.
