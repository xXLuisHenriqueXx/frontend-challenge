# Auditoria do NFT Marketplace

## Atualização — etapa 5: Playwright E2E e regressão visual (06/11/2026)

Esta seção é o diagnóstico vigente dos testes. As etapas abaixo são mantidas como histórico. A geração das referências com `npm run test:e2e:update` terminou com **48 testes aprovados**, sem retries automáticos: 28 funcionais, dois percursos visuais com quatro capturas cada e 18 de acessibilidade. As oito referências PNG de início, detalhe, carrinho e pagamento estão em `tests/e2e/visual.spec.ts-snapshots` para desktop 1440 e mobile 390. A matriz de acessibilidade também cobre 768.

A verificação final com `npm run test:e2e`, sem atualizar referências, também terminou com **48 testes aprovados em 5,7 minutos**, exit 0 e as oito comparações visuais sem pixels diferentes. Essa execução inclui recuperação do timeout após refresh, evento antigo de pedido pendente após confirmação e skeleton do resumo do carrinho. Build, preview próprio e encerramento estão incluídos no comando.

| Cobertura                 | Evidência                                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catálogo                  | Busca, filtros combinados, ordenação observada nos produtos, paginação, reset de página, histórico, vazio e respostas fora de ordem                                               |
| Detalhe                   | Acesso direto, título e NFT inexistente                                                                                                                                           |
| Autenticação e isolamento | Cadastro com validação, login, sessão após refresh, logout, troca de conta, expiração e recuperação dos dados da conta original                                                   |
| Favoritos                 | Falha real de mutation, rollback visual e REST, nova tentativa bem-sucedida e isolamento por usuário                                                                              |
| Carrinho                  | Quantidade, remoção, cupom inválido/aplicar/remover, valores decimais exatos, refresh e merge do visitante no login                                                               |
| Compra                    | Catálogo até recibo confirmado, requisição de criação única em clique repetido, estoque decrementado uma vez e carrinho esvaziado                                                 |
| Falhas e recuperação      | Recusa preserva itens/estoque; timeout reenvia mesma chave e corpo; pedido pendente recuperado após interrupção e refresh                                                         |
| Snapshot e terminalidade  | Recibo preserva valores após alteração do catálogo e refresh; evento antigo de pedido pendente não regride confirmação                                                            |
| Conta                     | Perfil e avatar válidos persistem; arquivo inválido rejeitado; senha atual incorreta rejeitada, senha nova usada no login; carteiras principal/secundária com validação e refresh |
| Socket.IO real            | Preço e estoque alterados pelo mock chegam ao checkout, invalidam revisão e bloqueiam compra esgotada; cenários de duplicatas/antigos e desconexão/reconciliação                  |
| Acessibilidade e estados  | Teclado, trap e retorno de foco, Escape, validação associada, títulos, reflow, axe, skeletons e reduced motion; erro de servidor com retry                                        |

Os fluxos passam pelo Axios, handlers MSW e cliente Socket.IO da aplicação. Os controles `/mock/nft`, `/mock/scenario` e `/mock/timing` alteram somente a camada de mocks. O aviso de confirmação por socket é verificado além do recibo; polling REST continua disponível como recuperação. Não há setters de UI/cache nos testes, respostas de negócio substituídas pelo Playwright, sleeps fixos ou supressão de regras axe. Cada teste usa contexto novo e reset conhecido.

Correções encontradas na execução: ordenação e paginação estavam indisponíveis em mobile e agora são operáveis; o checkout conservava a confirmação sobre uma cotação com erro de estoque e agora invalida a revisão e bloqueia o envio. O cenário de evento antigo inclui dados obsoletos diferentes, para tornar uma regressão observável. Foi acrescentado controle de processamento pendente na camada de mocks para testar interrupção sem corrida contra o timer de liquidação.

Verificações complementares aprovadas: **60 verificações REST**, **17 de Socket.IO**, typecheck e lint. Durante a execução paralela, Socket.IO e lint atingiram o limite de memória do ambiente; suas reexecuções isoladas foram aprovadas. Permanece o aviso de chunk acima de 500 kB no build.

Configuração e reprodução: [TESTES.md](TESTES.md), `playwright.config.ts` e `scripts/run-e2e.mjs`. Chromium 158.0.8127.18, Playwright 1.65.0, Node 24.14.0, Windows/PowerShell; build Vite otimizado com mocks ativos. Relógio fixo nas capturas, animações desativadas, fontes/imagens carregadas e latência determinística. As referências são específicas de Chromium/Windows. Relatório HTML em `playwright-report/index.html`, aberto por `npm run test:e2e:report`; trace com `retain-on-failure` e screenshot das falhas em `test-results`. O executor encerra o preview próprio ao terminar.

Limites: as capturas estabelecem referências do código existente, sem comprovar fidelidade ao Figma indisponível. Inspeção humana de teclado/zoom nativo, leitor de tela, Lighthouse/CLS e deploy público continuam fora da validação desta etapa; os testes não equivalem a essas avaliações.

## Atualização — etapa 4: acessibilidade (06/11/2026)

Este é o diagnóstico vigente da acessibilidade. As seções de etapas anteriores, mantidas abaixo para histórico, não descrevem o estado atual desse checklist.

Resultado final: **18 testes de acessibilidade aprovados**, nas larguras 390, 768 e 1440. Foram 33 análises axe sem violações nos escopos WCAG 2.0/2.1 A/AA e best practices configurados: nove telas por largura, mais diálogo aberto e erro de API. A suíte também validou foco após remover o último NFT, favorito via Space, compra até recibo confirmado e reflow equivalente a 200% nas nove telas. Regressão de rede: 60 verificações REST e 17 de Socket.IO aprovadas. Typecheck, lint e build aprovados; o aviso de CSS inválido foi eliminado e permanece o aviso de chunk acima de 500 kB.

O comando padrão `npm run test:a11y` também foi executado sem servidor externo e terminou com exit 0: build, preview próprio, 18 testes aprovados e encerramento do preview. O executor direto em Node corrige a espera de encerramento observada com npm/cmd aninhados no Windows.

Ferramentas: Node 24.14.0, Playwright 1.65.0, Chromium 158.0.8127.18, axe-core/@axe-core/playwright 4.14.0. Execução Windows/PowerShell, build Vite otimizado com MSW ativo e cenários isolados. Relatório HTML local: `playwright-report/index.html`, com JSON axe anexado; traces e screenshots são retidos quando há falha em `test-results`. Os artefatos gerados são ignorados pelo Git e reproduzíveis pelo comando documentado.

