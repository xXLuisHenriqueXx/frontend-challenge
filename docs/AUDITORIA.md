# Auditoria final — Kurio NFT Marketplace

Diagnóstico de 06/11/2026 para o código entregue. Esta versão substitui os checklists históricos das etapas anteriores. ✅ significa evidência local suficiente no escopo indicado; ⚠️ indica avaliação parcial ou limite justificado; ❌ indica requisito ainda não entregue. Aprovação local não equivale a deploy ou a inspeção humana.

## Ambiente e reprodução

Windows 11, Node 24.14.0, npm 11.21.0, Vite 8.3.6, Playwright 1.65.0, Chromium 158.0.8127.18, Lighthouse 13.6.0 e axe-core 4.14.0. Lockfile de instalação: package-lock.json. Mocks ativos no build otimizado; cenário padrão success/120 ms nas medições. Estação compartilhada, sem isolamento de CPU/memória; comandos de verificação executados sequencialmente.

Instalação limpa: fontes copiadas para `.verification/clean` sem node_modules, seguidas de `npm ci --prefer-offline --no-audit --no-fund` (exit 0, 614 pacotes). O cache npm apenas fornece tarballs verificados pelo lockfile; dependências instaladas do zero. Chromium já instalado foi indicado por PLAYWRIGHT_BROWSERS_PATH absoluto. A cópia isolada evita interromper servidores previamente abertos no workspace. Documentação, código, assets e configurações de produção correspondem aos arquivos entregues; relatórios Lighthouse incluem hash SHA-256 dos inputs.

Verificação final do build otimizado: **48 testes Playwright aprovados em 5,7 minutos**, exit 0, sem atualizar referências e sem retries. São 28 testes funcionais, dois percursos com oito comparações visuais e 18 de acessibilidade em 390/768/1440. As oito comparações terminaram sem pixels diferentes; 33 análises axe não encontraram violações nas regras configuradas. Typecheck passou na instalação limpa e no workspace original; lint passou na instalação limpa. Build incluiu o worker e terminou com aviso de chunk >500 kB. A comparação detectou uma referência desktop cortada, que foi revisada/corrigida antes desta execução aprovada.

Verificações complementares na mesma instalação limpa: **60 verificações REST e 17 de Socket.IO aprovadas**, ambas com exit 0. Logs e registro dos comandos: [reports/verification](../reports/verification/summary.json).

Comandos: [README](../README.md), [TESTES.md](TESTES.md), `scripts/run-e2e.mjs` e `scripts/run-lighthouse.mjs`. Preview próprio é encerrado pelos executores; nenhuma API privada é necessária.

## 1. Escopo, stack e execução

| Requisito                             | Status | Evidência / limite                                                                                                                                                |
| ------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React e TypeScript efetivos           | ✅     | app.tsx, componentes TSX, contratos e typecheck                                                                                                                   |
| TanStack Router                       | ✅     | Rotas, busca tipada, guardas, returnTo e routeTree gerada                                                                                                         |
| Query + Axios + REST                  | ✅     | api/client.ts e hooks.tsx; consultas/mutations reais nos testes                                                                                                   |
| Socket.IO efetivo                     | ✅     | socket.io-client no navegador, binding MSW, handshake e eventos transportados                                                                                     |
| Tailwind e shadcn                     | ✅     | styles.css, components/ui e componentes das telas; detecção de classes restrita a src                                                                             |
| MSW único backend simulado            | ✅     | mocks/handlers.ts, browser.ts e socket.ts; nenhuma server function/API route de simulação                                                                         |
| Playwright e Lighthouse executáveis   | ✅     | Configurações, scripts, PNGs e relatórios HTML/JSON                                                                                                               |
| Decisão SPA/SSR                       | ✅     | SPA Vite/Router documentada em DECISOES e ARQUITETURA; código recebido já usava esse modo. TanStack Start/SSR não é tecnologia obrigatória na tabela do enunciado |
| Build de demonstração com mocks       | ✅     | main.tsx aguarda MSW antes de montar React; public/mockServiceWorker.js incluído no dist                                                                          |
| Sem backend privado / blockchain real | ✅     | Arte, dados, worker e transporte locais; recibo identifica transação simulada                                                                                     |

