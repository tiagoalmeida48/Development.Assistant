# Product

## Register

product

## Users

Desenvolvedores de uma equipe interna. Usam a ferramenta no fluxo de trabalho diário, a partir do navegador, geralmente em paralelo a um IDE e a um cliente de banco de dados. São usuários técnicos, confortáveis com connection strings, schemas e namespaces — mas nem todos construíram a ferramenta, então a interface precisa ser clara para quem chega depois. O trabalho a ser feito: introspectar o schema de um banco e gerar rapidamente um projeto C# (DDD ou Clean) em `.zip`, além de comparar schemas, copiar projetos com troca de namespace e usar utilitários pontuais (criptografia, Base64, JSON).

## Product Purpose

O Development Assistant é um gerador de código C# multi-banco com interface web. Ele lê o schema de um banco (MySQL/MariaDB, SQL Server, Oracle, PostgreSQL) e produz um projeto C# completo nos padrões DDD ou Clean Architecture, empacotado como `.zip`, eliminando o boilerplate repetitivo de Controllers/Services/Repositories/DTOs/Models. Complementa com comparação de schemas entre dois bancos, cópia de projetos com substituição de namespace em massa e ferramentas de apoio. Sucesso = o dev sai da connection string ao `.zip` gerado em poucos cliques, sem fricção e confiando no resultado.

## Brand Personality

Técnica, rápida, confiável. Voz direta e sem rodeios, em português, falando de igual para igual com quem é técnico. A interface deve transmitir confiança de especialista: eficiente, densa o suficiente para trabalho real, com o caminho primário de cada tela óbvio. Sem tom de marketing, sem comemorar o óbvio — o valor está em fazer o trabalho acontecer com previsibilidade.

## Anti-references

Não deve parecer nenhum destes:

- **SaaS genérico com firula**: hero gigante, gradientes decorativos, ilustrações 3D, eyebrows tracked sobre cada seção, cards idênticos repetidos. É uma ferramenta, não uma landing page.
- **Enterprise pesado e datado** (estilo Oracle/SAP antigo): denso ao ponto de confundir, cinza sobre cinza, tabelas ilegíveis, visual anos 2000.
- **Brinquedo colorido demais**: excesso de cores, cantos super arredondados, emojis, tom infantil — corrói a credibilidade de uma ferramenta técnica.
- **Minimalismo anêmico**: tão "clean" que perde identidade e hierarquia — tudo cinza-claro, baixo contraste, sem foco. (Também é risco direto de acessibilidade.)

## Design Principles

1. **O caminho primário é óbvio.** Em cada tela há uma ação principal (gerar, comparar, copiar); ela domina a hierarquia. Tudo o mais é secundário e não compete por atenção.
2. **Densidade a serviço do trabalho.** Mostrar a informação que o dev precisa para decidir (colunas, chaves, diffs, contagens) sem entulhar. Densidade é deliberada, nunca confusão herdada de enterprise datado.
3. **Confiança por previsibilidade.** Estados claros para erro, vazio e carregamento; mensagens em português que dizem o que aconteceu e o que fazer. O usuário nunca fica em dúvida se a operação funcionou.
4. **Identidade técnica, não decorativa.** A personalidade vem de tipografia firme, do teal da marca e de hierarquia bem resolvida — não de ornamentos. Cada elemento visual justifica sua presença pela função.
5. **Rápido percebido e real.** Feedback imediato nas ações; nada de animação que atrase o trabalho. Motion existe para orientar, não para impressionar.

## Accessibility & Inclusion

Alvo **WCAG 2.1 AA**:

- Texto de corpo com contraste ≥ 4.5:1; texto grande ≥ 3:1. Atenção especial ao cinza-claro de baixo contraste — é o risco mais provável no tema atual (texto secundário e placeholders).
- Navegação completa por teclado e foco sempre visível em todos os estados interativos.
- `prefers-reduced-motion` respeitado: toda animação tem alternativa de crossfade ou transição instantânea.
- Temas light e dark devem ambos atingir AA — não só o light.
- Não depender de cor sozinha para transmitir significado (ex.: diffs de schema, estados de sucesso/erro acompanham ícone ou texto).
