# Project Overview

## Project Name

**GlassFitPro** — Plataforma de Gestão de Treinos com Estética Liquid Glass

## Description

Aplicação web full-stack de gestão de treinos físicos. Tem dois portais distintos: um painel administrativo (professor/admin) para cadastro de alunos, exercícios e planos de treino; e um dashboard de aluno para visualizar o treino da semana, registrar progresso, acessar o feed social de check-ins e editar o perfil. O design segue o sistema "Liquid Glass" com glassmorphism, animações via Framer Motion e tema escuro.

---

## Tech Stack

- **Languages:** TypeScript, SQL
- **Frameworks:** React 18, Vite 5, React Router DOM v6
- **UI:** Tailwind CSS v3, shadcn/ui (Radix UI primitives), Framer Motion, Lucide React, Recharts
- **State Management:** Zustand v5
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Forms:** React Hook Form + Zod
- **Image Handling:** react-easy-crop (crop/resize), Supabase Storage
- **Date Utilities:** date-fns v3 (ptBR locale)
- **Testing:** Vitest + Testing Library
- **Deploy:** Vercel (vercel.json presente)
- **Package Manager:** npm / bun

---

## Folder Structure

```text
viccs_GlassFitPro/
├── .agent/
│   ├── overview/
│   │   └── PROJECT_STATUS.md        ← este arquivo
│   ├── media/
│   ├── visual-references/
│   └── workflow/
├── public/                          ← assets estáticos (ícones PWA, etc.)
├── src/
│   ├── App.tsx                      ← Roteamento principal (React Router)
│   ├── main.tsx
│   ├── index.css                    ← Design tokens globais, CSS vars liquid glass
│   ├── components/
│   │   ├── AdminLayout.tsx          ← Layout principal do portal admin
│   │   ├── StudentLayout.tsx        ← Layout principal do portal aluno
│   │   ├── DesktopSidebar.tsx       ← Sidebar fixa para desktop (aluno)
│   │   ├── BottomNav.tsx            ← Nav inferior mobile (aluno)
│   │   ├── ExerciseCard.tsx         ← Card de exercício com vídeo/imagem e checkbox
│   │   ├── WeeklyProgress.tsx       ← Barra de progresso semanal
│   │   ├── GlassCard.tsx            ← Wrapper de card glassmorphism (legado)
│   │   ├── UploadModal.tsx          ← Modal de upload de arquivos
│   │   ├── AnimatedButton.tsx
│   │   ├── NavLink.tsx
│   │   ├── student/
│   │   │   ├── HomeWorkoutTab.tsx   ← Aba de treino da semana (seletor de dia + exercícios)
│   │   │   ├── ProgressTab.tsx      ← Aba de progresso (peso, gráfico, histórico semanal)
│   │   │   ├── ProfileTab.tsx       ← Aba de perfil (avatar, bio, stats, edit modal)
│   │   │   ├── WeeklyHistoryCard.tsx← Cards de histórico semanal (glassmorphism, usa week_start_date)
│   │   │   ├── EditProfileModal.tsx ← Modal de edição de perfil (nome, bio, avatar com crop)
│   │   │   ├── ImageCropper.tsx     ← Componente de crop de imagem (react-easy-crop)
│   │   │   └── feed/
│   │   │       ├── FeedTab.tsx      ← Aba principal do feed social
│   │   │       ├── FeedPostCard.tsx ← Card de post do feed (img, likes, comentários)
│   │   │       ├── FeedCommentsModal.tsx ← Modal de comentários (mencionar, emoji picker)
│   │   │       └── CreatePostModal.tsx   ← Modal de criação de post (imagem OBRIGATÓRIA)
│   │   └── ui/                      ← shadcn/ui primitives (Button, Dialog, Input, etc.)
│   ├── pages/
│   │   ├── Index.tsx                ← Landing page principal
│   │   ├── Login.tsx                ← Auth page (login/registro, Supabase Auth)
│   │   ├── NotFound.tsx
│   │   ├── admin/
│   │   │   ├── AdminOverview.tsx    ← Dashboard admin (stats gerais)
│   │   │   ├── AdminStudents.tsx    ← CRUD de alunos (criar, editar, deletar, assign workouts)
│   │   │   ├── AdminExercises.tsx   ← CRUD de exercícios (nome, grupo muscular, vídeo, imagem)
│   │   │   └── AdminWorkouts.tsx    ← Gerenciar dias de treino e exercícios por aluno
│   │   └── student/
│   │       └── StudentDashboard.tsx ← Dashboard principal do aluno (tabs: feed, treino, progresso, perfil)
│   ├── contexts/
│   │   └── AuthContext.tsx          ← Contexto de autenticação (Supabase Auth, role-based)
│   ├── store/
│   │   └── workoutStore.ts          ← Zustand store (dados aluno, exercícios, pesos, histórico semanal)
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useSimulatedAsync.ts
│   ├── lib/
│   │   ├── supabase.ts              ← Cliente Supabase inicializado
│   │   └── utils.ts                 ← cn() utility (clsx + tailwind-merge)
│   ├── services/
│   │   └── ...                      ← Helpers de serviço
│   ├── data/
│   │   └── ...                      ← Dados estáticos/seed
│   ├── types/
│   │   └── ...                      ← Tipos TypeScript globais
│   └── test/
│       └── ...                      ← Testes Vitest
├── database_schema.sql              ← Schema completo do PostgreSQL (Supabase)
├── supabase_migration.sql           ← Migration para corrigir week_start_date (2026-03-02 → 2026-03-03)
├── tailwind.config.ts               ← Tokens do design system (cores, gradientes, glass)
├── vite.config.ts
├── vercel.json                      ← Config de deploy (SPA redirect)
└── package.json
```

