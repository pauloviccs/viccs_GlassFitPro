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
├── supabase_add_username_columns.sql ← Migration: colunas username + last_username_update em profiles
├── supabase_fix_storage_upload.sql  ← Fix: recria todas as policies de Storage (auth.uid() IS NOT NULL)
├── supabase_migration.sql           ← Migration: corrigir week_start_date (2026-03-02 → 2026-03-03)
├── supabase_security_fixes.sql      ← Hardening v1: RLS, RPCs INVOKER, revoke anon
├── supabase_security_fixes_v2.sql   ← Hardening v2: remoção de SELECT policies dos buckets públicos
├── tailwind.config.ts               ← Tokens do design system (cores, gradientes, glass)
├── vite.config.ts
├── vercel.json                      ← Config de deploy (SPA redirect)
└── package.json
```

---

## Database Schema (Supabase)

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do usuário (nome, username, last_username_update, avatar_url, banner_url, bio, display_name, role: admin/student) |
| `workout_days` | Dias de treino cadastrados por aluno (ex: "Segunda-feira") |
| `exercises` | Biblioteca de exercícios (nome, grupo muscular, vídeo, imagem) |
| `workout_exercises` | Pivot — exercício atribuído a um dia (sets, reps, completed, order_index) |
| `workout_templates` | Templates de treinos reutilizáveis ("pacotes" criados pelo professor) |
| `workout_template_exercises` | Pivot — exercícios que compõem o template (ordem, séries, repetições padrão) |
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
- [x] **Perfil Privado** — avatar com crop (react-easy-crop), bio com emoji picker (limite 150 chars), edição de username restrita (3 horas), contadores gamificados (O(1) via RPC)
- [x] **Perfil Público** — visualização leitura-apenas (`PublicProfile.tsx`) de qualquer aluno via `@menção` ou navegação do feed
- [x] **Feed Social** — timeline infinita com Intersection Observer (10 em 10), comentários (1 por post), likes com Optimistic UI
- [x] **Post Obrigatório com Imagem** — `CreatePostModal` com FAB "➕" flutuante e crop automático (800x800px)
- [x] **Comentários & Menções** — componente `MentionTextarea.tsx` para autocomplete de `@username`, e `CharCounter` animado para limite de 500 chars
- [x] **Layout Responsivo** — BottomNav mobile + DesktopSidebar fixo no desktop
- [x] **Layout Desktop** — containers adaptados para telas largas (md:ml-[220px])

### Portal Admin

- [x] **Overview** — visão geral de alunos e métricas
- [x] **Gerenciar Alunos** — CRUD completo, atribuição de treinos, listagem inclui o avatar real do aluno
- [x] **Biblioteca de Exercícios** — CRUD com vídeo/imagem URL
- [x] **Treinos Prontos (Templates)** — Criar e gerenciar pacotes de treinos reutilizáveis
- [x] **Planos de Treino** — criar/editar dias da semana e importar templates para o cronograma do aluno

### Infraestrutura

- [x] **Auth** — Supabase Auth com roles (admin/student), redirect automático por papel
- [x] **RLS** — Row Level Security em todas as tabelas sensíveis (incluindo `weekly_progress_history`)
- [x] **RPCs Hardened** — `get_profile_stats` e `toggle_feed_like` com `SECURITY INVOKER`, `search_path` fixo e acesso anônimo revogado
- [x] **Storage Policies** — Buckets públicos (avatars, banners, feed_images): policies de INSERT/UPDATE/DELETE para upload autenticado usando `auth.uid() IS NOT NULL`; policies de SELECT mantidas para suportar `upsert`
- [x] **Upload Resiliente** — `EditProfileModal` com retry automático: se `upsert` falhar (RLS de SELECT ausente), retenta sem upsert com nome único; se `last_username_update` faltar no schema, retenta save sem a coluna
- [x] **Optimistic UI** — `markExerciseComplete` atualiza UI imediatamente, persiste em background
- [x] **Liquid Glass Design System** — tokens em `tailwind.config.ts` e `index.css`

---

## WIP / TODOs Conhecidos

### 🔴 Migrações Pendentes (executar no SQL Editor do Supabase)

| # | Arquivo | Prioridade | O que faz |
|---|---|---|---|
| 1 | `supabase_add_username_columns.sql` | **CRÍTICA** | Cria colunas `username` e `last_username_update` em `profiles` |
| 2 | `supabase_fix_storage_upload.sql` | **CRÍTICA** | Recria ALL storage policies com `auth.uid()` + adiciona SELECT para upsert |
| 3 | `supabase_security_fixes.sql` | Alta | Hardening v1: RLS, RPCs INVOKER, revoke anon |
| 4 | `supabase_security_fixes_v2.sql` | Média | Hardening v2: remoção de SELECT policies dos buckets públicos |
| 5 | `supabase_migration.sql` | Baixa | Corrigir data week_start_date `2026-03-02` → `2026-03-03` |

> **⚠️ IMPORTANTE:** Executar #1 e #2 resolve os bugs de Android (edição de perfil e upload de avatar). O #4 será parcialmente sobrescrito pelo #2 — executar #2 por último.

### 📋 Backlog

- [ ] Notificações push (feature iniciada mas com issues de config no service worker / Vercel)
- [ ] Testes automatizados (estrutura Vitest existe, cobertura baixa)
- [ ] GridLayout de exercícios no desktop (Treino da Semana)

---

## Última Atualização

`2026-05-04` — **Fix Android Profile Edit + Storage Upload**:

1. **Erro `last_username_update`** — Colunas `username` e `last_username_update` nunca existiram na tabela `profiles`. Criado SQL de migração idempotente (`supabase_add_username_columns.sql`). Schema oficial (`database_schema.sql`) atualizado. `AuthContext` blindado com safe defaults. `EditProfileModal` com retry sem a coluna se ela não existir.

2. **Erro `new row violates RLS` no upload de avatar** — Policies de Storage usavam `auth.role() = 'authenticated'` (incompatível com versões recentes do PostgREST) e as policies de SELECT foram removidas (script v2), quebrando o `upsert`. Criado `supabase_fix_storage_upload.sql` que recria tudo com `auth.uid() IS NOT NULL` e adiciona SELECT de volta. Upload code blindado com retry sem upsert.

3. **Barra de pesquisa** — Adicionada nos modais de Biblioteca de Exercícios (Workout Builder) e Criar Template (Treinos Prontos) para filtragem instantânea.