## 2. Telas e descoberta

| Requisito                              | Status | Evidência / limite                                                                                                                     |
| -------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Nove telas previstas                   | ✅     | Início, detalhe, carrinho, pagamento, recibo, login, cadastro, perfil e carteiras; E2E/axe                                             |
| Busca e filtros combinados             | ✅     | URL/API com q, coleção, rede, categoria, faixa de preço; handlers e teste de combinação                                                |
| Ordenação, paginação e reset da página | ✅     | UI desktop/mobile; E2E verifica produto/preço e aria-current após navegação                                                            |
| Refresh e histórico dos parâmetros     | ✅     | Router valida search; teste back/forward e restauração dos controles                                                                   |
| Vazio, falha e resposta fora de ordem  | ✅     | Cenários empty/http-500/out-of-order; chaves completas e AbortSignal; E2E observa resultado final e retry                              |
| Detalhe direto e inexistente           | ✅     | /product/1 e recurso inexistente exercitados em Chromium                                                                               |
| Galeria, informações e edição          | ✅     | Imagem principal, miniaturas no desktop, dados/edição retornados pela API; fixture contém uma edição válida                            |
| Limite e disponibilidade por edição    | ✅     | Controles limitados por stock e validação final no handler; testes de limite/esgotamento                                               |
| Favorito autenticado e persistente     | ✅     | REST por usuário, mutation otimista, falha/rollback e nova tentativa na UI                                                             |
| Ações auxiliares coerentes             | ✅     | Fluxos fora do escopo desativados ou links de navegação; opções da carteira levam ao gerenciamento; explorador explicitamente simulado |

## 3. Carrinho, pagamento e recibo

| Requisito                                               | Status | Evidência / limite                                                                                |
| ------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| Adicionar, alterar e remover NFT/edição                 | ✅     | API/cart e hook serializado por usuário; E2E verifica quantidade/remoção e resultado REST         |
| Estoque e quantidade inteira                            | ✅     | Validação nos handlers e controles da UI; resposta de conflito não aparenta sucesso               |
| Persistência e merge visitante/login                    | ✅     | Banco mock persistido; soma por NFT/edição até estoque; refresh/login exercitados                 |
| Cupom aplicar/remover/inválido/expirado                 | ✅     | KURIO10, cenários de erro e cotação autoritativa; E2E e integração REST                           |
| Subtotal/desconto/taxa/total exatos                     | ✅     | Strings decimais, BigInt em 10⁻¹⁸ ETH; testes de totais e nenhuma aritmética binária monetária    |
| Atualização de preço/estoque aberta                     | ✅     | nft.updated invalida dados e mostra aviso; UI/REST conferidos no checkout                         |
| Dados obrigatórios do coletor em todas as larguras      | ✅     | AccessibleForm e validação de collector no mock; axe e compra em 390/1440                         |
| Carteiras salvas, rede e conexão/recusa/desconexão      | ✅     | wallets e wallet-connection via API; validações e cenários documentados/testados                  |
| Revisão e revalidação antes de comprar                  | ✅     | Fingerprint, preflight REST e validação final do quote; preço novo exige nova revisão             |
| Esgotamento bloqueia envio                              | ✅     | Cotação com erro invalida revisão e desabilita envio, mesmo havendo dados antigos em cache        |
| Clique repetido não duplica                             | ✅     | Trava síncrona e requisição POST única observada em E2E                                           |
| Timeout recupera mesma compra                           | ✅     | Chave e corpo persistidos por usuário; após refresh, reenvio exato e estoque decrementado uma vez |
| Pendente/confirmado/recusado                            | ✅     | Estados vêm do pedido; E2E confirma sucesso/recusa e preserva pedido pendente para retomada       |
| Confirmação somente após simulação                      | ✅     | URL contém apenas orderId; heading e aviso de socket observados após estado confirmado            |
| Falhas preservam itens e confirmação remove só comprado | ✅     | E2E recusa + integração para acréscimos posteriores; efeito de confirmação aplicado uma vez       |
| Recibo imutável                                         | ✅     | Quote/carteira em snapshot; mudança de catálogo e refresh preservam valores no E2E                |
| Referências simuladas explícitas                        | ✅     | transactionId simulated-*, aviso de simulação e referência de explorador desativada               |

