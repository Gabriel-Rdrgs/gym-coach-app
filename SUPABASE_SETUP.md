# Guia completo: usar Supabase como banco de dados do Gym Coach

Este guia leva você do zero até o app rodando com o banco no Supabase (plano gratuito).

---

## Etapa 1: Criar conta no Supabase

1. Acesse **https://supabase.com**
2. Clique em **Start your project**
3. Faça login com **GitHub** ou **Google** (ou e-mail)
4. Aceite os termos se aparecer

---

## Etapa 2: Criar um novo projeto

1. No dashboard do Supabase, clique em **New project**
2. Preencha:
   - **Name**: por exemplo `gym-coach` (só para você identificar)
   - **Database Password**: crie uma senha **forte** e **guarde em um lugar seguro**. Você vai usar essa senha na connection string.
   - **Region**: escolha a mais próxima (ex: **South America (São Paulo)**)
3. Clique em **Create new project**
4. Aguarde alguns minutos até o projeto ficar verde (Ready). Não precisa esperar na tela; pode voltar depois.

---

## Etapa 3: Pegar a connection string (URL do banco)

1. Com o projeto aberto, no menu lateral esquerdo clique em **Project Settings** (ícone de engrenagem)
2. No menu da esquerda, clique em **Database**
3. Role até a seção **Connection string**
4. Escolha a aba **URI**
5. Você verá algo como:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   Ou na conexão direta:
   ```text
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Clique em **Copy** (ou selecione e copie)
7. **Substitua `[YOUR-PASSWORD]`** pela senha que você definiu na Etapa 2.  
   Exemplo (sua senha é `MinhaSenh@123`):
   ```text
   postgresql://postgres:MinhaSenh@123@db.abcdefghijk.supabase.co:5432/postgres
   ```
   Se a senha tiver caracteres especiais (`@`, `#`, `%`, etc.), eles precisam ser codificados em URL (por exemplo `@` vira `%40`). Se preferir, use primeiro uma senha só com letras e números para testar.

**Qual usar?**

- **Conexão direta (porta 5432, `db.xxx.supabase.co`)**: ideal para rodar migrações e o app em desenvolvimento no seu PC. Use esta para o `.env` no início.
- **Pooler (porta 6543, `pooler.supabase.com`)**: melhor para deploy em Vercel/serverless. Pode usar depois.

Para este guia, use a **conexão direta** (aba **URI** em “Direct connection” se aparecer, ou a que tem `db.xxx.supabase.co:5432`).

---

## Etapa 4: Configurar o `.env` do projeto

1. Abra a pasta do projeto no seu editor (Cursor / VS Code)
2. Na raiz do projeto, abra o arquivo **`.env`** (se não existir, crie um novo com esse nome)
3. **Apague ou comente** a linha antiga do Railway, por exemplo:
   ```env
   # DATABASE_URL="postgresql://postgres:...@shinkansen.proxy.rlwy.net:13731/railway"
   ```
4. Cole a nova URL do Supabase (já com a senha no lugar de `[YOUR-PASSWORD]`):
   ```env
   DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@db.XXXXXXXXXX.supabase.co:5432/postgres"
   ```
   Troque `SUA_SENHA_AQUI` pela sua senha do banco e `XXXXXXXXXX` pelo ID do seu projeto (vem na URL que você copiou).
5. Mantenha o resto do `.env` (Auth, Google, etc.):
   ```env
   AUTH_SECRET="..."
   AUTH_TRUST_HOST=true
   AUTH_GOOGLE_ID="..."
   AUTH_GOOGLE_SECRET="..."
   ```
6. Salve o arquivo (Ctrl+S).

---

## Etapa 5: Rodar migrações e seed no novo banco

No terminal, na **pasta raiz do projeto**:

```bash
npx prisma migrate dev
```

- Se pedir um nome para a migração, pode usar: `init` ou `supabase`
- Isso cria todas as tabelas no Supabase.

Depois, gerar o cliente e popular os exercícios:

```bash
npx prisma generate
npm run seed
```

Se aparecer erro de conexão ou SSL, confira a Etapa 6.

---

## Etapa 6: Rodar o app

```bash
npm run dev
```

Abra **http://localhost:3000**. Faça login (ex.: e-mail e senha do demo) e use o app normalmente.

---

## Resumo do que você fez

| Onde | O que |
|------|--------|
| Supabase | Conta + projeto + senha do banco |
| Dashboard → Project Settings → Database | Copiou a connection string (URI) |
| `.env` | Colocou `DATABASE_URL` com a URL do Supabase (senha já preenchida) |
| Terminal | `npx prisma migrate dev` → `npx prisma generate` → `npm run seed` → `npm run dev` |

---

## Problemas comuns

**“Connection refused” ou “timeout”**  
- Confirme que a URL está certa no `.env` (senha, host `db.xxx.supabase.co`, porta `5432`).  
- Confirme que o projeto no Supabase está “Ready”.

**“SSL required” ou erro de certificado**  
- O código do app já está configurado para usar SSL com Supabase. Se ainda der erro, avise e podemos ajustar.

**“Password authentication failed”**  
- A senha no `.env` deve ser exatamente a que você definiu ao criar o projeto.  
- Se a senha tiver `@`, `#`, `%`, etc., codifique em URL (ex.: `@` → `%40`).

**Migrações já aplicadas no Railway**  
- No Supabase o banco está vazio; rodar `prisma migrate dev` aplica todas as migrações de novo. Não precisa criar projeto “from migration” no Supabase; o Prisma cuida disso.

**“Server has closed the connection” (P1017)**  
- Comum no **Next.js em dev** (Turbopack/App Router) com a **conexão direta** (porta 5432): o app abre várias conexões (RSC, API routes) e o Supabase fecha as ociosas ou atinge o limite.
- **Solução**: use a **Connection Pooler** (porta 6543) no `.env` para o app rodar (dev e produção):
  1. No Supabase: **Project Settings** → **Database** → role até **Connection string**.
  2. Aba **Connection pooling** (ou **URI** do pooler). Copie a URL que usa **porta 6543** e host `pooler.supabase.com`.
  3. O usuário na URL deve ser `postgres.[PROJECT-REF]` (com ponto), não só `postgres`. Exemplo:  
     `postgresql://postgres.urilsxbqgbiowygsykcb:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
  4. Adicione no final: `?pgbouncer=true&connection_limit=1` (se já tiver `?`, use `&`).  
     Exemplo final:  
     `postgresql://postgres.urilsxbqgbiowygsykcb:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
  5. Coloque essa URL em `DATABASE_URL` no `.env` e reinicie `npm run dev`.
- Para **migrações** (`npx prisma migrate dev`), o pooler em modo *transaction* pode falhar; nesse caso, troque temporariamente `DATABASE_URL` para a conexão **direta** (porta 5432), rode a migração, e volte a usar a URL do pooler no `.env`.

---

Quando estiver tudo rodando, você pode apagar o projeto antigo no Railway para não deixar nada ativo lá.
