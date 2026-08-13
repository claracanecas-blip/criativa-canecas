# Runbook — ativação de domínio próprio

Este procedimento só deve ser executado depois de o proprietário escolher o domínio, autorizar eventual compra e disponibilizar controle do DNS. A origem atual permanece `https://criativa-canecas.vercel.app` até essa decisão.

## Pré-condições

- domínio registrado e acesso ao DNS;
- domínio adicionado ao projeto `criativa-canecas` na Vercel e marcado como verificado;
- decisão sobre usar raiz (`exemplo.com.br`) ou subdomínio (`www.exemplo.com.br`) como origem canônica;
- janela curta de validação, sem remover o domínio atual.

## Troca coordenada

1. Adicionar o domínio em **Vercel → Project Settings → Domains** e aplicar exatamente os registros DNS informados pela Vercel.
2. Aguardar HTTPS e estado verificado antes de alterar qualquer canonical.
3. Trocar `VITE_SITE_URL` na Vercel para a origem HTTPS escolhida, sem caminho nem barra final, em Production, Preview e Development.
4. Atualizar no Supabase Auth a Site URL e a lista de redirects permitidos, preservando temporariamente o domínio Vercel e localhost.
5. Criar um deploy de produção. O build atualizará home, páginas prerenderizadas, sitemap, robots, Open Graph, JSON-LD, links de WhatsApp e hostname aceito pelo analytics.
6. Validar no novo domínio: HTTPS, home, coleção, produto, `/informacoes`, login administrativo, canonical único, sitemap de 361 URLs e evento agregado.
7. Somente depois da validação, configurar redirecionamento permanente do hostname antigo para o novo domínio. Não redirecionar previews.

## Critério de aceite

- todas as rotas principais respondem `200` no domínio novo;
- cada HTML contém exatamente um canonical apontando para o domínio novo;
- sitemap e robots usam o domínio novo;
- aliases antigos redirecionam permanentemente ou consolidam no domínio canônico durante a transição;
- Supabase Auth retorna ao domínio novo após login/recuperação;
- analytics é aceito no domínio novo e rejeitado em aliases/previews;
- nenhum segredo foi incluído no repositório ou bundle.

## Rollback

Restaurar `VITE_SITE_URL=https://criativa-canecas.vercel.app`, manter esse hostname na configuração do Supabase Auth e criar novo deploy. Remover o redirecionamento do hostname antigo se ele já tiver sido ativado. Não apagar o domínio ou registros DNS antes de confirmar a recuperação.
