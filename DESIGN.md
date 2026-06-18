---
name: Development Assistant
description: Gerador de código C# multi-banco com interface web — a bancada do engenheiro.
colors:
  instrument-teal: "#147d6f"
  instrument-teal-light: "#39a892"
  instrument-teal-dark: "#0b594f"
  instrument-teal-wash: "#dff6ef"
  instrument-teal-dim: "#55c7ad"
  oxblood: "#b23a48"
  oxblood-wash: "#fde8ea"
  ink: "#202a26"
  muted-ink: "#64706b"
  surface: "#ffffff"
  canvas: "#f7f9fb"
  error: "#d92d20"
  warning: "#b7791f"
  info: "#2f80a7"
  success: "#17855f"
  dark-ink: "#f4f2ee"
  dark-muted-ink: "#b9b6ae"
  dark-surface: "#1f1f1f"
  dark-canvas: "#101010"
typography:
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.12
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 760
    lineHeight: 1.28
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "18px"
components:
  button-primary:
    backgroundColor: "{colors.instrument-teal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "9px 18px"
  button-primary-hover:
    backgroundColor: "{colors.instrument-teal-dark}"
    textColor: "{colors.surface}"
  button-outlined:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "9px 18px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  chip:
    rounded: "{rounded.md}"
    textColor: "{colors.ink}"
---

# Design System: Development Assistant

## 1. Overview

**Creative North Star: "The Engineering Workbench"**

Esta é a bancada do engenheiro, não uma vitrine. A superfície é limpa e as ferramentas estão à mão: cada tela tem um instrumento principal (gerar, comparar, copiar) que domina a hierarquia, e tudo o mais recua para servir esse trabalho. O teal de instrumento é a cor da precisão — aparece onde há ação, seleção e estado ativo, nunca como enfeite. A densidade é deliberada: mostramos colunas, chaves, diffs e contagens que o desenvolvedor precisa para decidir, sem o entulho cinza-sobre-cinza do enterprise datado.

O sistema é construído sobre MUI 7 com tipografia Inter de pesos firmes, cantos suavemente arredondados (8px) e um fundo em gradiente quase imperceptível que separa o conteúdo flutuante do plano de trabalho. A confiança vem da previsibilidade — o mesmo botão, o mesmo controle de formulário, o mesmo vocabulário de estado de tela em tela — não da surpresa. Light e dark são pares de primeira classe; ambos carregam a mesma marca e ambos devem atingir contraste AA.

O que este sistema explicitamente rejeita: o **SaaS genérico com firula** (heros gigantes, gradientes decorativos, eyebrows tracked, cards idênticos repetidos); o **enterprise pesado e datado** (denso ao ponto de confundir, visual anos 2000); o **brinquedo colorido demais** (excesso de cor, cantos infantis, emojis); e o **minimalismo anêmico** (cinza-claro sem contraste nem hierarquia). A personalidade vem da tipografia, do teal e da hierarquia bem resolvida — não de ornamentos.

**Key Characteristics:**
- Uma ação primária por tela, dominando a hierarquia visual.
- Teal de instrumento reservado para ação, seleção e estado — nunca decoração.
- Densidade a serviço da decisão técnica; tabelas e diffs podem correr densos.
- Vocabulário consistente de componente e de estado em todas as telas.
- Light e dark equivalentes, ambos em alvo WCAG AA.

## 2. Colors

Uma paleta sóbria de instrumento: teal de precisão sobre neutros frios quase-brancos, com um oxblood raro para o que é destrutivo ou de alerta.

### Primary
- **Instrument Teal** (`#147d6f` light / `#55c7ad` dark): a cor da ação e do estado ativo. Botões primários, link/seleção corrente, foco de campo (como glow), cabeçalho de tabela tintado, indicadores de sucesso de operação. É o instrumento de precisão da bancada — sua presença sinaliza "aqui se age".
- **Instrument Teal — Light/Dark/Wash** (`#39a892`, `#0b594f`, `#dff6ef`): degraus do mesmo teal para hover (escurece para `#0b594f` no contained), realces e fundos lavados (`#dff6ef` no wash de cabeçalho/seleção).

### Secondary
- **Oxblood** (`#b23a48` light / `#f07883` dark): acento raro e sério para ações destrutivas, ênfase de alerta e o lado "removido/só no banco A" de um diff. Wash `#fde8ea` para fundos de alerta sutis. Nunca usado por estética.

### Neutral
- **Ink** (`#202a26` light / `#f4f2ee` dark): texto primário. O tom escuro do light mode carrega um leve verde do hue da marca, não um preto neutro.
- **Muted Ink** (`#64706b` light / `#b9b6ae` dark): texto secundário, rótulos, legendas. **Ponto de vigilância de contraste** — ver Regra Nomeada abaixo.
- **Surface** (`#ffffff` light / `#1f1f1f` dark): fundo de cards, papéis, campos.
- **Canvas** (`#f7f9fb` light / `#101010` dark): o plano de trabalho. Renderizado como gradiente vertical sutil (`#f7f9fb → #eef4f1 → #f8faf9` no light) que separa o conteúdo flutuante sem chamar atenção.