## 4. Conta, sessão e integração

| Requisito                                        | Status | Evidência / limite                                                                                                         |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Cadastro, conflito e validação                   | ✅     | API/AccessibleForm, cenário register-conflict, teste REST e E2E de criação                                                 |
| Login/logout e sessão recuperável                | ✅     | Token persistido, guarda e clearPrivate; testes de refresh e troca de conta                                                |
| Expiração e contexto para retomada               | ✅     | 401, returnTo interno, draft/tentativa por usuário; APIs de expiração e testes                                             |
| Proteção de recursos privados                    | ✅     | Guardas + autorização nos handlers de favoritos, perfil, carteiras, quote e pedidos                                        |
| Isolamento entre usuários                        | ✅     | Chaves privadas por userId, token no transporte, cancelamento e cleanup; E2E alterna Ana/Bruno e confere dados restaurados |
| Perfil/avatar/senha persistidos                  | ✅     | Arquivo PNG/JPEG/WebP ≤1 MB, campos e senha atual validados; refresh e novo login exercitados                              |
| Carteiras principal/secundária                   | ✅     | Cadastro/edição, ordem estável, limite de duas, endereço/rede validados; E2E persiste ambas                                |
| Credenciais fictícias sem senha clara persistida | ✅     | Contas de teste e SHA-256 com salt; teste inspeciona persistência. Não é autenticação de produção                          |
| Contratos tipados e estados remotos              | ✅     | contracts.ts, Query options, loading/vazio/erro/sucesso/background e mensagens acessíveis                                  |
| Chaves por usuário/parâmetros e cancelamento     | ✅     | AbortSignal em GET/quote, remoção de cache privado, interceptor ignora erros de sessão substituída                         |
| Retry sem duplicar mutations                     | ✅     | Uma repetição de consultas de rede/5xx; mutations sem retry automático; pedido idempotente                                 |
| Política de cache e otimismo                     | ✅     | staleTime/gcTime, invalidação e rollback documentados/testados                                                             |
| 404 e acesso direto local                        | ✅     | Root notFound e fallback Vite; rotas diretas exercitadas pelo E2E. Host público ainda não validado                         |

## 5. REST, mocks e tempo real

| Requisito                                         | Status | Evidência / limite                                                                                                   |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| Recursos REST mínimos completos                   | ✅     | Sessão, NFTs, favoritos, carrinho, quote, pedidos, perfil/senha e carteiras em API.md                                |
| Erros 400/401/403/404/409/422/503 e rede          | ✅     | Envelope tipado com fields; cenários e integração exercitam autorização/conflito/validação                           |
| Idempotência por usuário/corpo                    | ✅     | Mesma tentativa recupera pedido; corpo diferente gera 409; teste REST e timeout E2E                                  |
| Fixtures variadas e dois usuários                 | ✅     | 36 NFTs, nove coleções, três redes, preços/categorias/estoques variados, Ana/Bruno                                   |
| Estado único REST/eventos e reset integral        | ✅     | database.ts, save/reset e events; controles de teste atuam só nos mocks                                              |
| Cenários de sucesso, vazio e falhas reproduzíveis | ✅     | Tabela completa no README/API, incluindo lentidão, timeout, sessão, cupom, preço, estoque e recusa                   |
| MSW também no Socket.IO                           | ✅     | toSocketIo/ws.link e cliente real; WebSocket exclusivo, heartbeat, subscribe/ready documentados                      |
| nft.updated e order.updated                       | ✅     | Eventos publicados pelas mutations/liquidação e recebidos pelo cliente da aplicação                                  |
| Identidade/versão e duplicatas/antigos            | ✅     | eventId/resourceId/version e eventGate; cenários transportam duplicatas e payload antigo diferente                   |
| Estados terminais não regridem                    | ✅     | Gate e comparação com cache; evento antigo pending após confirmação não regride recibo                               |
| Reconexão e reconciliação REST                    | ✅     | ready invalida recursos ativos; polling é fallback, não substituição do socket                                       |
| Interrupção com pedido pendente                   | ✅     | pending-orders + socket-offline; refresh recupera mesmo ID e não compra novamente                                    |
| Eventos de sessão anterior e cleanup              | ✅     | Token por ciclo, filtros por proprietário, encerramento de listeners/timers/subscriptions; teste de troca de usuário |
| Limitações do transporte                          | ✅     | MOCKS.md explicita ausência de fallback Engine.IO polling, multiaba coordenada, rooms/namespaces/binários            |