| Requisito                                                            | Status | Evidência e limite                                                                                                                                                                    |
| -------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Teclado, ordem de foco e foco visível                                | ✅     | Skip link, foco por rota, outline de 2 px na paleta; tabs com setas/Home/End; filtros e favoritos operáveis por Enter/Space; testes Playwright                                        |
| Dialog/drawer                                                        | ✅     | Filtro abre `Modal` com dialog nativo, rótulo, aria-modal, fundo inerte, trap Tab/Shift+Tab, Escape e retorno ao gatilho; teste nas três larguras                                     |
| Landmarks, headings e controles sem aninhamento inválido             | ✅     | Main único, rodapé fora de main, h1 por tela, headings de carteiras corrigidos; links estilizados preservam aparência sem envolver botões; axe sem supressão de regras                |
| Labels e erros de formulário                                         | ✅     | Labels de autenticação, IDs únicos em AccountField, campos do pagamento rotulados; AccessibleForm associa validação/API por aria-describedby e aria-invalid e foca primeiro erro      |
| Imagens e decoração                                                  | ✅     | NFTs e avatar com alt; logos junto de texto e imagens decorativas com alt vazio; ícones acionáveis têm nome acessível                                                                 |
| Contraste e seleção além da cor                                      | ✅     | Erro coral ajustado, bordas distinguíveis, seleção com sublinhado/texto/coração/borda dupla; axe nas nove telas; razões calculadas em DECISOES.md                                     |
| Feedback de mutations e tempo real sem anúncios repetidos de refetch | ✅     | Resumo de erros com alert, sucesso com status, região persistente para eventos, deduplicação existente; refetch não cria múltiplos status                                             |
| Skeleton, aria-busy e reduced motion                                 | ✅     | Skeletons com estado busy, texto de carregamento e shimmer desativado por preferência; teste da animação no Chromium                                                                  |
| Reflow até 200% em 390/768/1440                                      | ✅     | Matriz automatizada usa metade da largura CSS como equivalente de layout; testa ausência de overflow nas telas públicas, privadas e no recibo confirmado                              |
| Título, foco em navegação e SEO básico                               | ✅     | RouteAccessibility atualiza título e foca h1/main após carregamento; idioma pt-BR, descrição e theme-color em index.html                                                              |
| Auditoria automatizada nas telas principais                          | ✅     | `npm run test:a11y`: axe-core + Playwright, três larguras; relatório HTML e JSON por tela, traces/screenshots de falhas                                                               |
| Verificação manual por teclado e zoom nativo                         | ⚠️     | Browser retornou “No browser is available” e lista vazia; solicitada conexão ao usuário. Não realizada nesta sessão. Testes automatizados não foram apresentados como inspeção manual |

A suíte cobre início, detalhe, carrinho, login, cadastro, perfil, carteiras, pagamento e recibo confirmado. Inclui auditoria com diálogo aberto e erros de API, além de navegação de teclado e reflow. Ajustes visuais e comandos reproduzíveis estão em `docs/DECISOES.md`. O download do Chromium para testes permitiu executar automação mesmo sem navegador interativo conectado.

Roteiro manual ainda pendente: percorrer cada tela somente com Tab/Shift+Tab/Enter/Space; operar filtros e tabs com as teclas previstas; provocar validação local e erro de API; abrir/fechar filtros por Escape; observar foco após login, navegação e remoção de itens; testar zoom nativo até 200% nas três larguras e conferir conteúdo/controles não encobertos. Leitor de tela e percepção visual humana também não foram avaliados.

## Atualização — etapa 3 (06/11/2026)

Esta atualização é o diagnóstico vigente para os itens abaixo; as seções anteriores preservadas mais adiante são históricas.

Verificações finais: typecheck, lint e build aprovados; worker presente em dist. Com app em execução em localhost:3002, `/`, `/profile`, `/wallets`, `/payment`, `/mockServiceWorker.js` e os módulos de hooks/realtime responderam HTTP 200. Isso valida a entrega dos arquivos e o fallback local, sem comprovar renderização ou operação por teclado. Persistem os avisos preexistentes de CSS inválido e chunk acima de 500 kB; não foram feitas alterações de identidade visual para eliminá-los nesta etapa.

| Requisito                                                         | Status | Evidência atual e limites                                                                                                                                        |
| ----------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Carrinho por NFT/edição, persistência e merge visitante/login     | ✅     | handlers MSW; add soma quantidades, edição substitui; estoque validado; operações serializadas por usuário                                                       |
| Cupom aplicar/remover e inválido/expirado; ETH decimal exato      | ✅     | cotação autoritativa em strings, BigInt; testes de rede; botão alterna Aplicar/Remover                                                                           |
| Mudanças de preço/estoque no carrinho/checkout                    | ✅     | nft.updated pelo socket; invalidação de catálogo/detalhe/carrinho/cotação, aviso de status; 409 para cotação antiga                                              |
| Coletor, carteira/rede, conexão/recusa/desconexão e revisão       | ✅     | useCheckout; campos obrigatórios também no mobile; APIs de conexão e validação; revisão antes do envio                                                           |
| Revalidação e nova confirmação após alterações                    | ✅     | fingerprint da cotação, preflight REST e validação final no mock; evento torna revisão anterior inválida                                                         |
| Clique repetido, timeout e recuperação do mesmo pedido            | ✅     | trava síncrona, botão pendente, chave/corpo em sessionStorage por usuário; reenvio idempotente                                                                   |
| Pendente/confirmado/recusado, refresh e reconexão                 | ✅     | order.updated e reconciliação REST; terminalidade no mock e no cache; fallback de polling                                                                        |
| Recibo snapshot; falhas preservam itens; remover somente comprado | ✅     | snapshots de carteira/cotação; subtotal/desconto/taxa/total exibidos; teste preserva acréscimos posteriores                                                      |
| Sessão e expiração com retomada; limpeza de dados/subscriptions   | ✅     | token recuperável, revalidação periódica, guardas, interceptor 401, rascunho por usuário e cleanup do socket; respostas de sessão antiga não redirecionam a nova |
| Perfil, avatar, senha e carteiras principal/secundária            | ✅     | novas rotas protegidas, formulários responsivos seguindo referências; validações e persistência MSW, erros de API; avatar PNG/JPEG/WebP local                    |
| socket.io-client + MSW socket.io-binding                          | ✅     | binding 0.2.0, WebSocket com handshake, heartbeat, subscribe e ready; mesma fonte de dados REST/eventos                                                          |
| IDs, versões, duplicatas/antigos, isolamento e cleanup            | ✅     | ResourceEvent, eventGate, token por ciclo, filtros por usuário, fechamento e liberação de timers/listeners                                                       |
| Skeletons/shimmer/reduced motion                                  | ✅     | CatalogSkeleton, DetailSkeleton, SummarySkeleton; CSS desativa animação por preferência                                                                          |
| Layout shift e fidelidade visual em execução                      | ⚠️     | containers/aspect ratios no código; nenhuma medição de CLS ou inspeção visual nesta sessão                                                                       |
| Testes REST e conta                                               | ✅     | `npm run test:integration`: 60 verificações via Axios/MSW                                                                                                        |
| Testes de tempo real                                              | ✅     | `npm run test:realtime`: 17 verificações pelo cliente Socket.IO, incluindo duplicatas/antigos transportados e recuperação de pedido                              |
| Validação manual com app aberto                                   | ⚠️     | Browser retornou “No browser is available”; descoberta retornou lista vazia; solicitada conexão ao usuário                                                       |

