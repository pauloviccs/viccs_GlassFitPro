<div align="center">
  
# 🏋️ GlassFit Pro

**Plataforma de Gestão de Treinamentos de Elite.**

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

***

</div>

## 🌟 O que é o GlassFit Pro?

O **GlassFit Pro** não é apenas mais um aplicativo de academia. É uma experiência dualística projetada para conectar Treinadores (Admins) aos seus Alunos por meio de uma interface premium, imersiva e reativa.

Nós unimos a robustez de um backend moderno com a estética arrojada do **Glassmorphism**, oferecendo um visual futurista sem sacrificar a velocidade ou a acessibilidade.

---

## 🎯 Arquitetura de Dois Mundos

O app é magicamente dividido em duas frentes após o Autenticador inteligente:

### 🎓 1. Portal do Aluno (Mobile First)

Focado no uso de "chão de fábrica" (na academia).

- **Dashboard Semanal:** O aluno entra e já vê exatamente os exercícios de *hoje*.
- **Progressão Otimista:** Cada exercício marcado como completo (Check) sincroniza instantaneamente com a base via nuvem, preenchendo a barra de progresso da semana.
- **Aprendizado Visual:** Thumbnails nítidos com Player de Vídeo embutido dentro dos botões (YouTube iframes) para executar a forma perfeita.

### 💼 2. Painel do Professor (Admin Dashboard)

Visão tática e comando administrativo para desktops.

- **Centro de Comando:** Estatísticas reais capturadas ao vivo (Total de alunos, setups ativos e taxa global de conclusão da academia).
- **Gestão de Exercícios (CRUD):** Construa sua própria biblioteca de exercícios ilimitada, subindo thumbnails e tutoriais.
- **Auditor de Máquina:** O Professor enxerga como os alunos estão indo, avaliando barra a barra, repetindo linha por linha de suas planilhas de atividade recente.

---

## 🛠️ Stack Tecnológica (Modern Web)

Construído aos moldes da modernidade web, pronto para escalar.

- **Frontend Core**: Vite + React + TypeScript
- **Design System & UI**: Tailwind CSS de baixo perfil (Configurado via Token CSS) + [shadcn/ui] (Componentes Desacoplados).
- **Animações Fluidas**: Framer Motion gerenciando drags, hovers e scale de layouts nas pontas dos dedos.
- **Data, Auth & Persistence**: Supabase – Sessões baseadas no localStorage, proteção por RLS e escalabilidade de relatórios de tabelas ligadas via Inner Join.

---

## 🚀 Setup e Instalação (Para Devs)

Quer hospedar o GlassFit Pro ou alterar seu motor?

1. **Clone do Repositório**

   ```bash
   git clone https://github.com/pauloviccs/viccs_GlassFitPro.git
   cd viccs_GlassFitPro
   ```

2. **Instalação das Dependências**

   ```bash
   npm install
   # ou
   bun install
   ```

3. **Ambiente Supabase (.env)**
   Crie um arquivo `.env.local` na raiz contendo sua base relacional:

   ```env
   VITE_SUPABASE_URL="SUA_URL_AQUI"
   VITE_SUPABASE_ANON_KEY="SUA_KEY_AQUI"
   ```

4. **Rodando Localmente**

   ```bash
   npm run dev
   ```

   > 📱 *O aplicativo inicia na porta 5173. Recomendamos usar Responsive View nas Ferramentas de Desenvolvedor na hora de checar a Rota `/student`.*

---

<div align="center">
  <i>Construído sob extrema excelência visual e código limpo por VICCS Design - Paulo Vinicios.</i>
</div>
