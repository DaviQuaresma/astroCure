# AstroCure

> Plataforma de automação de postagens e gerenciamento de perfis para redes sociais, utilizando Node.js, Next.js, Docker, Prisma e integração dinâmica com AdsPower.

## Visão Geral

O AstroCure é um sistema distribuído composto por múltiplos serviços:

- **api/**: Backend Node.js (Express) para autenticação, perfis, vídeos, usuários, integração com AdsPower, filas e controle de jobs.
- **web/**: Frontend Next.js (React) para painel administrativo e login.
- **worker/**: Serviço de automação que executa jobs de postagem e simulação de ações em perfis, usando Playwright e integração dinâmica com AdsPower.
- **scheduler/**: Utilitários e workers para orquestração de tarefas.
- **Banco de dados**: PostgreSQL gerenciado via Prisma ORM.
- **Redis**: Gerenciamento de filas com BullMQ.

## Tecnologias Principais

- Node.js 20
- Next.js 15
- Prisma ORM
- BullMQ & IORedis
- Playwright
- Docker & Docker Compose
- AdsPower (endpoint dinâmico)

## Estrutura dos Serviços

### API (Express)
- Rotas REST para autenticação, perfis, vídeos, usuários, integração com AdsPower.
- Integração com Prisma para persistência.
- Integração com BullMQ para filas de jobs.
- Integração dinâmica com AdsPower: o endpoint é buscado do banco de dados, nunca fixo por variável de ambiente.

### Web (Next.js)
- Painel administrativo e tela de login.
- Consome a API via variável de ambiente `NEXT_PUBLIC_API_URL` definida no Docker Compose.
- Build e start em ambiente Docker.

### Worker
- Executa jobs de automação (postagem, simulação de ações) em perfis de redes sociais.
- Usa Playwright para automação de browser.
- Busca o endpoint do AdsPower dinamicamente do banco.

## Variáveis de Ambiente Importantes

- `NEXT_PUBLIC_API_URL` (web): URL da API para o frontend.
- `DATABASE_URL` (api, worker): string de conexão do PostgreSQL.
- `REDIS_HOST`, `REDIS_PORT` (api, worker): conexão com Redis.

> **Nota:** O endpoint do AdsPower é sempre buscado do banco de dados, nunca fixo por variável de ambiente.

## Comandos Docker

Build e execução dos serviços:

```bash
docker compose build
docker compose up -d
```

Para rebuildar o frontend após alteração de variáveis de ambiente:

```bash
docker compose build web
docker compose up -d web
```

## Fluxo de Automação

1. Perfis e endpoints do AdsPower são cadastrados via API.
2. O worker busca o endpoint ativo do AdsPower do banco.
3. Jobs são adicionados à fila (BullMQ/Redis) para automação de postagens.
4. O worker executa as ações automatizadas usando Playwright.

## Observações

- Não utilize variáveis de ambiente fixas para AdsPower, o sistema é dinâmico.
- Sempre que alterar variáveis de ambiente do frontend, faça rebuild do container web.
- O volume `/videos` é compartilhado entre api, worker e containers para upload e processamento de vídeos.

---
Desenvolvido por Davi Quaresma.
