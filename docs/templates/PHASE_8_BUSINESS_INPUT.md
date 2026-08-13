# Entrada oficial para concluir a Fase 8

Use este modelo como corpo de uma mensagem ao agente. Não preencha nem versione este arquivo com senhas, tokens, documentos pessoais completos ou qualquer informação que não deva ficar pública no site.

Campos marcados como `obrigatório` são necessários para encerrar a Fase 8. Quando uma informação não se aplicar, responder `não se aplica` em vez de deixá-la ambígua.

## 1. Domínio e DNS

- Domínio desejado (`obrigatório`):
- O domínio já foi comprado? (`sim`/`não`):
- Empresa onde o domínio está registrado:
- Domínio principal preferido (`exemplo.com.br` ou `www.exemplo.com.br`):
- O outro formato deve redirecionar para o principal? (`sim`, recomendado):
- Responsável que pode autorizar alterações de DNS (`obrigatório`):
- Acesso será feito por sessão já autenticada ou autorização acompanhada? Não enviar senha nem código de recuperação.

## 2. Identidade pública

- Nome público da marca (`obrigatório`):
- Identificação empresarial que deve aparecer publicamente (`obrigatório`):
- E-mail público de atendimento (`obrigatório`):
- Telefone/WhatsApp público (confirmar ou corrigir o atual):
- Cidade/UF ou endereço que deve aparecer publicamente (`obrigatório`):
- Horário de atendimento:
- Link público de Instagram ou outra rede oficial, se houver:

Só fornecer CPF, endereço residencial ou outro dado pessoal se houver decisão consciente de torná-lo público. Credenciais nunca são necessárias para o conteúdo do site.

## 3. Produção e personalização

- Prazo normal de produção (`obrigatório`):
- Quando o prazo começa a contar (`obrigatório`):
- O cliente aprova a arte antes da produção? Descrever o fluxo:
- Quantas revisões de arte estão incluídas:
- Há quantidade mínima por modelo?
- Quais personalizações alteram o preço estimado?

## 4. Entrega e retirada

- Formas de entrega disponíveis (`obrigatório`):
- Regiões atendidas:
- Como o frete é calculado (`obrigatório`):
- Existe retirada? Informar local/condições públicas:
- O prazo de entrega é separado do prazo de produção? (`sim`/`não`):
- Procedimento em caso de atraso, extravio ou avaria (`obrigatório`):

## 5. Materiais e cuidados

- Material e capacidade das canecas (`obrigatório`):
- Técnica de personalização:
- Pode usar micro-ondas? (`sim`/`não`/`depende`; explicar):
- Pode usar lava-louças? (`sim`/`não`/`depende`; explicar):
- Instruções de lavagem e conservação (`obrigatório`):
- Limitações que o cliente deve conhecer antes de comprar:

## 6. Trocas, cancelamentos e pós-venda

- Regra para defeito ou produto divergente (`obrigatório`):
- Canal e prazo para comunicar problema (`obrigatório`):
- Regra para produto personalizado sem defeito (`obrigatório`):
- Regra de cancelamento antes da aprovação da arte:
- Regra de cancelamento depois da aprovação/início da produção:
- Quem paga frete de devolução quando aplicável:
- Texto adicional de pós-venda:

As respostas devem refletir a operação real. A publicação e eventual revisão jurídica são responsabilidade comercial da proprietária; o agente não criará condições por inferência.

## 7. Avaliações reais

Repetir o bloco para cada avaliação:

- Nome de exibição (`obrigatório`):
- Texto exato autorizado (`obrigatório`):
- Nota de 1 a 5 (`obrigatório`):
- Foto pública (`sem foto` ou arquivo indicado):
- Referência de consentimento para a foto (`obrigatório quando houver foto`):
- Ordem desejada:
- Publicar imediatamente ou manter em rascunho:

Não enviar conversa completa, telefone, endereço ou outro dado do cliente. A referência de consentimento pode ser um identificador interno que permita localizar a autorização fora do site.

## 8. Decisões complementares

- O convite administrativo já foi aceito e a proprietária consegue entrar em `/admin`? (`sim`/`não`):
- Ativar Meta Pixel/Google Analytics agora? (`não`, padrão seguro; `sim` exige especificação de consentimento separada):
- Há alguma informação acima que deve ficar somente interna e não pode ser publicada?
- Confirma que os textos e dados fornecidos podem ser publicados no site? (`sim`, obrigatório):

## 9. Execução após o recebimento

Com as respostas confirmadas, o ciclo final será:

1. cadastrar e revisar identidade, políticas, FAQ e avaliações no Supabase;
2. conectar o domínio na Vercel e aplicar DNS conforme `docs/runbooks/CUSTOM_DOMAIN.md`;
3. atualizar `VITE_SITE_URL` e os callbacks do Supabase Auth;
4. publicar, validar HTTPS, redirecionamentos, canonical, robots, sitemap e WhatsApp;
5. executar RLS, testes, typecheck, build, E2E, Lighthouse e smoke de produção;
6. registrar evidências e marcar a Fase 8 como concluída somente depois de todos os aceites.