### Tertiary (estados semânticos)
- **Error** (`#d92d20`), **Warning** (`#b7791f`), **Info** (`#2f80a7`), **Success** (`#17855f`): vocabulário de estado padronizado (com variantes light/dark/wash). Sucesso compartilha a família do teal de propósito — operação concluída é a recompensa esperada da bancada.

### Named Rules
**A Regra do Instrumento.** O Instrument Teal é a voz da ação. Aparece em botões primários, seleção corrente, foco e indicadores de estado — **nunca** como cor decorativa de fundo, faixa ou enfeite. Sua raridade fora desses papéis é o que o torna legível como instrumento.

**A Regra do Tom Escuro para Texto.** Os tokens semânticos (`warning`, `info`, `error`, `success`) têm o `.main` calibrado para preenchimentos, bordas e ícones — **não** para texto pequeno sobre superfície clara. `warning.main` (`#b7791f`, 3.64:1) e `info.main` (`#2f80a7`, 4.41:1) falham AA como texto sobre branco. Para texto, use sempre o `.dark` (`warning.dark` `#80510f` = 6.77:1; `info.dark` `#1e5e7d` = 6.30:1 sobre o lavado do Alert). Chips com fundo `warning.main` carregam `contrastText: #000000` (light) / `#08110f` (dark) — texto branco sobre o amarelo-ocre é proibido (1.59–3.64:1).

**A Regra do Contraste AA.** Todo texto verifica ≥4.5:1 (corpo) ou ≥3:1 (grande). Muted Ink (`#64706b` light / `#b9b6ae` dark) está dentro de AA em todos os contextos atuais (5.16:1 sobre surface, 4.63:1 sobre o canvas tintado, AAA no dark) — mas é o limite inferior: se for empurrado mais claro "por elegância", cai abaixo de AA. Cinza-claro decorativo é proibido — é o caminho direto para o minimalismo anêmico que o produto rejeita.

## 3. Typography

**Display/Body Font:** Inter (com fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)

**Character:** Uma única família sans para tudo — headings, botões, rótulos, corpo e dados. É a escolha certa para UI de produto: sem pareamento display/body, sem fontes que competem. A personalidade vem do peso, não da variedade. Headings são firmes e pesados (800/760); o corpo é regular e tranquilo de ler.

### Hierarchy
- **Headline / h1–h2** (peso 800, 2.5rem / 2rem, line-height ~1.12–1.16): título de página/seção principal. Escala fixa em rem, não fluida — UI de produto é vista em DPI consistente.
- **Title / h3–h4** (peso 760, 1.75rem / 1.5rem, line-height ~1.22–1.28): títulos de card e de bloco.
- **Subtitle / h5–h6** (peso 720–700, 1.25rem / 1rem): subtítulos e rótulos de grupo.
- **Body** (peso 400, 1rem, line-height 1.5): texto corrido e conteúdo de formulário. Prosa limitada a 65–75ch; tabelas e dados podem correr mais densos.
- **Label / button** (peso 700, 1rem, letter-spacing 0, **sem** uppercase): rótulos de campo, texto de botão, cabeçalhos. `text-transform: none` é deliberado.

### Named Rules
**A Regra do Caixa-Baixa.** Texto de botão e rótulos são caixa-mista, nunca UPPERCASE tracked. O peso 700 carrega a ênfase. Eyebrows em maiúsculas tracked sobre seções são proibidos — é gramática de SaaS, não voz de ferramenta.

## 4. Elevation

Híbrido: uma sombra ambiente leve e difusa no repouso separa o conteúdo flutuante do canvas em gradiente, e o estado (hover, foco) reforça com elevação e glow. As sombras são grandes, suaves e de baixa opacidade — difusas, nunca duras ou escuras. A profundidade é tonal-mais-ambiente, não dramática.

### Shadow Vocabulary
- **Card ambiente** (`box-shadow: 0 8px 24px rgba(32, 42, 38, 0.08)` light / `rgba(0,0,0,0.24)` dark): repouso de cards. Difusa o bastante para sugerir flutuação, contida o bastante para ler como ferramenta, não como landing.
- **Paper elevation1** (`box-shadow: 0 6px 18px rgba(32, 42, 38, 0.06)`): superfícies de papel padrão.
- **Botão primário** (`box-shadow: 0 6px 16px rgba(20,125,111,0.18)` → hover `0 10px 22px rgba(20,125,111,0.24)` + `translateY(-1px)`): glow tingido do teal sob o botão de ação, intensificado no hover.
- **Foco de campo** (`box-shadow: 0 0 0 4px rgba(20,125,111,0.14)`): anel de glow teal ao focar input.
- **Dialog** (`box-shadow: 0 16px 44px rgba(32, 42, 38, 0.16)` light / `rgba(0,0,0,0.46)` dark): modais — mais presença que cards, sem drama.