## 6. Visual, responsividade e acessibilidade

| Requisito                                       | Status | Evidência / justificativa                                                                                                                             |
| ----------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identidade/composição existentes preservadas    | ✅     | Mesma arte, tipografia monoespaçada, cores e layouts; revisão das capturas identificou/corrigiu dimensões do carrinho                                 |
| Fidelidade completa ao Figma e assets originais | ⚠️     | Figma não acessível; comparação limitada ao código e docs/design. A mesma arte local continua reutilizada em NFTs/editorial; substituição documentada |
| Desktop/tablet/mobile                           | ✅     | Fluxos 390/1440 e matriz axe/reflow em 390/768/1440; formulários privados funcionam no mobile                                                         |
| Skeletons/shimmer/reduced motion                | ✅     | Catálogo, detalhe e resumo; estado busy e preferência de movimento testados                                                                           |
| Dimensões e layout shift                        | ✅     | NftImage reserva dimensões; CLS de início/detalhe registrado nas 12 medições. Isso não mede CLS durante toda interação de compra                      |
| Teclado/foco/diálogo                            | ✅     | Skip link, foco por rota/remoção, Tab/Shift+Tab, Escape e retorno, tabs e favorito via teclado                                                        |
| Semântica, labels e erros associados            | ✅     | Main/h1, forms, aria-invalid/describedby e foco no primeiro erro; axe nas nove telas                                                                  |
| Alt e decoração                                 | ✅     | Nomes de NFTs/controles e imagens decorativas ocultas semanticamente                                                                                  |
| Contraste e seleção além de cor                 | ✅     | Ajustes calculados em DECISOES e axe; coração/texto/bordas/sublinhado                                                                                 |
| Feedback acessível de mutations/eventos         | ✅     | alert/status e região persistente, sem duplicação de anúncios de refetch                                                                              |
| Reflow/overflow equivalente a zoom 200%         | ✅     | Metade da largura CSS em nove telas e recibo; testes automatizados                                                                                    |
| Inspeção humana, zoom nativo e leitor de tela   | ⚠️     | Não realizados. Skill Browser retornou “No browser is available” e lista vazia; automação não substitui essas avaliações                              |
| Assets/fontes locais                            | ✅     | PNG original preservado, derivados WebP reproduzíveis, SVGs/worker locais; fontes/funcionalidades não foram simplificadas para auditoria              |

## 7. Playwright — todos os itens da seção 9

| Item do enunciado                                 | Status | Evidência                                                                                          |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| 1. Busca/filtros/ordenação/paginação/histórico    | ✅     | marketplace.spec.ts, desktop/mobile                                                                |
| 2. Detalhe direto/inexistente                     | ✅     | marketplace.spec.ts                                                                                |
| 3. Cadastro/login/expiração/logout/troca          | ✅     | Cadastro e isolamento com sessão expirada                                                          |
| 4. Favoritos e rollback                           | ✅     | favorite-failure e nova tentativa                                                                  |
| 5. Carrinho/quantidade/remoção/cupom/persistência | ✅     | Totais na UI e resultado REST após refresh/login                                                   |
| 6. Compra completa até recibo                     | ✅     | Catálogo → confirmação por API/socket                                                              |
| 7. Recusa/clique repetido/timeout                 | ✅     | Preservação de itens, POST único e reenvio idempotente após refresh                                |
| 8. Perfil/avatar/senha/carteiras                  | ✅     | Validação e persistência, principal/secundária                                                     |
| 9. Preço/disponibilidade por socket no checkout   | ✅     | Eventos disparados pelo mock e aviso/cotação na UI                                                 |
| 10. Duplicatas/antigos/desconexão/retomada        | ✅     | Cenários MSW, terminalidade e mesmo pedido recuperado                                              |
| 11. Teclado/foco/validação                        | ✅     | accessibility.spec.ts em três larguras                                                             |
| 12. Skeleton/falha/retry                          | ✅     | Cenários slow/http-500, busy, reduced motion e recuperação                                         |
| Oito referências visuais versionadas              | ✅     | Início/detalhe/carrinho/pagamento em 390/1440, com dados/relógio estáveis e animações desativadas  |
| Isolamento, HTML e traces                         | ✅     | Contexto novo/reset por teste, sem sleeps, retries zero, HTML e retain-on-failure                  |
| Asserções na UI/resultados e transporte real      | ✅     | Axios/MSW/socket.io-client; sem setters/cache ou respostas de negócio substituídas pelo Playwright |

