# 🚀 Guia de Deploy - Gym Coach App

Este guia detalha como fazer deploy da aplicação em diferentes plataformas.

## 📋 Pré-requisitos

- Conta no GitHub/GitLab/Bitbucket
- Banco de dados PostgreSQL (local ou cloud)
- Conta na plataforma de deploy escolhida

## 🌐 Opção 1: Vercel (Recomendado)

A Vercel é a plataforma criada pelos desenvolvedores do Next.js e oferece a melhor experiência para deploy.

### Passo a Passo

1. **Preparar o repositório:**
   ```bash
   git add .
   git commit -m "Preparar para deploy"
   git push origin main
   ```

2. **Criar conta na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com GitHub/GitLab

3. **Importar projeto:**
   - Clique em "Add New Project"
   - Selecione seu repositório
   - Configure:
     - **Framework Preset:** Next.js
     - **Root Directory:** `./`
     - **Build Command:** `npm run build`
     - **Output Directory:** `.next` (deixe vazio, Next.js detecta automaticamente)

4. **Configurar variáveis de ambiente:**
   - Na seção "Environment Variables", adicione:
     ```
     DATABASE_URL=postgresql://usuario:senha@host:5432/database?schema=public
     ```
   - Use uma URL de banco PostgreSQL de produção (veja opções abaixo)

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Sua aplicação estará disponível em `https://seu-projeto.vercel.app`

6. **Configurar migrações do Prisma:**
   - Adicione um script de build customizado ou use GitHub Actions
   - Ou execute manualmente após o primeiro deploy:
     ```bash
     npx prisma migrate deploy
     npx prisma generate
     ```

### Banco de Dados para Vercel

**Opções recomendadas:**
- **Supabase** (gratuito até 500MB): [supabase.com](https://supabase.com)
- **Neon** (gratuito até 3GB): [neon.tech](https://neon.tech)
- **Railway** (gratuito com créditos): [railway.app](https://railway.app)
- **Vercel Postgres** (integrado): Disponível no dashboard da Vercel

### Configurar Build Command com Prisma

No Vercel, você pode adicionar um script customizado no `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

E configurar no Vercel:
- **Build Command:** `npm run vercel-build`

---

## 🚂 Opção 2: Railway

Railway oferece deploy simples com PostgreSQL integrado.

### Passo a Passo

1. **Criar conta:**
   - Acesse [railway.app](https://railway.app)
   - Faça login com GitHub

2. **Criar novo projeto:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório

3. **Adicionar banco de dados:**
   - No projeto, clique em "New"
   - Selecione "Database" > "PostgreSQL"
   - Railway criará automaticamente e adicionará `DATABASE_URL` às variáveis

4. **Configurar variáveis:**
   - Railway detecta automaticamente o `DATABASE_URL` do PostgreSQL
   - Adicione outras variáveis se necessário

5. **Deploy:**
   - Railway faz deploy automático a cada push
   - Acesse a URL fornecida

6. **Executar migrações:**
   - Use o Railway CLI ou terminal web:
     ```bash
     npx prisma migrate deploy
     npx prisma generate
     npm run seed
     ```

---

## 🎨 Opção 3: Render

Render oferece deploy simples com suporte a PostgreSQL.

### Passo a Passo

1. **Criar conta:**
   - Acesse [render.com](https://render.com)
   - Faça login com GitHub

2. **Criar Web Service:**
   - Clique em "New +" > "Web Service"
   - Conecte seu repositório
   - Configure:
     - **Name:** gym-coach-app
     - **Environment:** Node
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`

3. **Adicionar PostgreSQL:**
   - Clique em "New +" > "PostgreSQL"
   - Render criará e fornecerá a `DATABASE_URL`

4. **Configurar variáveis:**
   - Na seção "Environment", adicione:
     ```
     DATABASE_URL=<URL do PostgreSQL criado>
     NODE_ENV=production
     ```

5. **Deploy:**
   - Render faz deploy automático
   - Execute migrações via Shell:
     ```bash
     npx prisma migrate deploy
     npx prisma generate
     npm run seed
     ```

---

## 🐳 Opção 4: Docker + VPS

Para mais controle, você pode fazer deploy em um VPS usando Docker.

### Dockerfile

Crie um `Dockerfile` na raiz:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=gym_coach
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy

```bash
docker-compose up -d
```

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente

Certifique-se de configurar:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database?schema=public
NODE_ENV=production
```

### Executar Migrações

Após o primeiro deploy, execute:

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed  # Opcional: popular com dados iniciais
```

### Build Otimizado

O Next.js já otimiza automaticamente para produção. Certifique-se de:

- Não commitar `.env` files
- Usar variáveis de ambiente da plataforma
- Executar `npm run build` localmente antes de fazer push

---

## 📊 Monitoramento

### Vercel Analytics
- Disponível no dashboard da Vercel
- Métricas de performance e uso

### Logs
- Todas as plataformas oferecem logs em tempo real
- Monitore erros e performance

### Banco de Dados
- Configure backups automáticos
- Monitore uso de recursos

---

## 🔄 CI/CD

### GitHub Actions (Exemplo)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npx prisma generate
```

---

## ✅ Checklist de Deploy

- [ ] Repositório configurado e código commitado
- [ ] Banco de dados PostgreSQL criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações do Prisma executadas
- [ ] Seed executado (opcional)
- [ ] Build testado localmente
- [ ] URL de produção funcionando
- [ ] Logs verificados
- [ ] Backup do banco configurado

---

## 🆘 Troubleshooting

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "Database connection failed"
- Verifique `DATABASE_URL`
- Confirme que o banco aceita conexões externas
- Verifique firewall/whitelist

### Build falha
- Verifique logs da plataforma
- Teste build local: `npm run build`
- Verifique se todas as dependências estão no `package.json`

---

**Boa sorte com o deploy! 🚀**