### Named Rules
**A Regra da Sombra Difusa.** Sombras são contidas, suaves e de baixa opacidade, sempre tingidas com o verde-tinta do hue da marca (`rgba(32,42,38,...)`), nunca pretas duras. Blur na faixa de 16–24px (44px só para modais) — sombra de ferramenta, não de landing. Se a sombra parece um app de 2014, ela está escura demais e o blur pequeno demais; se parece uma página de marketing, está grande demais.

## 5. Components

Vocabulário MUI 7 ajustado para a bancada: cantos de 8px, sem uppercase, glow teal no estado ativo. Todo componente interativo carrega default, hover, focus e disabled.

### Buttons
- **Shape:** cantos suavemente arredondados (8px), `padding: 9px 18px`, peso 700, sem sombra de borda padrão.
- **Primary (contained):** fundo Instrument Teal, texto branco, glow teal difuso; no hover escurece o fundo, intensifica o glow e sobe 1px (`translateY(-1px)`).
- **Outlined:** borda neutra translúcida (`alpha(ink, 0.14)`), fundo de papel semitransparente; no hover a borda vira teal a 45% e o fundo ganha um wash teal a 8%.
- **Hover / Focus:** transições de 150–250ms; foco sempre visível.

### Chips
- **Style:** cantos de 8px, peso 700. Usados como marcadores de estado/diff, não decoração.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** Surface (`#ffffff` / `#1f1f1f`), `background-image: none` (sem gradiente fantasma do MUI).
- **Shadow Strategy:** sombra ambiente difusa (ver Elevation).
- **Border:** hairline de 1px em `alpha(ink, 0.08)` light / `0.12` dark.
- **Internal Padding:** escala `md`/`lg` (16–18px).

### Inputs / Fields
- **Style:** outlined, cantos de 8px, fundo de superfície semitransparente (branco a 78% no light).
- **Focus:** anel de glow teal (`0 0 0 4px alpha(teal, 0.14)`), transição de 160ms em box-shadow e background.
- **Select:** mesma família; fundo de superfície mais opaco (94% no light).
- **Signature — InputWithHistory / InputSelect:** campos com autocomplete a partir do histórico de inputs do usuário; o controle padrão do produto para connection strings e namespaces.

### Tables
- **Container:** borda hairline de 1px (`alpha(ink, 0.08)`).
- **Head:** texto em `text.secondary`, peso 800, fundo com wash teal sutil (`alpha(teal, 0.06)` light / `0.12` dark). Densidade alta é aceitável — é onde os diffs de schema vivem.

### Navigation / Feedback
- **Feedback:** snackbars (notistack) para sucesso/erro de operação, com variantes semânticas. Loading via indicador circular; mensagens sempre em português.
- **Dialog:** modais com borda hairline e sombra forte; reservados para confirmação real, não como primeiro recurso.

## 6. Do's and Don'ts

### Do:
- **Do** reservar o Instrument Teal (`#147d6f` / `#55c7ad`) para ação, seleção e estado — botões primários, foco, cabeçalho de tabela, indicadores de sucesso.
- **Do** verificar contraste AA: texto de corpo ≥4.5:1, texto grande ≥3:1. Para texto colorido semântico, use o tom `.dark` (`warning.dark`, `info.dark`), nunca o `.main`.
- **Do** dar a cada componente interativo os estados default, hover, focus, active e disabled — não envie metade.
- **Do** escrever estados vazios que ensinam a interface e estados de loading com skeleton/indicador, não "nada aqui".
- **Do** manter o vocabulário consistente: o mesmo botão, o mesmo controle de formulário, o mesmo estilo de ícone (MUI icons) tela a tela.
- **Do** manter mensagens de runtime em português; nomes de código e identificadores em inglês.
- **Do** respeitar `prefers-reduced-motion` com crossfade ou transição instantânea para toda animação.

### Don't:
- **Don't** parecer **SaaS genérico com firula**: sem hero gigante, sem gradiente decorativo, sem ilustração 3D, sem eyebrow tracked em maiúsculas sobre cada seção, sem grades de cards idênticos repetidos.
- **Don't** parecer **enterprise pesado e datado** (estilo Oracle/SAP antigo): denso ao ponto de confundir, cinza-sobre-cinza, tabelas ilegíveis, visual anos 2000.
- **Don't** parecer **brinquedo colorido demais**: sem excesso de cores, sem cantos super arredondados, sem emojis, sem tom infantil.
- **Don't** cair no **minimalismo anêmico**: nada de tudo cinza-claro, baixo contraste e sem hierarquia. (É também falha de acessibilidade.)
- **Don't** usar `border-left`/`border-right` maior que 1px como faixa colorida em cards, alertas ou itens de lista.
- **Don't** usar gradiente em texto (`background-clip: text`) nem glassmorphism decorativo.
- **Don't** usar UPPERCASE tracked em botões e rótulos; o peso 700 carrega a ênfase.
- **Don't** alcançar o modal como primeiro recurso — esgote alternativas inline/progressivas antes.
- **Don't** usar motion decorativo que não comunica estado, nem sequências de carregamento orquestradas; transições ficam em 150–250ms.
