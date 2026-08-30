# Personalização como ação, sem coleção duplicada

Data: 30 de agosto de 2026.

## Decisão

`Personalizadas` não deve aparecer como categoria porque não possui produtos e duplica a oferta `Personalize do seu jeito`. Nenhuma categoria foi colocada no lugar. A home mantém cinco destaques reais: Divertidas, Animes, Casais, Games e Pets.

## Implementação

- a coleção local `personalizada` ficou explicitamente fora da listagem e do fallback público;
- o importador deixa esse registro não publicado e não listado;
- a home usa cinco colunas no desktop, três no tablet e duas no celular;
- `/colecao/personalizada` redireciona para `/personalizada`, preservando links antigos;
- a migration `20260830123000_hide_empty_personalized_collection.sql` verifica que não existem relações antes de alterar a visibilidade e não exclui nenhum dado;
- o rollback `supabase/rollback/20260830123000_hide_empty_personalized_collection.sql` restaura as duas flags de visibilidade.

## Banco e RLS

A migration foi aplicada de forma transacional pelo endpoint oficial de administração do Supabase porque o pooler direto não respondeu durante a execução do CLI. O histórico `supabase_migrations.schema_migrations` contém a versão `20260830123000`.

Resultado remoto:

- `personalizada`: `is_published = false`, `is_listed = false`;
- produtos relacionados: `0`;
- leitura anônima positiva de `series`: `1` registro;
- leitura anônima de `personalizada`: `0` registros;
- tentativa anônima de escrita: HTTP `401`.

Nenhum token, chave privada ou conteúdo de `.env.local` foi gravado nos artefatos.

## Aceite local

- `npm test`: 76/76;
- `npm run typecheck`: aprovado;
- `npm run build`: 721 produtos, 16 coleções e 740 URLs;
- Playwright/Axe: 124 cenários aprovados em Chrome, Firefox, Safari desktop e Safari móvel;
- inspeção visual da home em 1440 × 1000: cinco cartões alinhados, sem lacuna e sem a categoria duplicada.

## Rollback

1. Executar `supabase/rollback/20260830123000_hide_empty_personalized_collection.sql` no projeto vinculado.
2. Reverter os arquivos de aplicação, testes e documentação deste incremento.
3. Executar novamente testes, typecheck, build e smoke do catálogo.
