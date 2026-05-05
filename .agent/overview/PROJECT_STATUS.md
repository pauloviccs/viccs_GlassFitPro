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
| `profiles` | Dados do usuário (nome, username, avatar_url, banner_url, bio, display_name, role: super_admin/admin/student) |
| `workout_days` | Dias de treino cadastrados por aluno (ex: "Segunda-feira") |
| `exercises` | Biblioteca de exercícios (nome, grupo muscular, vídeo, imagem, **teacher_id** — privada por professor) |
| `workout_exercises` | Pivot — exercício atribuído a um dia (sets, reps, completed, order_index) |
| `workout_templates` | Templates de treinos reutilizáveis (**teacher_id** — privados por professor) |
| `workout_template_exercises` | Pivot — exercícios que compõem o template (ordem, séries, repetições padrão) |
| `teacher_students` | **NOVO** — Vínculo professor ↔ aluno (N:N com UNIQUE constraint) |
| `teacher_requests` | **NOVO** — Solicitações de acesso como professor (status: pending/approved/rejected) |
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

### Portal Admin (Multi-Professor)

- [x] **Overview** — visão geral de alunos e métricas
- [x] **Gerenciar Alunos** — CRUD completo, atribuição de treinos, listagem inclui o avatar real do aluno
- [x] **Biblioteca de Exercícios** — CRUD com vídeo/imagem URL, **privada por professor** (teacher_id)
- [x] **Treinos Prontos (Templates)** — Criar, editar e gerenciar pacotes de treinos, **privados por professor**
- [x] **Edição de Templates** — Modal refatorado (TemplateFormModal) suporta criação e edição completa
- [x] **Planos de Treino** — criar/editar dias da semana e importar templates para o cronograma do aluno
- [x] **Perfil do Professor** — Página dedicada com avatar, nome de exibição e bio (`AdminProfile.tsx`)
- [x] **Configurações (Super Admin)** — Métricas da plataforma, aprovação/rejeição de novos professores, alteração de e-mail/senha (`AdminSettings.tsx`)

### Sistema de Roles

- [x] **3 Níveis de Acesso** — `super_admin`, `admin` (professor), `student`
- [x] **Cadastro de Professores** — Formulário público (`TeacherRegister.tsx`) cria conta + solicitação pendente
- [x] **Aprovação pelo Super Admin** — Promove role de student → admin e atualiza status da solicitação
- [x] **Sidebar dinâmica** — Mostra "Configurações" apenas para super_admin, perfil do professor na sidebar
- [x] **AuthContext refatorado** — Sem hardcode de email. Role vem 100% do banco. Flags `isSuperAdmin` e `isTeacher`

### Infraestrutura

- [x] **Auth** — Supabase Auth com roles (super_admin/admin/student), redirect automático por papel
- [x] **RLS Multi-Professor** — Exercícios e templates isolados por teacher_id com policies de CRUD
- [x] **RPCs Hardened** — `get_profile_stats` e `toggle_feed_like` com `SECURITY INVOKER`, `search_path` fixo e acesso anônimo revogado
- [x] **Storage Policies** — Buckets públicos (avatars, banners, feed_images): policies de INSERT/UPDATE/DELETE para upload autenticado
- [x] **Upload Resiliente** — `EditProfileModal` com retry automático
- [x] **Optimistic UI** — `markExerciseComplete` atualiza UI imediatamente, persiste em background
- [x] **Liquid Glass Design System** — tokens em `tailwind.config.ts` e `index.css`

---

## WIP / TODOs Conhecidos

### 🔴 Migrações Pendentes (executar no SQL Editor do Supabase)

| # | Arquivo | Prioridade | O que faz |
|---|---|---|---|
| 1 | **`migration_multi_teacher.sql`** | **CRÍTICA** | Sistema multi-professor: roles (super_admin/admin/student), teacher_id em exercises/templates, tabelas teacher_students/teacher_requests, RLS isolada por professor |
| 2 | `supabase_add_username_columns.sql` | **CRÍTICA** | Cria colunas `username` e `last_username_update` em `profiles` |
| 3 | `supabase_fix_storage_upload.sql` | **CRÍTICA** | Recria ALL storage policies com `auth.uid()` + adiciona SELECT para upsert |
| 4 | `supabase_security_fixes.sql` | Alta | Hardening v1: RLS, RPCs INVOKER, revoke anon |
| 5 | `supabase_security_fixes_v2.sql` | Média | Hardening v2: remoção de SELECT policies dos buckets públicos |

> **⚠️ IMPORTANTE:** Executar `migration_multi_teacher.sql` **PRIMEIRO** — ele redefine as roles e cria as novas tabelas. Sem essa migração, o frontend não funciona corretamente.

### 📋 Backlog

- [ ] Notificações push (feature iniciada mas com issues de config no service worker / Vercel)
- [ ] Testes automatizados (estrutura Vitest existe, cobertura baixa)
- [ ] GridLayout de exercícios no desktop (Treino da Semana)
- [ ] Sistema de vínculo professor ↔ aluno no frontend (teacher_students já existe no DB)

---

## Última Atualização

`2026-05-05` — **GlassFitPro v2: Multi-Teacher System**:

1. **Edição de Templates** — Modal refatorado para suportar criação e edição. Botão Pencil nos cards de template.
2. **Sistema de Roles** — Evolução para 3 níveis (super_admin/admin/student). AuthContext sem hardcode de email.
3. **Perfil do Professor** — Nova página `AdminProfile.tsx` com avatar, bio e nome de exibição.
4. **Registro de Professores** — Nova página `TeacherRegister.tsx` com formulário público e fluxo de aprovação.
5. **Painel de Configurações** — Nova página `AdminSettings.tsx` (super_admin) com métricas, aprovação de professores e alteração de credenciais.
6. **Biblioteca Privada** — Exercícios e templates agora possuem `teacher_id` e RLS isolada por professor.
7. **Migration SQL** — `migration_multi_teacher.sql` com todo o schema novo, RLS e dados migrados.