## 8. Lighthouse, otimizações e metas

| Página/perfil   | Performance | Accessibility | Best Practices | SEO | LCP (ms) |    CLS | TBT (ms) | Meta               |
| --------------- | ----------: | ------------: | -------------: | --: | -------: | -----: | -------: | ------------------ |
| Início mobile   |          53 |           100 |             96 | 100 |   4809.8 | 0.0000 |   3332.5 | ⚠️ Performance <90 |
| Início desktop  |          73 |           100 |             96 | 100 |   1215.5 | 0.0000 |    608.5 | ⚠️ Performance <90 |
| Detalhe mobile  |          58 |           100 |             96 | 100 |   4955.6 | 0.0000 |   1124.5 | ⚠️ Performance <90 |
| Detalhe desktop |          96 |           100 |             96 | 100 |   1169.7 | 0.0000 |     85.5 | ✅                 |

**12 medições concluídas, três por combinação; metas globais não atingidas**. Accessibility, Best Practices e SEO atingem suas metas nas quatro combinações. Performance fica abaixo de 90 no início mobile/desktop e no detalhe mobile. Relatórios: [índice HTML/JSON](../reports/lighthouse/README.md), [summary.json](../reports/lighthouse/final/summary.json). Hash das fontes confere entre a cópia auditada e o workspace entregue. Coleta terminou com exit 0 e sem warnings do Lighthouse.

Causas observáveis: no [início mobile, execução 2](../reports/lighthouse/final/home-mobile-2.html), long-tasks registra 2446 ms sem atribuição e 499 ms em app; no [início desktop, execução 2](../reports/lighthouse/final/home-desktop-2.html), 547 ms sem atribuição e 145 ms em app; no [detalhe mobile, execução 3](../reports/lighthouse/final/detail-mobile-3.html), 498 ms sem atribuição e 261 ms em client. Esse bloqueio e o caminho crítico do bootstrap explicam a penalização observada de TBT/LCP. A origem exata da parcela Unattributable permanece indeterminada; não foi atribuída artificialmente a uma função.

O detalhe desktop teve notas individuais 96/97/59; a terceira execução contém tarefa sem atribuição de 7576 ms. Ela foi mantida no conjunto, e a mediana é 96. A variação reforça o limite do ambiente compartilhado; o resultado não é garantia de nota em outra máquina. Próximos trabalhos de performance: perfilar tarefas sem atribuição em ambiente controlado, reduzir avaliação inicial de JS e especializar o preload por rota para evitar transferências adicionais no detalhe mobile.

Metas: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90. Cada valor da tabela é a mediana de três medições da combinação, inclusive LCP/CLS/TBT; não se escolhe a melhor execução. Configurações/condições e versões estão em summary.json e nos relatórios individuais. Execuções exploratórias em before/optimized não compõem as medianas finais.

Otimizações: WebP responsivo sem perdas, dimensões reservadas, prioridade/preload do LCP, lazy loading secundário, bootstrap em paralelo com barreira MSW e detecção Tailwind somente em src. CSS final deixa de depender dos HTMLs de relatórios. Nenhuma funcionalidade, fonte ou imagem foi removida exclusivamente para medir. O PNG original e a equivalência pixel a pixel do WebP integral foram preservados. Baselines foram revisadas após a reamostragem e corrigidas antes da verificação final.