---

## Database Schema (Supabase)

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do usuário (nome, avatar_url, bio, role: admin/student) |
| `workout_days` | Dias de treino cadastrados por aluno (ex: "Segunda-feira") |
| `exercises` | Biblioteca de exercícios (nome, grupo muscular, vídeo, imagem) |
| `workout_exercises` | Pivot — exercício atribuído a um dia (sets, reps, completed, order_index) |
| `weight_logs` | Histórico de peso corporal do aluno (peso + timestamp) |
| `weekly_progress_history` | Histórico semanal de progresso (week_start_date, total/completed, %) |
| `posts` | Posts do feed social (imagem obrigatória, texto, student_id) |
| `post_likes` | Likes em posts |
| `post_comments` | Comentários em posts |

---

## Features Implementadas

### Portal do Aluno

- [x] **Dashboard** com 4 abas: Feed, Treino, Progresso, Perfil
- [x] **Treino da Semana** — seletor de dia, cards de exercício com checkbox de conclusão, barra de progresso
- [x] **Progresso** — gráfico de peso corporal (Recharts), log de peso, histórico semanal (WeeklyHistoryCard)
- [x] **Histórico Semanal** — tabela `weekly_progress_history` com upsert automático ao marcar exercício; exibe "Semana de dd/MM/yyyy" sem bug de timezone UTC→BRT
- [x] **Perfil** — avatar com crop (react-easy-crop), bio, contadores de treinos/peso
- [x] **Feed Social** — timeline de check-ins com imagem, likes, comentários, @menções, emoji picker
- [x] **Post Obrigatório com Imagem** — `CreatePostModal` bloqueia envio sem imagem anexada
- [x] **Layout Responsivo** — BottomNav mobile + DesktopSidebar fixo no desktop
- [x] **Layout Desktop** — containers adaptados para telas largas (md:ml-[220px])

### Portal Admin

- [x] **Overview** — visão geral de alunos e métricas
- [x] **Gerenciar Alunos** — CRUD completo, atribuição de treinos
- [x] **Biblioteca de Exercícios** — CRUD com vídeo/imagem URL
- [x] **Planos de Treino** — criar/editar dias da semana e exercícios por aluno

### Infraestrutura

- [x] **Auth** — Supabase Auth com roles (admin/student), redirect automático por papel
- [x] **RLS** — Row Level Security em todas as tabelas sensíveis
- [x] **Optimistic UI** — `markExerciseComplete` atualiza UI imediatamente, persiste em background
- [x] **Liquid Glass Design System** — tokens em `tailwind.config.ts` e `index.css`

---

## WIP / TODOs Conhecidos

- [ ] **Executar `supabase_migration.sql`** no SQL Editor do Supabase para corrigir data antiga salva como `2026-03-02` → `2026-03-03`
- [ ] Notificações push (feature iniciada mas com issues de config no service worker / Vercel)
- [ ] Paginação / infinite scroll no Feed (atualmente carrega todos os posts)
- [ ] Testes automatizados (estrutura Vitest existe, cobertura baixa)
- [ ] GridLayout de exercícios no desktop (Treino da Semana)

---

## Última Atualização

`2026-03-03` — Bug de timezone corrigido no `WeeklyHistoryCard.tsx` (usa `week_start_date` em vez de `created_at`). Imagem obrigatória no feed implementada. Histórico semanal com upsert + RLS funcional.
