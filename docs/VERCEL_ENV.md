# Variáveis de ambiente na Vercel

Para o deploy funcionar e o **login** não dar "Application error" / "unexpected response", configure no painel da Vercel (**Settings → Environment Variables**) as variáveis abaixo.

## Obrigatórias

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | URL do Postgres (ex.: Supabase). Use a mesma do `.env` local. |
| `AUTH_SECRET` | string longa aleatória | Usado para assinar cookies/JWT. Pode ser o mesmo do `.env` local. |
| `NEXTAUTH_URL` | `https://seu-app.vercel.app` | **URL pública do app na Vercel.** Sem isso o login quebra em produção. |

## Para login com Google

| Variável | Descrição |
|----------|-----------|
| `AUTH_GOOGLE_ID` | Client ID do Google OAuth |
| `AUTH_GOOGLE_SECRET` | Client Secret do Google OAuth |

## Conferência rápida

1. **NEXTAUTH_URL**: deve ser exatamente a URL do seu deploy (ex.: `https://gym-coach-app.vercel.app`), **sem** barra no final.
2. **AUTH_SECRET**: se não tiver, gere uma: `openssl rand -base64 32`.
3. **DATABASE_URL**: mesma que você usa localmente (Supabase, etc.). A Vercel permite conexões com a internet.

Depois de salvar as variáveis, faça um **Redeploy** (Deployments → ⋮ → Redeploy) para aplicar.
