---
target: layout do site (frontend)
total_score: 31
p0_count: 0
p1_count: 2
timestamp: 2026-06-18T21-28-20Z
slug: development-assistant-frontend-src
---
## Design Health Score

| # | Heurística | Nota | Problema-chave |
|---|-----------|-------|----------------|
| 1 | Visibilidade do status | 3 | Loading via spinner no botão (ok); falta skeleton em tabelas/listas |
| 2 | Match com mundo real | 4 | Linguagem técnica adequada ao público dev, em pt-BR |
| 3 | Controle e liberdade | 3 | Sem desfazer/cancelar em fluxos longos; sidebar não recolhe em mobile |
| 4 | Consistência | 4 | Vocabulário de componente forte e uniforme tela a tela |
| 5 | Prevenção de erro | 3 | Sem confirmação em ações destrutivas (deletar usuário); validação inline parcial |
| 6 | Reconhecer vs lembrar | 4 | InputWithHistory/InputSelect com autocomplete por histórico é excelente |
| 7 | Flexibilidade/eficiência | 2 | Zero atalhos de teclado; sem ações em lote; nav por Tab no grid de checkboxes é lenta |
| 8 | Estético e minimalista | 3 | Forte no geral; cards de altura fixa e diff só-por-cor pesam |
| 9 | Recuperação de erro | 3 | Mensagens em pt-BR (bom), mas login não distingue causa; campos de resultado sem estado de erro |
| 10 | Ajuda e documentação | 2 | Sem ajuda contextual/tooltips explicativos; sem breadcrumbs |
| **Total** | | **31/40** | **Bom — base sólida, pontos fracos pontuais** |

## Anti-Patterns Verdict

**Não parece AI-generated.** O sistema de design (DESIGN.md) é deliberado e bem executado: uma família (Inter) em pesos firmes, teal reservado para ação/estado, sombras tingidas difusas, sem eyebrows uppercase tracked, sem gradiente em texto, sem glassmorphism decorativo. O `backdrop-filter` na sidebar e os gradientes radiais do shell têm propósito de marca, não enfeite.

**Scan determinístico (detect.mjs):** 6 achados, nenhum crítico — 1 `layout-transition` (App.tsx:108, `transition: width` na sidebar, justificável), 1 fonte mono não declarada (json-tools.tsx:99, legítima para dados), 4 drifts de cor literal (login.tsx e App.tsx:404 num maskImage). Tudo drift menor, não slop.

Os `borderLeft` em json-tools.tsx (110, 145) são 1px → **não** violam o ban de side-stripe.

## Overall Impression

Esta é uma bancada de engenheiro bem-feita. O tema é maduro e o app shell (sidebar colapsável com estado ativo, tooltips no modo estreito, grid sutil ao fundo) já está num nível alto. Os problemas não são de identidade — são de **robustez de layout**: a interface assume desktop largo e quebra fora dele, e o diff de schema (o dado mais importante de duas telas) comunica significado só por cor. A maior oportunidade: tornar o layout estruturalmente responsivo e dar ao diff um segundo canal (ícone/rótulo) além da cor.

## What's Working

1. **App shell coeso (App.tsx:186-223).** Estado ativo claro (teal + `primary.lighter`), tooltips quando recolhido, transição de 180ms. Vocabulário de nav consistente.
2. **Controles-assinatura (InputWithHistory/InputSelect).** Autocomplete por histórico do usuário reduz recall e digitação — exatamente o que um dev quer em connection strings/namespaces.
3. **Ação primária dominante.** "Carregar Tabelas" / "Comparar Bancos" são `fullWidth contained large` — o caminho primário é óbvio em cada tela.

## Priority Issues

### [P1] Significado do diff de schema/JSON depende só de cor
- **Onde:** json-tools.tsx:164,178-181,208 (e o diff de compare-database). Diferença = `warning.dark/light` + bg `alpha(warning, 0.14)`, sem ícone nem rótulo.
- **Por que importa:** Viola um princípio explícito do PRODUCT.md ("não depender de cor sozinha — diffs acompanham ícone ou texto"). Falha WCAG 1.4.1. Daltônicos e baixa-visão não distinguem o que mudou — e o diff é o produto dessas telas. Além disso, `warning.dark` sobre bg lavado fica perto do limite AA.
- **Fix:** adicionar marcador não-cromático nas linhas alteradas: um `●`/ícone à esquerda da chave, um sufixo "(alterado)" ou um peso/borda dedicada. Garantir ≥4.5:1 do texto alterado.
- **Comando:** `/impeccable colorize` (canal redundante) ou `/impeccable harden`

