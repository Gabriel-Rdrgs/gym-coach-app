# 💪 Gym Coach App

Aplicação completa de gerenciamento de treinos com interface moderna inspirada no tema "Tony Stark/Iron Man". Sistema completo para registro de treinos, acompanhamento de progresso, PRs (Personal Records), métricas corporais e muito mais.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-7.2.0-2D3748?style=flat-square&logo=prisma)

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral completa do progresso
- Estatísticas avançadas (treinos semanais, tendências, comparações)
- Heatmap de treinos (calendário visual)
- Cards informativos com métricas principais

### 🏋️ Sistema de Treinos
- Criação de treinos com templates pré-definidos
- Programas de treino (Push/Pull/Legs, Upper/Lower, Full Body)
- Sugestão automática de pesos baseada em histórico
- Cálculo automático de séries válidas e tempo estimado
- Troca de exercícios durante a criação
- Visualização detalhada de treinos salvos

### 📈 Acompanhamento de Progresso
- Página de progresso com gráficos interativos
- Evolução de peso e séries válidas
- Gráficos por grupo muscular
- Comparação de métricas ao longo do tempo

### 🏆 Personal Records (PRs)
- Detecção automática de PRs
- Página dedicada com histórico completo
- Gráficos de evolução de PRs por exercício
- Notificações quando PR é batido
- Filtros e busca avançada

### 💪 Exercícios
- Biblioteca completa de exercícios
- Visualização com GIFs e vídeos tutoriais
- Suporte a embed do YouTube
- Filtros avançados (grupo muscular, tipo, equipamento, dificuldade)
- Modal detalhado com instruções e dicas
- Sistema de exercícios alternativos

### 📏 Métricas Corporais
- Registro de peso, cintura, braço, coxa, peito
- Percentual de gordura corporal
- Métricas de bem-estar (sono, energia, estresse)
- Gráficos de evolução

### ⚙️ Administração
- Página de administração para gerenciar exercícios
- Adicionar/editar GIFs, vídeos, equipamento e dificuldade
- Preview em tempo real

## 🛠️ Tecnologias

- **Framework:** Next.js 16.1.1 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Estilização:** Tailwind CSS
- **Gráficos:** Recharts
- **Deploy:** Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd gym-coach-app
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gym_coach?schema=public"
```

4. **Configure o banco de dados:**
```bash
# Executar migrações
npx prisma migrate dev

# Popular banco com exercícios iniciais
npm run seed
```

5. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
gym-coach-app/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts                # Seed de dados iniciais
│   └── migrations/            # Migrações do Prisma
├── src/
│   ├── app/                   # Páginas e rotas (App Router)
│   │   ├── api/              # API Routes
│   │   ├── admin/            # Páginas de administração
│   │   ├── exercises/        # Página de exercícios
│   │   ├── workouts/         # Páginas de treinos
│   │   ├── progress/         # Página de progresso
│   │   ├── prs/              # Página de PRs
│   │   └── metrics/          # Página de métricas
│   ├── components/           # Componentes React
│   ├── lib/                  # Utilitários e helpers
│   └── data/                 # Dados estáticos (templates)
├── public/                   # Arquivos estáticos
└── README.md
```

## 🗄️ Banco de Dados

O projeto usa Prisma como ORM. Principais modelos:

- **Exercise:** Exercícios com informações completas (GIFs, vídeos, equipamento)
- **Workout:** Treinos registrados
- **Set:** Séries de cada exercício
- **PersonalRecord:** PRs (Personal Records)
- **Metric:** Métricas corporais e bem-estar
- **ExerciseAlternative:** Relacionamento de exercícios alternativos

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Importe seu repositório GitHub/GitLab

2. **Configure variáveis de ambiente:**
   - Adicione `DATABASE_URL` nas configurações do projeto
   - Use uma URL de banco PostgreSQL (ex: Supabase, Neon, Railway)

3. **Configure build settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy automático:**
   - Cada push para `main` gera um deploy automático

### Outras opções de deploy

- **Railway:** Suporta PostgreSQL e Next.js nativamente
- **Render:** Deploy simples com PostgreSQL
- **DigitalOcean App Platform:** Opção robusta com escalabilidade

### Variáveis de Ambiente para Produção

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/database?schema=public"
NODE_ENV="production"
```

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linter
npm run seed     # Popula banco com dados iniciais
```

## 🎨 Tema e Design

O aplicativo usa um tema "neon" inspirado em Tony Stark/Iron Man:
- Cores principais: Azul ciano (#00D9FF) e Roxo (#A78BFA)
- Efeitos de glow e bordas neon
- Design moderno e responsivo
- Animações suaves

## 🔐 Segurança

- Variáveis sensíveis em `.env` (nunca commitar)
- Validação de dados nas API routes
- Sanitização de inputs do usuário

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e de uso pessoal.

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para tornar seu treino mais eficiente e completo!** 🏋️‍♂️