Documentação de transporte, limitações e cenários em `docs/MOCKS.md`; contratos e arquitetura atualizados. Os testes de rede são executáveis e não substituem testes E2E ou medição visual. Permanecem pendentes Playwright, regressão visual, Lighthouse e deploy público; portanto a entrega completa do desafio ainda não pode ser declarada concluída.

## Correção de carregamento dos módulos — 06/11/2026

O matcher `*/api/*` também capturava `/src/api/hooks.tsx`, devolvendo 404 e impedindo o import dinâmico da página inicial. O teste de regressão reproduziu o 404 antes da correção. O handler agora usa uma expressão regular ancorada na origem e em `/api/`, deixando módulos Vite e assets seguirem para o servidor. A regra não depende da porta, funcionando também quando Vite usa 3001.

Validação: 45 verificações de integração, incluindo respostas 200 para `/src/api/hooks.tsx` e a rota com `?tsr-split=component` servidas pelo middleware real do Vite enquanto MSW está ativo. Typecheck, lint e build aprovados. Os avisos de CSS/chunk existentes permanecem. A validação não substitui teste manual em navegador.

## Atualização — implementação da etapa 2 (06/11/2026)

Esta seção substitui o diagnóstico inicial para os itens abaixo. O restante deste documento preserva o levantamento histórico da etapa 1, incluindo suas evidências e lacunas. Não considerar os resultados antigos de comandos como resultados do código atual.

| Requisito da etapa 2                                                                        | Status | Evidência atual                                                                                            | Pendência/limite                                                                         |
| ------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Catálogo: URL tipada, validação, filtros combinados, ordenação, paginação e reset de página | ✅     | contracts.ts: parseSearch; routes/index.tsx; SearchBar/Sidebar/Categories/SortSelect/Pagination; GET /nfts | Histórico/refresh da interface ainda não exercitados em navegador.                       |
| Rota 404 e detalhe por ID/inexistente                                                       | ✅     | routes/__root.tsx; nftOptions; GET /nfts/:id e teste 404                                                   | Hosting público ainda não validado.                                                      |
| Guardas privadas e retorno após login                                                       | ✅     | requireSession em api/client.ts; payment e payment/confirm; login/register com safeReturn                  | Perfil/carteiras ainda não têm telas; contratos e handlers prontos para etapa 3.         |
| Query + Axios efetivos, chaves por usuário/parâmetros, cancelamento, erros/vazio/refetch    | ✅     | api/client.ts, hooks.tsx, QueryClientProvider em main.tsx                                                  | Polling REST de pedido provisório; Socket.IO pendente.                                   |
| Atualização otimista com rollback                                                           | ✅     | useFavorites: cancelamento, snapshot, setQueryData, onError e invalidação; cenário favorite-failure        | Rollback renderizado ainda precisa de validação manual/E2E.                              |
| REST tipado para todos os recursos da seção 5 e erros                                       | ✅     | api/contracts.ts; mocks/handlers.ts; docs/API.md                                                           | Formulários completos de perfil/carteiras são etapa 3.                                   |
| Idempotência de pedidos                                                                     | ✅     | POST /orders, chave por usuário, corpo canônico, 409 divergente                                            | Testes via rede comprovam mesmo ID e recuperação após timeout.                           |
| MSW com dados consistentes, duas contas, 36 NFTs, persistência/reset                        | ✅     | database.ts e handlers.ts; worker em public; bootstrap antes do render                                     | Simulação local por origem; sem sincronização multiaba.                                  |
| Cenários configuráveis e determinísticos                                                    | ✅     | ?scenario, ?reset=1, /mock/scenario e /mock/reset; tabela em API.md                                        | Controles de relógio para E2E e eventos são de etapas posteriores.                       |
| Senhas sem armazenamento em claro                                                           | ✅     | SHA-256 com salt no mock; publicUser exclui credenciais                                                    | Hash apenas simulado; não adequado como autenticação de produção.                        |
| Carrinho visitante → login e isolamento entre usuários                                      | ✅     | merge no login; chaves private/userId; limpeza de cache; teste de duas contas                              | Validação visual e multiaba pendentes.                                                   |
| Precisão ETH e cotação autoritativa                                                         | ✅     | units/decimal/multiply com BigInt; Quote em strings                                                        | Ajustes de revisão e conexão de carteira completos continuam na etapa 3.                 |
| Confirmação somente pelo pedido da API                                                      | ✅     | confirmação recebe orderId e consulta Order; status da URL removido                                        | Pendência/recusa usam consulta REST; ainda falta Socket.IO.                              |
| Documentação e decisão SPA                                                                  | ✅     | docs/API.md, ARQUITETURA.md, DECISOES.md, .env.example                                                     | README final, deploy, Playwright e Lighthouse permanecem futuros.                        |
| Verificação de tipos                                                                        | ✅     | npm.cmd run typecheck — exit 0                                                                             | Quatro erros iniciais corrigidos.                                                        |
| Lint                                                                                        | ✅     | npm.cmd run lint — exit 0                                                                                  | Worker gerado excluído do lint tipado.                                                   |
| Build                                                                                       | ✅     | npm.cmd run build — exit 0; worker copiado para dist                                                       | Permanecem avisos preexistentes de CSS inválido e chunk >500 kB; visual não redesenhado. |
| Testes de integração de rede                                                                | ✅     | npm.cmd run test:integration: 43 checks aprovados; scripts/test-integration.mjs                            | Axios + mesmos handlers MSW; não substituem Playwright.                                  |
| App rodando e smoke HTTP                                                                    | ✅     | Vite localhost:3000; GET /, /product/1 e /mockServiceWorker.js retornam 200                                | HTTP comprova entrega de arquivos, não interação da UI.                                  |
| Validação manual dos cenários na interface                                                  | ⚠️     | Browser: “No browser is available”; lista de navegadores vazia                                             | Não executada por falta de navegador conectado. Roteiro reproduzível abaixo.             |

