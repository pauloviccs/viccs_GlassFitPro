# 🏗️ Work Order & Design Spec: VICCS - GlassFit Pro

**Status:** Approved for Implementation
**Architecture Mode:** Frontend-Only (State Simulation)
**Vibe:** Apple "Liquid Glass" / Premium SaaS

---

## 1. Core Architecture & Routing (North Star)

O app é dividido em dois ecossistemas completamente isolados no nível de layout e interação, compartilhando apenas o Design System e componentes atômicos.

* **`app/(student)`**: Mobile-First absoluto. Remove qualquer atrito. Missão única: começar e terminar o treino do dia.
* **`app/(admin)`**: Desktop SaaS-First. Focado em produtividade. Missão única: escalar a criação e gestão de alunos/treinos.

---

## 2. Mental Models & UX Flow

### Aluno (Consumo e Execução)

* **A "Regra de 3 Segundos":** A tela inicial (Home) exibirá gigantescamente o **Treino de Hoje** com um botão imenso `[ INICIAR TREINO ]`. O fluxo da semana fica acessível apenas pelo scroll, reduzindo a carga cognitiva inicial.
* **Padrão de Interação:** Tátil e fluído. Sem checkboxes pequenos.
  * *Swipe to Complete:* Deslizar o card para a direita para marcar conclusão.
  * *Large Tap:* Áreas de toque generosas para confirmar séries.
* **Hierarquia Visual:** 1 CTA Primário por tela (ex: "Iniciar Treino", "Confirmar Série"). Todo o ruído desaparece durante a execução do exercício.

### Professor (Gestão e Criação)

* **Padrão de Interação:** UI densa e eficiente (Grids, Tabelas, Drag-and-Drop).
* **Desempenho (Future Proofing):** O painel de criação (*Weekly Training Builder*) usará virtualização de listas e paginação local desde o Dia 1 para evitar travamentos com 200+ exercícios no DOM.
* **Kill Your Darlings (V1 Core):** O foco é `Criar treino -> Atribuir treino -> Aluno Executa -> Marcar progresso`. Funcionalidades periféricas (Content Library pesada, uploads multi-media avançados) estão adiadas para pós-V1 para focar no fluxo principal.

---

## 3. Data & State Management

**Source of Truth:** Como o app é frontend-only na V1, o estado será gerenciado com rigor para transição futura indolor.

* **Store Central:** Zustand.
* **Simulação Realista:** Criação de React Hooks dedicados (ex: `useFetchWorkout`, `useUpdateProgress`) que internamente retornam Promises com `setTimeout`.
* **Zero Espaguete:** Nada de estado global mutável espalhado por componentes isolados. Toda ação passa pela Store/Hooks.

---

## 4. O Sistema "Liquid Glass" & Acessibilidade

O visual será premium, mas sem sacrificar usabilidade. A matemática do vidro será controlada por Design Tokens customizados no Tailwind.

### Estilo e CSS

* `backdrop-blur-xl` com backgrounds calculados: `bg-white/10` (Light Mode) ou `bg-black/20` (Dark Mode).
* **Glass Safe Zones:** Todo texto em cima do vidro terá contraste AAA com o fundo imediato. Se o vidro vazar para um fundo muito claro/escuro, um *overlay gradient* sutil atuará como fallback.
* **Design Tokens (Tailwind):**
  * `bg-glass-surface`
  * `bg-glass-elevated`
  * `bg-glass-safe-zone`

### Acessibilidade (Grandma Test)

* **Hit Targets:** O mínimo absoluto para áreas clicáveis no mobile será `44x44px`.
* **Contraste:** Garantia de AA/AAA na leitura de métricas, séries e repetições.
* **Acessibilidade de Teclado:** O painel Admin será 100% navegável por TAB/Enter.

---

## 5. UI States: Edge & Happy Paths

Nunca haverá uma "tela branca" ou pulos bruscos no layout.

* **Loading State:** *Glass Skeletons* elegantes que piscam de forma fluída (easing natural, não pulsante agressivo).
* **Empty State (Aluno):** Se o professor não montou o treino, a tela será empática e encorajadora (ex: *"Sem treino hoje. Dia de descanso? O músculo cresce agora."*).
* **Success Feedback:** Micro-interações ao finalizar exercícios.
* **Error State:** Tolerância a falhas na simulação assíncrona com *toasts* elegantes.

---

## 6. Integração Frontend (ShadCN)

* **Fundação:** ShadCN UI e Radix formam a base acessível e de comportamento dos componentes complexos (Modais, Dropdowns, Selects).
* **Camada Visual:** O estilo padrão do ShadCN será ejetado ou sobrescrito impiedosamente. O app **não** deve parecer um painel administrativo padrão usando Tailwind. Todas as primitivas receberão o tratamento *Liquid Glass*.

---

*Gerado por The Universal Engineer (UEoE)*
