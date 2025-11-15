# Backend (Node.js + Express + Prisma)

API base para o TechStock usando Express e Prisma (PostgreSQL).

## Requisitos
- Docker e Docker Compose
- Node.js 18+

## Quick start (dev)
1. Copie o .env de exemplo e ajuste se necessário:
   - `cp .env.example .env`
2. Suba os serviços:
   - `docker compose up -d --build`
3. Instale as dependências (fora do container):
   - `npm install`
4. Gere o Prisma Client:
   - `npm run prisma:generate`
5. (Opcional) Rodar migrations pelo Prisma em vez de SQL de init:
   - `npm run prisma:migrate`
6. Popular dados mínimos (seed):
   - `npm run prisma:seed`
7. Rode a API em dev:
   - `npm run dev`

A API ficará em `http://localhost:8080` e o healthcheck em `/health`. A documentação Swagger estará em `/docs`.

## Scripts úteis
- `npm run dev` — inicia o servidor com nodemon
- `npm start` — inicia o servidor em produção
- `npm run prisma:generate` — gera Prisma Client
- `npm run prisma:studio` — abre o Prisma Studio
- `npm run prisma:migrate` — cria/aplica migrations em dev
- `npm run prisma:migrate:deploy` — aplica migrations em prod/CI
- `npm run prisma:reset` — reseta o banco (drop + migrate + seed)
- `npm run prisma:seed` — executa o seed
- `npm run lint` — roda ESLint
- `npm run format` — formata com Prettier

## Estrutura de pastas
- `src/routes/` — definição de rotas
- `src/controllers/` — lógica dos endpoints
- `src/middlewares/` — validação/autenticação
- `src/services/` — regras de negócio
- `src/repositories/` — acesso a dados (Prisma)
- `src/models/` — esquemas/entidades (DTOs)
- `src/database/` — conexão Prisma
- `src/config/` — configurações (CORS, logger, etc.)
- `src/utils/` — utilitários
- `src/tests/` — testes

## Banco de dados
- Em dev, o Postgres sobe via Docker em `localhost:5433`.
- Por padrão o schema inicial é criado pelos SQLs em `db/init/` na primeira subida.
- Recomendado migrar para Prisma Migrate como fonte de verdade.

## Qualidade de código
- ESLint + Prettier configurados. Ajuste regras em `.eslintrc.json`.
- Consistência de editor via `.editorconfig` e `.prettierrc`.

## Variáveis de ambiente
Veja `.env.example`.

## Notas
- Uso de `pg` foi removido; usar apenas Prisma (`src/database/prisma.js`).
- Para CRUDs, criar camadas `controllers` -> `services` -> `repositories`.
