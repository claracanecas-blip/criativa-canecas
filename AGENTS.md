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

## Autonomia de execução

- Avance de forma autônoma até o critério de pronto da fase ativa, tomando decisões técnicas reversíveis e bem fundamentadas.
- Faça suposições razoáveis quando elas não alterarem materialmente o escopo; registre decisões permanentes na memória.
- Não interrompa o trabalho para perguntas intermediárias não bloqueantes. Informe progresso e continue executando.
- Quando houver várias tarefas seguras e independentes, organize-as para reduzir esperas sem criar conflitos no workspace.
- Só solicite orientação quando faltar autoridade para uma ação externa/material, houver uma decisão de negócio que mude significativamente o resultado, ou alternativas seguras tiverem sido esgotadas.
- Nunca transforme autonomia em permissão para apagar dados amplos, contratar serviços pagos, expor credenciais ou incluir arquivos pessoais no Git.

O site oficial é publicado pela Vercel a partir da branch `main`. GitHub Actions é a verificação de CI.