### Roteiro manual pendente

1. Rodar `npm run dev`; abrir `/?reset=1&scenario=success`. Buscar, combinar filtros/rede/ordenação, mudar página, usar voltar/avançar e refresh; conferir URL e resultados. Acessar `/product/unknown` e uma rota inexistente.
2. Adicionar NFT como visitante, recarregar carrinho, acessar pagamento e autenticar com `ana@kurio.test` / `Kurio123!`; conferir merge e retorno ao pagamento. Sair pelo cabeçalho e entrar com `bruno@kurio.test`; conferir isolamento.
3. Selecionar `?scenario=favorite-failure`, entrar se necessário e favoritar no detalhe; observar otimismo seguido de rollback e erro. Voltar a success e repetir com sucesso; recarregar.
4. Aplicar `KURIO10`, remover e ensaiar coupon-invalid/coupon-expired. Em slow, observar loading; em empty, resultado vazio; em offline/http-400/http-500, erro e recuperação em success; em out-of-order, digitar rapidamente e conferir que resultado final corresponde à URL.
5. Ensaiar expired/unauthorized durante checkout e retomar após login. Criar conta duplicada para conflito e usar dados inválidos nos formulários.
6. Fazer pedido; clicar repetidamente e usar order-timeout. Reenviar sem trocar a tentativa; confirmar mesmo pedido. Recarregar recibo por orderId; status deve vir da API. Ensaiar payment-refused e verificar carrinho preservado; price-changed/sold-out devem bloquear cotação antiga e exigir nova confirmação.

### Riscos eliminatórios após esta etapa

Query/Axios/MSW passam a ter uso efetivo e confirmação sem pedido foi removida. Isolamento de recibos, carrinho e favoritos tem evidência nos testes de integração. **Permanecem eliminatórios abertos:** falta de Socket.IO efetivo e falta de testes E2E executáveis. Fluxos completos de conta/carteiras e UX de pagamento ainda dependem da etapa 3. Shimmer, acessibilidade abrangente, regressão visual, Lighthouse e deploy seguem pendentes. Esta atualização não declara o desafio inteiro concluído.

---

## Diagnóstico histórico — etapa 1

Data: 06/11/2026. Fonte da verdade: leitura integral de `AGENTS.md` e `docs/DESAFIO.md`. Escopo: diagnóstico, sem alteração de código da aplicação ou do enunciado.

Legenda: ✅ implementado com evidência; ⚠️ parcial ou ainda não validado; ❌ ausente ou contradiz o requisito. A existência de uma tela não comprova o fluxo. Esta auditoria combina inspeção estática e comandos locais; não foram executadas avaliações visuais no navegador, Playwright ou Lighthouse. Nenhuma pontuação de performance ou conformidade visual foi presumida.

## Estrutura e arquitetura encontradas

- Entrada: `index.html` → `src/main.tsx` → `src/router.tsx` → `src/routeTree.gen.ts`. Renderização cliente com `ReactDOM.createRoot`; Vite + plugin do TanStack Router. Apesar do contexto mencionar Start, o código atual é uma SPA, sem plugin Start, SSR, server functions ou API routes. Falta registrar a decisão em `docs/DECISOES.md` e configurar fallback de rotas no hosting.
- Rotas existentes: `/`, `/product/$productId`, `/cart`, `/payment`, `/payment/confirm`, `/login`, `/register`. Não há rotas de perfil e carteiras, guardas privadas ou página 404 própria.
- Features: catálogo em `src/routes/-components/`; detalhe, carrinho e pagamento nas respectivas rotas. Estado pontual por `useState`, dados fictícios definidos nos componentes. Sem camada de domínio, transporte ou estado remoto compartilhado.
- UI: `src/components/ui/` contém button, badge, card, field, input, label, separator e slider; `components.json` configura shadcn/base-nova. Header/Footer e barras de navegação são componentes locais. Tailwind em `src/styles.css`.
- API, mocks e tempo real: não existem cliente Axios, contratos REST, QueryClient/provider, hooks Query, handlers MSW, fixtures de rede ou inicialização Socket.IO. Query, Axios e socket.io-client constam apenas como dependências. MSW, Playwright e Lighthouse não constam no manifesto.
- Assets: imagens e ícones em `src/assets/`, fontes locais via fontsource; 16 referências visuais em `docs/design/`. A mesma imagem Monkey é reutilizada em NFTs diferentes.
- Configurações: `vite.config.ts`, `tsconfig.json`, `tsr.config.json`, `eslint.config.js`, `components.json`; `yarn.lock`. Não há configurações E2E/Lighthouse, baselines ou relatórios. README ainda é o template.

## Execução das verificações

Ambiente: Windows/PowerShell, Node v24.14.0; dependências preexistentes em `node_modules`. Os resultados abaixo não atestam instalação reproduzível a partir de checkout limpo.

