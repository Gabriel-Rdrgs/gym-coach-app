# Corrigir P1017 "Server has closed the connection" com Supabase

## 1. Conferir se o problema é do Supabase

Antes de tudo, vale checar no próprio Supabase:

### Projeto pausado (free tier)

Projetos no plano gratuito **podem ser pausados** por inatividade. Quando pausado, o banco não aceita conexões e você pode ver erros de conexão.

- Abra o [Dashboard do Supabase](https://supabase.com/dashboard) e selecione o projeto.
- Se aparecer **“Project is paused”** ou **“Restore project”**, clique em **Restore project** e espere alguns minutos.
- Depois de restaurado, teste de novo o app.

### Testar conexão fora do Next.js

No terminal, teste se a conexão direta funciona (troque a senha e o host se precisar):

```bash
# Instalar cliente (se não tiver): sudo apt install postgresql-client
psql "postgresql://postgres:SUA_SENHA@db.urilsxbqgbiowygsykcb.supabase.co:5432/postgres?sslmode=require" -c "SELECT 1"
```

(Use `sslmode=require` — o `psql` não aceita `no-verify`. No app, o SSL é tratado em `lib/prisma.ts` com `rejectUnauthorized: false`.)

- Se **der erro** (connection refused, timeout, etc.): o problema é rede/Supabase/projeto pausado.
- Se **funcionar**: a conexão está ok e o problema tende a ser SSL/config do Prisma/pg no Node.

---

## 2. Ajustes no app (SSL + conexão direta + Webpack)

### Conexão direta (SSL no código)

No `.env`, use a **conexão direta** (sem parâmetros de SSL na URL; o SSL é configurado em lib/prisma.ts):

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"
```

O código em `lib/prisma.ts` usa `ssl: { rejectUnauthorized: false }` e `connect_timeout=30` para Supabase.

### Rodar o dev com Webpack

- `npm run dev` → Webpack (recomendado).
- `npm run dev:turbo` → Turbopack.

---

## 3. Resumo

| Onde | O que fazer |
|------|-------------|
| **Supabase** | Verificar se o projeto está pausado e restaurar se precisar. |
| **Terminal** | Testar com `psql` e a mesma URL do `.env`. |
| **App** | Usar conexão direta (sem sslmode na URL) e `npm run dev` (Webpack). |