As notas abaixo da meta precisam ser avaliadas junto de seus relatórios: o caminho crítico de uma SPA fria inclui download/avaliação de React/Router/Query/Axios e inicialização MSW antes de renderizar. Há tarefas longas em bootup-time/long-tasks, parte classificada pelo Lighthouse como Other/Unattributable; essa parcela não permite atribuição conclusiva a uma função específica. A contenção de uma estação compartilhada também é um limite da medição, não prova isolada da causa. O relatório não apresenta essas notas como metas atingidas. O aviso de chunk >500 kB permanece; não foi ocultado aumentando o limite.

Best Practices 96 decorre do 401 esperado em GET /api/auth/session para visitante, registrado pelo navegador como erro de rede. Semântica de autenticação não foi alterada para elevar a nota. Favicon e robots.txt foram corrigidos; o antigo fallback HTML para robots.txt foi eliminado. Acessibilidade automatizada não equivale a certificação WCAG humana.

## 9. Documentação e entrega

| Requisito                                                             | Status | Evidência / justificativa                                                                                                                                     |
| --------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Código, lockfile, assets, mocks, fixtures e testes                    | ✅     | Arquivos do repositório, instalação limpa e build                                                                                                             |
| README reproduzível                                                   | ✅     | Install/dev/demo, variáveis, contas, reset e todos os cenários, testes e Lighthouse                                                                           |
| Arquitetura, contratos, políticas e limitações                        | ✅     | ARCHITECTURE.md e docs/ARQUITETURA, API, MOCKS, DECISOES, TESTES                                                                                              |
| Ajustes de acessibilidade/assets documentados                         | ✅     | DECISOES identifica cores, foco, reflow, arte reutilizada e derivados sem redesenho                                                                           |
| Comandos de desenvolvimento/build/preview/tipos/lint/testes/auditoria | ✅     | package.json e README                                                                                                                                         |
| Configuração de hospedagem SPA                                        | ✅     | vercel.json com saída dist e fallback, worker/assets preservados                                                                                              |
| Link do repositório                                                   | ✅     | https://github.com/xXLuisHenriqueXx/frontend-challenge                                                                                                        |
| Deploy e URL pública obrigatórios                                     | ❌     | Nenhuma publicação ou URL pública verificável foi fornecida/realizada. Configuração local não satisfaz o requisito; publicar esta revisão continua necessário |
| Versão publicada correspondente e disponível                          | ⚠️     | Depende do deploy pendente; não é possível comprovar correspondência ou disponibilidade pública                                                               |
| Acesso direto/refresh e mocks no host público                         | ⚠️     | Validados localmente; faltam testes no host após publicação                                                                                                   |

## 10. Eliminatórios

| Condição eliminatória                       | Verificação local                      | Evidência                                                                 |
| ------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| Ausência de uso efetivo da stack            | Não identificada                       | Dependências usadas no runtime e nas verificações; tabela da seção 1      |
| Fluxos principais apenas visuais            | Não identificada                       | Compra/conta/carrinho passam pela rede e persistem                        |
| Compra confirmada sem resposta da simulação | Não identificada                       | Pedido começa pending; recibo e aviso só confirmam após processamento MSW |
| Exposição de dados entre usuários           | Não identificada nos cenários testados | Ana/Bruno, cache, autorização de recibo, sessão e eventos separados       |
| Eventos simulados diretamente na UI         | Não identificada                       | Publicação no mock → binding → socket.io-client → processamento normal    |
| Ausência de E2E executável                  | Não identificada                       | Suíte Chromium desktop/mobile, relatório e baselines                      |

Essas evidências abrangem os cenários automatizados, não uma prova formal de ausência de qualquer falha. A entrega completa do desafio continua com riscos declarados: deploy obrigatório pendente, fidelidade ao Figma/arte substituta não integralmente verificada, inspeção humana não realizada e eventuais medianas de Performance abaixo da meta. Não declarar aprovação integral enquanto esses itens permanecerem.