| Comando                                                                                    | Resultado             | Evidência e limitação                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn install --frozen-lockfile`                                                           | ❌                    | Yarn não instalado (`CommandNotFoundException`).                                                                                                                                                        |
| `npm install --package-lock=false --ignore-scripts`                                        | ❌                    | Wrapper npm.ps1 bloqueado pela política de execução do PowerShell.                                                                                                                                      |
| `npm.cmd install --package-lock=false --ignore-scripts`                                    | ⚠️                    | Tentativa sem conclusão/output, interrompida; não considerada sucesso. Scripts de instalação desabilitados nesta tentativa de auditoria.                                                                |
| `npm.cmd install --package-lock=false --ignore-scripts --offline --cache .audit-npm-cache` | ❌                    | `ENOTCACHED` para registry.npmjs.org/eslint; também avisos de resolução de peers. Não gerado lockfile npm. Cache temporário removido após inspeção.                                                     |
| `.\node_modules\.bin\tsc.cmd --noEmit`                                                     | ❌ exit 1             | 4 erros TS2322: Header.tsx:64 (`size="sm"`), SearchBar.tsx:19 (`icon-sm`), Sidebar.tsx:74 (callback slider incompatível com number/readonly array), Sidebar.tsx:84 (`sm`). Não existe script typecheck. |
| `npm.cmd run lint`                                                                         | ❌ exit 1             | 5 erros: import/consistent-type-specifier-style em badge.tsx:3, button.tsx:2, field.tsx:2 e cart/index.tsx:7; no-unnecessary-condition em field.tsx:195. Sem aplicar autofix.                           |
| `npm.cmd run build`                                                                        | ✅ exit 0, com avisos | Vite 8.3.6, 2355 módulos, 4,32 s. CSS inválido `var(--font-primary: )`; chunk facebook 531,83 kB minificado; monkey PNG 1885,43 kB. Build não executa typecheck e não comprova fluxos.                  |
| `npm.cmd test`                                                                             | ❌ exit 1             | Missing script: test; nenhum teste existente encontrado.                                                                                                                                                |
| `npm.cmd run test:e2e`                                                                     | ❌ exit 1             | Missing script: test:e2e; sem Playwright, suites ou configuração.                                                                                                                                       |

## Matriz de requisitos — seções 3 a 10

### 3. Telas e fluxos

| Requisito                                                       | Status | Evidência (arquivo/linha/comando)                                    | O que falta                                                                                                          |
| --------------------------------------------------------------- | ------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Início: destaques, catálogo e navegação                         | ⚠️     | routes/index.tsx:15; Hero, Products, ProductCard                     | Integrar descoberta; dados estáticos não respondem aos controles.                                                    |
| Busca, filtros, ordenação e paginação na URL; refresh/histórico | ❌     | SearchBar.tsx; SortSelect.tsx; Pagination.tsx:9; routes/index.tsx:15 | validateSearch, navegação por search params e consulta correspondente.                                               |
| Filtros combináveis e reset de página                           | ❌     | Sidebar.tsx:37–39; Categories.tsx:21; Products.tsx                   | Estados isolados, sem afetar coleção; conectar filtros e reset.                                                      |
| Parâmetros API, vazio, erro e respostas fora de ordem           | ❌     | Products.tsx:3 (PRODUCTS fixos); ausência de transporte              | Query keys completas, cancelamento/descarte e estados assíncronos.                                                   |
| Detalhe por ID, acesso direto e inexistente                     | ⚠️     | product/$productId/index.tsx:15,39–40                                | ID apenas logado; todos mostram PRODUCT fixo. Consultar por ID, tratar 404. Hosting ainda não validado.              |
| Galeria, informações, edição e quantidade                       | ⚠️     | product/$productId/index.tsx:15–44,197–210                           | Galeria repete imagem; limitar estoque, selecionar edição válida e rejeitar indisponível. Incremento sem teto.       |
| Favoritos persistidos e autenticados                            | ❌     | botão Favoritar no detalhe:74                                        | API, sessão, leitura/gravação, persistência e feedback.                                                              |
| Adição ao carrinho, disponibilidade por edição                  | ❌     | detalhe:231; cart/index.tsx:16–49                                    | Botão sem operação integrada; cart começa com itens fixos.                                                           |
| Alterar/remover quantidades                                     | ⚠️     | cart/index.tsx:64–82                                                 | Funcionam localmente, sem estoque máximo ou sincronização API.                                                       |
| Refresh do carrinho e visitante → login                         | ❌     | cart/index.tsx:65 (useState); login/index.tsx                        | Persistência, identidade visitante e merge autenticado.                                                              |
| Cupom aplicar/remover, inválido e expirado                      | ❌     | cart/index.tsx (promo e botão Aplicar sem handler)                   | Contrato de cotação e validação de cupom.                                                                            |
| Subtotal/desconto/taxa/total da API                             | ❌     | cart/index.tsx:61–68; payment/index.tsx:385–386                      | Cotação autoritativa; pagamento exibe totais diferentes por breakpoint.                                              |
| Precisão ETH: strings decimais, quantidades inteiras            | ❌     | cart/index.tsx:23,67; detalhe:44; confirm/index.tsx:59               | Remover aritmética IEEE-754 de valores monetários, usar representação exata e strings no transporte.                 |
| Alterações de preço/estoque com carrinho aberto                 | ❌     | ausência Socket.IO em src                                            | Eventos, aviso acessível e recotação.                                                                                |
| Pagamento: dados, validação e revisão                           | ⚠️     | payment/index.tsx:201–279,391                                        | Form previne submit; required é asterisco visual; botão final sem handler. Campos do coletor escondidos no mobile.   |
| Carteiras cadastradas, rede, conexão/recusa/desconexão          | ❌     | payment/index.tsx:16–35,168–169                                      | Seleção local sobre dados fixos; falta CRUD e simulação de conexão.                                                  |
| Revalidar preço/estoque/cupom/taxas e reconfirmar mudanças      | ❌     | payment/index.tsx:391                                                | Cotação versionada, validação antes da criação e nova revisão.                                                       |
| Idempotência: clique repetido, timeout e reenvio                | ❌     | nenhuma criação de pedido/cliente REST                               | Chave estável por tentativa, recuperação e conflito se payload divergir.                                             |
| Pedidos pendente/confirmado/recusado e recuperação              | ⚠️     | confirm/index.tsx:9–24,65–104                                        | Estados só visuais via URL; persistir e consultar pedido real da simulação após refresh/reconexão.                   |
| Confirmação apenas após resposta confirmada                     | ❌     | confirm/index.tsx:15–24                                              | Sem status válido, assume success; acesso direto produz confirmação sem pedido.                                      |
| Preservar itens em falha e remover só quantidades compradas     | ❌     | cart e confirmação sem estado comum                                  | Aplicar efeito uma vez após confirmação; preservar acréscimos e itens externos ao pedido.                            |
| Recibo snapshot imutável e transação simulada coerente          | ❌     | confirm/index.tsx:27–60,293                                          | Recibo fixo e link Etherscan truncado; snapshot por pedido, sem depender do catálogo.                                |
| Cadastro/login/logout/sessão API e retorno anterior             | ❌     | login/index.tsx:27; register/index.tsx:29                            | Formulários sem autenticação; implementar endpoints, sessão e returnTo. Link Entre do cadastro aponta para register. |
| Proteção checkout/perfil/carteiras/favoritos/pedidos            | ❌     | rotas sem beforeLoad; router.tsx                                     | Guardas e autorização nos handlers.                                                                                  |
| Refresh/expiração de sessão e retomada do checkout              | ❌     | ausência de sessão/storage em src                                    | Recuperação, tratamento 401 e preservação segura de contexto.                                                        |
| Logout/troca: limpar cache privado e subscriptions              | ❌     | sem QueryClient nem sessão                                           | Isolar query keys e dados por usuário, cancelar requests e desconectar listeners.                                    |
| Perfil, avatar, senha, carteiras: validação/API/persistência    | ❌     | inventário de rotas                                                  | Criar telas desktop/mobile e recursos; tratar conflitos e erros por campo.                                           |
| Credenciais fictícias e senhas fora de texto claro              | ⚠️     | nenhum repositório de contas; inputs password existentes             | Sem armazenamento observado, mas fluxo inexistente; adotar derivação/hash na simulação e documentar credenciais.     |
| Desktop/mobile e ações auxiliares coerentes                     | ⚠️     | classes lg nas rotas; BottomBar.tsx:69; href="#" no detalhe          | Validar 390/768/1440, remover ações inertes e evitar falsa indicação de operação concluída.                          |

### 4. Integração e estado

| Requisito                                                    | Status | Evidência                                          | O que falta                                                               |
| ------------------------------------------------------------ | ------ | -------------------------------------------------- | ------------------------------------------------------------------------- |
| Router em rotas, parâmetros e proteção                       | ⚠️     | router.tsx; routeTree.gen.ts; confirm:16           | Rotas reais existem; completar search params e proteção.                  |
| Query em consultas/mutations/cache e Axios em REST           | ❌     | package.json; busca sem ocorrências em src         | Dependências instaladas sem uso efetivo. Criar camada de API e providers. |
| Contratos tipados transporte/estado/UI                       | ❌     | tipos locais CartItem/PaymentStatus                | Tipar requests, responses, erros, eventos e domínio compartilhado.        |
| Carregamento, vazio, erro, sucesso, atualização em fundo     | ⚠️     | cart/index.tsx (vazio local); confirmação estática | Estados remotos e retry de interface.                                     |
| Invalidação, cancelamento, isolamento por parâmetros/usuário | ❌     | sem QueryClient/useQuery/useMutation em src        | Definir chaves, AbortSignal, invalidação e limpeza na sessão.             |
| Falhas sem duplicação, 404 e acesso direto                   | ⚠️     | Router com rotas; detalhe ignora ID                | Página 404 própria, recuperação de operações e teste no hosting.          |
| Otimismo com rollback; política cache/retries documentada    | ❌     | estados useState sem mutations                     | Uma mutation otimista real, snapshot/rollback e política documentada.     |

### 5. Contratos REST

| Requisito                                                | Status | Evidência                            | O que falta                                                         |
| -------------------------------------------------------- | ------ | ------------------------------------ | ------------------------------------------------------------------- |
| Sessão/conta: cadastro/login/me/logout/expiração         | ❌     | sem camada API                       | Endpoints e documentação.                                           |
| NFTs: listagem parametrizada e detalhe                   | ❌     | Products e PRODUCT embutidos em UI   | Contratos e handlers.                                               |
| Favoritos: consulta/inclusão/remoção                     | ❌     | sem recurso de favoritos             | Operações autenticadas.                                             |
| Carrinho: consulta/inclusão/alteração/remoção            | ❌     | cart/index.tsx:65                    | Operações REST e estoque por edição.                                |
| Cotação: cupom, disponibilidade, desconto, taxas e total | ❌     | NETWORK_FEE e LAUNCH_DISCOUNT locais | Contrato monetário exato e expiração/versionamento.                 |
| Pedidos: criação idempotente, consulta/recibo            | ❌     | confirm/index.tsx:27                 | Mesmo pedido para mesma chave/payload; 409 para conteúdo diferente. |
| Perfil/avatar/senha; carteiras consulta/cadastro/edição  | ❌     | rotas e serviços ausentes            | Recursos e autorização por proprietário.                            |
| Erros de validação, 401/403/404/409 e transitórios       | ❌     | nenhum handler/contrato de erro      | Envelope tipado e tratamento na interface.                          |

### 6. MSW

| Requisito                                                          | Status | Evidência                                         | O que falta                                                                |
| ------------------------------------------------------------------ | ------ | ------------------------------------------------- | -------------------------------------------------------------------------- |
| Mock na rede, contratos compartilhados, sem negócio fictício na UI | ❌     | Products, cart, payment e confirm com constantes  | Mover simulação para handlers MSW.                                         |
| Estado consistente entre recursos, persistência e reset integral   | ❌     | useState independente por rota                    | Banco simulado persistente e reset determinístico.                         |
| Fixtures variadas/paginação e dois usuários                        | ❌     | nove PRODUCTS fixos; sem usuários                 | Fixtures de rede com identidades distintas.                                |
| Sucesso/vazio, latência variável e respostas fora de ordem         | ❌     | sem cenários/configuração                         | Seed e controle determinístico de atrasos e resultados.                    |
| Conexão indisponível, timeouts e HTTP 4xx/5xx                      | ❌     | sem handlers MSW                                  | Cenários reproduzíveis e recuperação observável.                           |
| Sessão expirada, não autorizado, conflito cadastro/validação       | ❌     | sem sessão/API                                    | Cenários e controles de disparo.                                           |
| Cupom inválido/expirado e preço/edição alterados                   | ❌     | cupom inerte e dados locais                       | Cenários integrados ao estoque e cotação.                                  |
| Timeout após criar pedido e pagamento confirmado/recusado          | ❌     | estados da confirmação vêm da URL                 | Processamento persistente e recuperação por idempotência.                  |
| Socket.IO via MSW e socket.io-client exercitado                    | ❌     | dependência socket.io-client sem uso; MSW ausente | Binding compatível, transporte e limitações documentados.                  |
| Ativação por configuração, build demo e bootstrap antes de fetch   | ❌     | main.tsx; vite.config.ts                          | Worker público e bootstrap browser-safe compartilhado por dev/demo/testes. |
| Mutações simuladas refletidas em REST e eventos                    | ❌     | nenhuma fonte compartilhada                       | Fonte de dados única na simulação.                                         |

### 7. Tempo real

| Requisito                                                       | Status | Evidência                      | O que falta                                                            |
| --------------------------------------------------------------- | ------ | ------------------------------ | ---------------------------------------------------------------------- |
| nft.updated: preço/estoque em catálogo/detalhe/carrinho         | ❌     | sem conexão/eventos em src     | Cliente Socket.IO e sincronização/invalidação coerente.                |
| order.updated: pendência → confirmação/recusa                   | ❌     | confirm/index.tsx:99           | Consumir eventos do pedido autorizado.                                 |
| Identidade estável, recurso, versão; duplicatas/eventos antigos | ❌     | sem contratos de eventos       | Deduplicar eventId e rejeitar versões antigas.                         |
| Reconexão reconcilia recursos ativos via REST                   | ❌     | sem subscriptions              | Reconsultar após reconnect e refresh, inclusive pedido pendente.       |
| Isolamento de sessão e limpeza de listeners                     | ❌     | sem autenticação/socket        | Ciclo por sessão; descartar eventos antigos e liberar listeners.       |
| NFT no carrinho muda; aviso/resumo e cotação antiga bloqueada   | ❌     | cart/payment desconectados     | Cenário ponta a ponta e reconfirmação obrigatória.                     |
| Interrupção com pedido pendente, recuperação sem nova compra    | ❌     | nenhuma persistência de pedido | ID/chave persistente, reconciliação e estados terminais irreversíveis. |

### 8. Interface, responsividade e acessibilidade

| Requisito                                        | Status | Evidência                                                                  | O que falta                                                                                                                            |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Identidade Figma e shadcn adaptado               | ⚠️     | docs/design; components.json; styles.css                                   | Há tokens e componentes; comparação visual não executada. Corrigir --font-primary inválido (`##f7f3ec` e `var(--font-primary: )`).     |
| Todas as telas em 390/768/1440; zoom/overflow    | ⚠️     | classes responsivas em rotas; payment:201                                  | Sem medição em navegador; perfil/carteiras ausentes e campos do checkout ocultos no mobile.                                            |
| Skeletons com shimmer: catálogo, detalhe, resumo | ❌     | ausência de skeleton/shimmer em src                                        | Skeletons dimensionados por recurso e carregamento remoto real.                                                                        |
| Reduced motion e estabilidade de layout          | ❌     | styles.css; animação Loader2 na confirmação                                | Implementar prefers-reduced-motion e medir CLS.                                                                                        |
| Teclado e foco visível                           | ⚠️     | button.tsx/input.tsx focus-visible; Link envolvendo Button em cart/payment | Validar percurso, remover controles interativos aninhados e fornecer nomes para botões ícone.                                          |
| Foco em diálogos/drawers                         | ❌     | nenhum diálogo/drawer implementado                                         | Implementar quando necessário com trap, Escape e retorno de foco.                                                                      |
| Semântica, labels e erros associados             | ⚠️     | login:29 e register:32 usam placeholders; payment Field envolve input      | Rotular campos de conta/busca, required real, aria-describedby/invalid e erros por campo. `index.html` usa lang=en para UI portuguesa. |
| Alt para imagens relevantes                      | ⚠️     | imagens de produto têm alt; imagem Monkey repetida                         | Revisar significado de todos os alts em contexto e imagens decorativas.                                                                |
| Contraste e estados não apenas por cor           | ⚠️     | tokens em styles.css; seleção de categorias local                          | Medir contraste no navegador; revisar texto, bordas, foco e estados selecionados.                                                      |
| Feedback acessível para mutations/eventos        | ❌     | ausência de aria-live e de mutations remotas                               | Região de status/alerta para falhas, sucesso e mudança de preço/estoque.                                                               |
| Assets/fontes locais e desvios documentados      | ⚠️     | src/assets; @fontsource-variable/roboto                                    | Recursos locais existem; justificar imagem repetida, fonte efetiva font-mono e desvios em ARCHITECTURE.md.                             |

