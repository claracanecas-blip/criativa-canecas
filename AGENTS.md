# Instruções persistentes do projeto

Antes de planejar ou alterar este projeto:

1. Leia integralmente `docs/PROJECT_MEMORY.md`.
2. Consulte `docs/specs/CATALOG_EVOLUTION_SDD.md` para requisitos, fases e critérios de aceite.
3. Preserve arquivos não rastreados do usuário, especialmente cartões em PNG e scripts PowerShell relacionados.
4. Não use `git add .`; adicione somente arquivos explicitamente relacionados à tarefa.
5. Nunca grave ou versione tokens, senhas, `service_role` ou o conteúdo completo de `.env.local`.
6. Para mudanças de aplicação, execute ao menos `npm run typecheck` e `npm run build`.
7. Para mudanças de banco, crie migration versionada, valide RLS positiva e negativa e documente rollback.
8. Após mudança estrutural ou de deploy, atualize a memória e o progresso da especificação no mesmo ciclo.

O site oficial é publicado pela Vercel a partir da branch `main`. GitHub Actions é a verificação de CI.
