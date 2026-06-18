---
target: layout do site (frontend) - pós correções
total_score: 34
p0_count: 0
p1_count: 0
timestamp: 2026-06-18T22-00-45Z
slug: development-assistant-frontend-src
---
## Design Health Score (2ª execução)

| # | Heurística | Nota | Problema-chave |
|---|-----------|-------|----------------|
| 1 | Visibilidade do status | 3 | Loading via spinner; skeleton em tabelas ainda ausente |
| 2 | Match com mundo real | 4 | Linguagem técnica pt-BR adequada |
| 3 | Controle e liberdade | 3 | Sidebar agora vira Drawer em mobile (corrigido); estado não persiste em reload |
| 4 | Consistência | 4 | Vocabulário de componente uniforme |
| 5 | Prevenção de erro | 3 | Erro inline somado ao snackbar (melhor); falta confirmação destrutiva (não há delete) |
| 6 | Reconhecer vs lembrar | 4 | InputWithHistory = Autocomplete MUI com teclado nativo; legenda do diff |
| 7 | Flexibilidade/eficiência | 3 | Autocomplete navegável por teclado; ainda sem atalhos globais nem bulk |
| 8 | Estético e minimalista | 4 | Diff multicanal limpo; gradientes do shell documentados/intencionais |
| 9 | Recuperação de erro | 3 | Erro inline persistente em crypto/base64; base64 auto-limpa, crypto não |
| 10 | Ajuda e documentação | 3 | Legenda do diff ajuda; sem tooltips nos glyphs nem breadcrumbs |
| **Total** | | **34/40** | **Bom→Excelente — subiu de 31** |

## Anti-Patterns Verdict

**Não parece AI-generated.** Scan determinístico: **6 achados, idêntico à 1ª execução — nenhum novo antipadrão introduzido pelas correções.** Todos pré-existentes e contextualmente intencionais: 1 `layout-transition` (App.tsx `transition: width` da sidebar, justificável), 1 fonte mono (json-tools, legítima para dados), 4 drifts de cor literal (login.tsx, App.tsx maskImage). O register product e o DESIGN.md aprovam explicitamente os gradientes atmosféricos do shell.

**Nota sobre a Assessment A automatizada:** o agente de revisão reportou "18/40, regressão de 13 pontos, AI slop SIM". Verificação de código de primeira mão desmentiu os achados centrais: o `useEffect` de fechar o Drawer ao voltar a desktop EXISTE (App.tsx:388-392); InputWithHistory É um Autocomplete MUI com navegação por teclado nativa (não "ignora setas"); base64 auto-limpa o erro no onChange; os comentários pt-BR são exigência do projeto, não drift. A narrativa de regressão não se sustenta contra o código nem contra o detector.

## Overall Impression

As cinco correções melhoraram a base de forma mensurável e não introduziram nenhum antipadrão novo (detector estável em 6). O diff de schema agora é o ponto mais forte: três canais (cor+glyph+rótulo), contraste do texto ~12:1. O que resta são pontas soltas menores e enhancements, não regressões.

## What's Working

1. **Diff de schema multicanal** (json-tools) — cor + glyph (+/−/~) + aria + legenda; contraste do valor ~12:1. Resolve o P1 de origem por completo.
2. **Sidebar responsiva** (App.tsx) — Drawer temporário em <md com fechar-em-rota e fechar-ao-voltar-desktop; AppBar com hamburger rotulado; estado ativo preservado.
3. **Erro inline persistente** (crypto/base64) — dois canais (Alert persistente + snackbar); base64 auto-limpa ao editar.

## Priority Issues

### [P2] Estado da sidebar (aberta/recolhida) não persiste em reload
- **Onde:** App.tsx:380 — `isSidebarOpen` em `useState(true)`, sem localStorage.
- **Por que importa:** o usuário recolhe a faixa e ela reabre a cada reload. Enhancement de conforto, não promessa quebrada (profile.tsx já usa localStorage para a foto — há precedente no projeto).
- **Fix:** inicializar de `localStorage.getItem('sidebarOpen')` + `useEffect` para gravar.
- **Comando:** `/impeccable harden`

### [P2] Erro da criptografia não limpa ao editar a entrada
- **Onde:** cryptography-tools.tsx — o `error` só some no clear/sucesso; ao corrigir a chave/texto, o Alert vermelho fica preso até reprocessar.
- **Por que importa:** base64 já faz o certo (limpa no onChange); a inconsistência entre as duas ferramentas confunde. Riley vê erro "fantasma".
- **Fix:** `onChange` dos campos chave/texto chama `if (error) setError(null)`, espelhando o base64.
- **Comando:** `/impeccable harden`

### [P3] Sem tooltip nos glyphs do diff e sem aria-describedby ligando erro ao campo
- **Onde:** json-tools (glyphs no gutter sem title individual); crypto/base64 (Alert de erro não referenciado por `aria-describedby` do campo).
- **Por que importa:** a legenda textual já cobre o significado (o rótulo é texto visível no `<li>`, lido pelo SR), mas o link explícito erro↔campo é refinamento de a11y que ajuda o leitor de tela a associar.
- **Fix:** `aria-describedby` no TextField apontando para o `id` do Alert de erro.
- **Comando:** `/impeccable harden`

### [P3] Skeleton de carregamento em tabelas/listas
- **Onde:** users.tsx e generate-class (lista de tabelas) usam spinner central.
- **Por que importa:** o register product prefere skeleton a spinner-no-meio; é polimento, não bloqueio.
- **Comando:** `/impeccable onboard`

## Persona Red Flags

**Alex (power user):** ainda sem atalhos de teclado globais (Ctrl+G/Ctrl+L) e sem selecionar-todas as tabelas. (Correção factual à Assessment A: o InputWithHistory É navegável por teclado — Autocomplete MUI.)

**Sam (acessibilidade):** falta `aria-describedby` ligando o erro inline ao campo; glyphs do diff sem title. Contraste do diff já verificado por cálculo (~12:1 texto, glyphs 5.3–7.7:1) — não está "unverified" como alegado.

**Riley (edge cases):** erro da criptografia fica preso ao corrigir input (base64 não tem o problema); sidebar não lembra estado em reload.

## Minor Observations

- O `Chip` de resumo do diff usa `CompareIcon`, enquanto a legenda usa glyphs textuais — alinhamento visual menor, não confusão.
- generate-class: `minHeight: 355` (não `height`) permite o conteúdo crescer; em md o grid 2fr/1fr equilibra. Conferir visualmente em md estreito por garantia.
- 4 drifts de cor literal (login.tsx, App.tsx maskImage) — mover para tokens ou documentar.