### 9. Playwright — lista completa do enunciado

Não há arquivos de teste, runner, dependência Playwright ou scripts executáveis. As linhas abaixo são lacunas de cobertura, e não testes executados com falha de asserção.

| Requisito                                                  | Status | Evidência                        | O que falta                                               |
| ---------------------------------------------------------- | ------ | -------------------------------- | --------------------------------------------------------- |
| 1. Busca/filtros combinados/ordenação/paginação/histórico  | ❌     | inventário; npm.cmd run test:e2e | Teste E2E com URL e resultado de rede.                    |
| 2. Detalhe direto e inexistente                            | ❌     | idem                             | Testar ID válido/inválido.                                |
| 3. Cadastro/login/expiração/logout/troca                   | ❌     | idem                             | Testar retomada e isolamento entre duas contas.           |
| 4. Favoritos com falha e recuperação                       | ❌     | idem                             | Mutation otimista, falha MSW e rollback visível.          |
| 5. Carrinho/quantidades/remoção/cupom/refresh/login        | ❌     | idem                             | Testar limites, persistência e merge visitante.           |
| 6. Compra catálogo → recibo confirmado                     | ❌     | idem                             | Verificar criação e snapshot devolvidos pela simulação.   |
| 7. Recusa/clique repetido/timeout e mesmo pedido           | ❌     | idem                             | Verificar unicidade e recuperação idempotente.            |
| 8. Perfil/avatar/senha/carteiras e erros                   | ❌     | idem                             | Testar validações, autorização e persistência.            |
| 9. Preço/estoque Socket.IO durante checkout                | ❌     | idem                             | Evento pelo socket real interceptado por MSW e recotação. |
| 10. Duplicatas/antigos/desconexão/pendente                 | ❌     | idem                             | Garantir versão, estado terminal e reconciliação.         |
| 11. Teclado/foco de diálogos/validação                     | ❌     | idem                             | Asserções de foco e erros associados.                     |
| 12. Skeleton lento/falha/retry                             | ❌     | idem                             | Controlar latência e observar recuperação.                |
| Chromium desktop/mobile                                    | ❌     | sem playwright.config            | Projetos e viewports configurados.                        |
| Regressão visual início/detalhe/carrinho/pagamento         | ❌     | sem baselines                    | Capturas versionadas com dados estáveis.                  |
| Isolamento por teste, relógio/latência/eventos controlados | ❌     | sem fixtures E2E/MSW             | Reset completo e controles determinísticos.               |
| Relatório HTML e traces de falhas                          | ❌     | nenhum relatório/trace           | Configurar reporters, retenção e comandos.                |
| Asserções UI; REST via MSW e eventos via Socket.IO         | ❌     | nenhuma infraestrutura           | Evitar atalhos via setters/cache nos testes.              |

