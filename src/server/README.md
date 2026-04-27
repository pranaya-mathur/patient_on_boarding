# `server/`

Server-only modules: Prisma queries, staff authorization, intake session resolution, audit logging.

Next.js **Server Actions** and route handlers in `src/app/api/` should call into this layer rather than importing `@prisma/client` directly everywhere.