### [P1] Sidebar não é responsiva — rouba a tela em tablet/mobile
- **Onde:** App.tsx:96-116. `width: isSidebarOpen ? 280 : 88` é fixo; não há breakpoint que vire `Drawer` temporário/overlay. Em xs/sm a sidebar consome largura permanente e o conteúdo principal fica espremido.
- **Por que importa:** PRODUCT.md exige responsividade estrutural (sidebar colapsa). Hoje "colapsada" ainda ocupa 88px e nunca sai do fluxo. Em telas estreitas o trabalho real (formulários densos, tabelas) não cabe.
- **Fix:** abaixo de `md`, renderizar a sidebar como `Drawer` temporário acionado por um botão de menu no topo do conteúdo; manter a sidebar persistente só em `md+`.
- **Comando:** `/impeccable adapt`

### [P2] Cards com altura fixa cortam/estouram conteúdo
- **Onde:** generate-class.tsx:234 (`height: 355`) e 351-355 (`width: {md:350}, height: 355`). Card de estrutura lista 8 itens DDD em altura travada; o par esquerda(flex:1)/direita(350px fixo) desbalanceia em `md`.
- **Por que importa:** Altura fixa é frágil — fonte maior, zoom 200% (a11y) ou mais itens cortam ou geram scroll interno feio. Largura fixa 350px fica apertada no breakpoint md.
- **Fix:** trocar `height: 355` por `minHeight` (ou remover e deixar o conteúdo ditar); usar grid `{ md: "2fr 1fr", lg: "2fr 1fr" }` em vez de flex+width fixo.
- **Comando:** `/impeccable layout`

### [P2] Sem confirmação em ações destrutivas e sem atalhos para power users
- **Onde:** users.tsx (deletar/editar via modal, sem confirmação antes do delete); ausência geral de atalhos de teclado e ações em lote.
- **Por que importa:** Persona Alex (dev experiente) faz tudo no teclado e em lote; um clique-único que deleta sem confirmar é risco (Riley). O público é técnico e impaciente.
- **Fix:** diálogo de confirmação só para destrutivo (deletar usuário); considerar `Esc` para fechar modais e foco inicial no primeiro campo. Selecionar-tudo nos checkboxes de tabela em generate-class.
- **Comando:** `/impeccable harden`

### [P3] Faltam estados de erro nos campos de resultado das ferramentas
- **Onde:** cryptography-tools.tsx, base64-tools.tsx — se a mutation falha, o campo de resultado fica vazio sem sinal de erro inline (só snackbar, que some).
- **Por que importa:** Riley/primeiro-uso não sabe se a operação falhou ou se o input estava errado. O snackbar é efêmero.
- **Fix:** estado de erro persistente no campo (helperText + ícone) além do snackbar.
- **Comando:** `/impeccable clarify`

## Persona Red Flags

**Alex (power user):** zero atalhos de teclado; criar/editar usuário força modal e tira as mãos do teclado; nav por Tab no grid de checkboxes de tabelas é tediosa; sem "selecionar todas as tabelas".

**Sam (acessibilidade):** diff de schema/JSON comunica só por cor (1.4.1); `warning.dark` em texto pequeno sobre lavado fica no limite AA; IconButtons de ação sem `aria-label` garantido; em zoom 200% os cards de altura fixa cortam conteúdo.

**Riley (edge cases):** cards de altura fixa estouram com muitos itens/fonte grande; campos de resultado das ferramentas não mostram erro inline; login não distingue "usuário não encontrado" de "senha incorreta"; tabelas longas sem skeleton no carregamento.

## Minor Observations

- Sem breadcrumbs — aceitável com 7 itens de nav, mas deep-link em fluxos de 2 passos (gerar → selecionar tabelas) perde contexto.
- Loading usa spinner; trocar por skeleton em tabelas/listas seria mais condizente com o register product.
- Chips de resumo de ação em generate-class são ótimos; replicar em compare-database.
- 4 drifts de cor literal (login.tsx, App.tsx:404): mover para tokens ou documentar no DESIGN.md.