### 10. Lighthouse

| Requisito                                                        | Status | Evidência                          | O que falta                                                                                |
| ---------------------------------------------------------------- | ------ | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Início/detalhe mobile/desktop com build otimizado e mocks padrão | ❌     | build passou; sem Lighthouse/mocks | Configurar e auditar quatro combinações.                                                   |
| 3 medições por combinação e medianas                             | ❌     | nenhum relatório                   | Executar 12 medições, calcular mediana por categoria.                                      |
| Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90  | ⚠️     | nenhuma medição                    | Não há pontuação conhecida; medir antes de declarar atendimento.                           |
| Config versionada, HTML/JSON, versões e condições                | ❌     | inventário/package.json            | Runner, relatórios, ambiente, cache/rede/CPU documentados.                                 |
| LCP/CLS/TBT e causas de metas não atingidas                      | ❌     | build: PNG 1,89 MB, chunk >500 kB  | Medir métricas e investigar gargalos; tamanhos são indícios, não prova de pontuação baixa. |
| Auditoria sem retirar assets/fontes/funcionalidades              | ⚠️     | nenhuma auditoria                  | Usar mesma entrega e cenário padrão, sem otimização exclusiva para auditoria.              |

## Stack, documentação e entrega (seções 2, 11 e 12)

React, TypeScript, TanStack Router, Tailwind e componentes shadcn têm uso efetivo. TanStack Query, Axios e Socket.IO aparecem apenas no manifesto; MSW, Playwright e Lighthouse estão ausentes. A stack obrigatória não está integralmente atendida.

