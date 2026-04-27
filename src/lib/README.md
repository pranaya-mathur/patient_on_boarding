# `lib/`

Cross-cutting utilities and singletons (Prisma client, `cn()` helper, env parsing).

Keep **domain rules** out of this folder — put orchestration in `src/server/` and integrations in `src/services/`.