| Requisito                                                    | Status | Evidência                                     | O que falta                                                                                                              |
| ------------------------------------------------------------ | ------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Código, lockfile e assets                                    | ⚠️     | src, yarn.lock, src/assets                    | Preservar lock e comprovar instalação limpa; completar mocks/testes/configs.                                             |
| README de execução com env/credenciais/cenários/reset/falhas | ❌     | README.md começa com template TanStack Start  | Substituir na etapa final; não alterado nesta auditoria.                                                                 |
| Contratos REST/eventos, sessão/carrinho/cache/reconciliação  | ❌     | sem documentação técnica correspondente       | Documentar decisões efetivamente implementadas.                                                                          |
| ARCHITECTURE.md e docs/DECISOES.md                           | ❌     | inventário de arquivos                        | Registrar SPA/SSR, UX, limitações de transporte e desvios visuais.                                                       |
| Comandos dev mocks/build/preview/types/lint/E2E/Lighthouse   | ⚠️     | package.json:scripts                          | Build/preview/dev/lint existem; faltam demais e mocks ativos.                                                            |
| Deploy obrigatório, URL pública e link do repositório        | ⚠️     | nenhum endereço de entrega identificado       | Informar e validar versão pública, rotas diretas/refresh e mocks/socket. Não foi solicitado realizar deploy nesta etapa. |
| Checkout limpo sem serviços privados                         | ⚠️     | instalação não concluída; dados atuais locais | Comprovar setup reprodutível e fluxos simulados completos.                                                               |

## Eliminatórios — riscos destacados

| Item do enunciado                            | Diagnóstico                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ausência de uso efetivo da stack obrigatória | **Presente:** Query/Axios/Socket.IO sem uso; MSW e Playwright ausentes.                                                                                                                                |
| Fluxos principais apenas visuais             | **Presente:** autenticação e pagamento sem operação; carrinho apenas local e independente.                                                                                                             |
| Compra confirmada sem resposta da simulação  | **Presente:** `/payment/confirm` assume success sem consultar pedido. Prioridade imediata.                                                                                                             |
| Exposição de dados entre usuários            | **Não demonstrada, isolamento inexistente:** não há usuários reais simulados nem autorização. Acesso público ao recibo fixo não demonstra vazamento de conta real; requisito continua sem atendimento. |
| Eventos simulados diretamente na UI          | Não foram encontrados eventos nem simulação de tempo real; ausência de implementação não deve ser apresentada como atendimento. Implementar somente via rede MSW + Socket.IO.                          |
| Ausência de testes E2E executáveis           | **Presente:** scripts, runner e suites ausentes.                                                                                                                                                       |

O projeto atual não está apto à entrega pelos critérios eliminatórios. Build aprovado não altera esse diagnóstico.

## Plano priorizado de lacunas

Ordem recomendada, respeitando dependências:

1. **P0 — Base executável:** corrigir quatro erros de tipos e cinco de lint; padronizar gerenciador/versão e instalação pelo lock; adicionar comando typecheck. Registrar SPA e preparar bootstrap dos mocks antes de qualquer fetch.
2. **P0 — Contratos e simulação:** modelos tipados, ETH decimal exato, cliente Axios, QueryClient, handlers MSW, banco persistente e reset; duas contas, catálogo variado, erros e cenários determinísticos. Nenhuma resposta fictícia na UI.
3. **P0 — Sessão e isolamento:** cadastro/login/me/logout/expiração, guardas, autorização no mock, returnTo, chaves por usuário, cancelamento/limpeza de cache e subscriptions.
4. **P0 — Descoberta e carrinho funcionais:** URL como estado completo, detalhe por ID/404/estoque, favoritos persistidos com otimismo/rollback, carrinho visitante com merge, cupom e cotação autoritativa.
5. **P0 — Compra consistente:** revalidar e exigir reconfirmação; criar pedido idempotente; persistir tentativa e recuperar timeout; confirmação exclusivamente por pedido confirmado; snapshot imutável e remoção exata do comprado. Eliminar sucesso inferido da URL.
6. **P0 — Tempo real na rede:** MSW com binding Socket.IO, nft.updated/order.updated, identidade/versão, deduplicação, sessão e cleanup; reconciliação REST após reconectar; cenário de cotação obsoleta e recuperação do pedido pendente.
7. **P0 — E2E executável:** instalar/configurar Playwright e começar por compra, sessão/isolamento, idempotência e tempo real com falhas reais dos mocks. Executar no Chromium desktop/mobile, com HTML e traces. Expandir até todos os 12 fluxos da seção 9.
8. **P1 — Conta e UX completas:** perfil/avatar/senha/carteiras persistentes com validações; corrigir campos do pagamento mobile; retorno de login, ações auxiliares e todos os estados de erro/vazio/background.
9. **P1 — Acessibilidade e visual:** shimmer e reduced motion, labels/erros/live regions, foco/teclado/diálogos, semântica, idioma e contraste; validar 390/768/1440 e zoom contra referências, registrar baselines das quatro telas.
10. **P1 — Performance:** corrigir CSS inválido, investigar imagem/bundle/fontes; executar 12 medições Lighthouse no build com mocks e reportar medianas, LCP/CLS/TBT e justificativas.
11. **P1 — Entrega:** README final, ARCHITECTURE e DECISOES, contratos/políticas/cenários/limitações; publicar versão correspondente ao código e validar URLs diretas/refresh, mocks e socket; fornecer links.
12. **P2 — Acabamento:** resolver diferenças visuais restantes, melhorar instruções e ergonomia dos controles de cenário e automatizar verificações para evitar regressões.

P2 não deve adiar requisitos obrigatórios: todos os itens ❌ e as validações pendentes precisam de evidência antes da entrega final.
