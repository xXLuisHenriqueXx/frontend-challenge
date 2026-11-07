# Kurio — marketplace de NFTs

SPA React/TypeScript com TanStack Router/Query, Axios, Tailwind/shadcn, MSW e Socket.IO. Catálogo, compra e conta funcionam na simulação local, sem pagamento ou transferência real de NFTs.

[Repositório](https://github.com/xXLuisHenriqueXx/frontend-challenge) · **URL publicada: PENDENTE — preencher após publicação e verificação pelo responsável.** [Arquitetura e contratos](ARCHITECTURE.md) · [Entrega e deploy](docs/ENTREGA.md).

## Instalação e execução

Requisitos: Node **24.14.0** (ou versão 24 compatível), npm, Git e Chromium do Playwright. O lockfile oficial de instalação é `package-lock.json`; use `npm ci`.

```sh
git clone https://github.com/xXLuisHenriqueXx/frontend-challenge.git
cd frontend-challenge
npm ci
npx playwright install chromium
npm run dev
```

Abra `http://localhost:3000`. No PowerShell, se `npm.ps1` estiver bloqueado, use `npm.cmd`/`npx.cmd`. O worker MSW já está versionado em `public/mockServiceWorker.js`; não depende de postinstall para existir. O aviso do instalador sobre o postinstall opcional do MSW não impede esta configuração.

Antes de apagar/reinstalar node_modules no Windows, encerre o servidor Vite com Ctrl+C para liberar módulos nativos. Execute build, testes e Lighthouse sequencialmente em uma estação com pouca memória disponível.

MSW está ativo por padrão em dev **e no build de demonstração**. Nenhuma variável é necessária. O arquivo `.env.example` documenta:

| Variável          | Padrão             | Uso                                                                     |
| ----------------- | ------------------ | ----------------------------------------------------------------------- |
| `VITE_MOCKS`      | `true`             | `false` desliga a simulação e exige serviços REST/Socket.IO compatíveis |
| `VITE_API_URL`    | `/api`             | Base do Axios                                                           |
| `VITE_SOCKET_URL` | `wss://kurio.mock` | Origem fictícia interceptada pelo MSW; não é serviço externo            |

Credenciais fictícias: `ana@kurio.test` e `bruno@kurio.test`, ambas com senha **`Kurio123!`**. Cadastro cria novas contas locais. Cupom válido: **`KURIO10`**.

## Scripts

| npm run          | Finalidade                                            |
| ---------------- | ----------------------------------------------------- |
| dev              | Desenvolvimento em 3000 com mocks ativos por padrão   |
| build            | Produção estática em dist com mocks                   |
| preview          | Servir dist localmente                                |
| generate-routes  | Regenerar árvore TanStack Router                      |
| typecheck        | TypeScript sem emissão                                |
| lint             | ESLint, falha também em warnings                      |
| check / format   | Conferir/aplicar formatação e correções ESLint        |
| test:e2e         | Build, preview 3100 e suíte completa desktop/mobile   |
| test:e2e:update  | Atualizar baselines; revisar cada diff                |
| test:e2e:report  | Abrir HTML da última execução                         |
| test:a11y        | Axe, teclado, foco, reflow e reduced motion           |
| test:design      | Nove telas em três larguras e geometria dos skeletons |
| test:unit        | Regras puras com node:test                            |
| test:integration | Contratos REST via Axios/MSW                          |
| test:realtime    | Transporte Socket.IO pelo MSW                         |
| lighthouse       | Build, preview 3200 e 12 medições/medianas            |

## Build e rotas

```sh
npm run typecheck
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 3000
```

Rotas: `/`, `/product/1`, `/cart`, `/login`, `/register`, `/profile`, `/wallets`, `/payment` e `/payment/confirm?orderId=ID`. Recibo exige pedido existente e sessão proprietária. Pagamento, perfil e carteiras também são protegidos. Acesso direto e refresh funcionam no preview; hospedagem pública precisa oferecer fallback para `index.html` e servir assets/worker sem reescrita.

`vercel.json` configura build Vite, saída `dist` e fallback SPA, seguindo a [documentação Vite/Vercel](https://vercel.com/docs/frameworks/frontend/vite) e a [configuração de rewrites](https://vercel.com/docs/project-configuration/vercel-json). A configuração não comprova publicação. Ainda é necessário publicar esta revisão e validar URL, rotas diretas/refresh, worker, REST e Socket.IO no host público.

## Cenários e recuperação de falhas

Abra `/?reset=1&scenario=success` para restaurar 36 NFTs, duas contas, estoque e todos os dados. Isso encerra sessão e limpa rascunhos/tentativas da aba. Depois abra `/` sem `reset=1` para testar persistência em refresh.

Selecione qualquer cenário abaixo por `?scenario=NOME` e recarregue. O cenário é persistido. Para alterar durante o fluxo sem desmontar a tela, use o console do navegador:

```js
await fetch("/api/mock/scenario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenario: "payment-refused" }),
});
```

| Cenário                            | Como observar                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `success`                          | Catálogo normal; latência 120 ms; compra confirma                                                 |
| `empty`                            | Catálogo sem resultados                                                                           |
| `slow`                             | Latência de 1800 ms; skeletons no catálogo/detalhe/resumo                                         |
| `out-of-order`                     | Busca de comprimento ímpar demora 1500 ms; par, 100 ms; troque rapidamente                        |
| `offline`                          | Falha de conexão em operações REST                                                                |
| `http-400`, `http-500`             | Respostas 400/503; volte a success e use Tentar novamente                                         |
| `expired`, `unauthorized`          | Recursos privados retornam 401 e pedem novo login                                                 |
| `register-conflict`                | Cadastro retorna conflito                                                                         |
| `favorite-failure`                 | Favoritar falha e desfaz atualização otimista                                                     |
| `coupon-invalid`, `coupon-expired` | Aplique cupom no carrinho e observe a validação                                                   |
| `price-changed`, `sold-out`        | Confirme uma compra revisada; o mock altera preço/estoque, rejeita a cotação e exige revisão      |
| `order-timeout`                    | Pedido é criado, mas a resposta excede o timeout; use Recuperar tentativa, inclusive após refresh |
| `payment-refused`                  | Pedido termina recusado e preserva itens/estoque                                                  |
| `wallet-refused`                   | Conectar carteira é recusado                                                                      |
| `duplicate-events`                 | Eventos transmitidos duas vezes com mesmo ID/versão                                               |
| `old-events`                       | Evento atual seguido de versão antiga com dados obsoletos                                         |
| `socket-offline`                   | Interrompe conexões; voltar a success permite reconexão e reconciliação REST                      |
| `pending-orders`                   | Mantém pedidos pendentes após refresh; voltar a success permite liquidação                        |

Para reproduzir preço/estoque em tempo real, adicione NFT 1, entre no pagamento, preencha código de indicação, conecte carteira e revise. Sem sair da tela:

```js
await fetch("/api/mock/nft", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: "1", price: "2.19", stock: 5 }),
});
```

Aviso e novo total chegam pelo Socket.IO; a compra exige nova revisão. Use `stock: 0` para esgotar. `POST /api/mock/expire` com `{}` expira a sessão. `POST /api/mock/reset` com `{scenario:'success'}` restaura dados; recarregue depois para descartar caches da interface. Controles `/api/mock/timing` estão em [MOCKS.md](ARCHITECTURE.md#transporte-e-protocolo).

Fluxo: explorar NFT → Comprar → Carrinho → Conectar e finalizar → login se necessário → preencher dados obrigatórios → Conectar carteira → Revisar compra → Confirmar compra → recibo pendente/confirmado ou recusado. Confirmação vem da simulação, nunca de parâmetro `status` da URL.

## Testes

```sh
npm run test:unit
npm run test:integration
npm run test:realtime
npm run test:e2e
npm run test:e2e:report
npm run test:design
```

`test:e2e` faz build, inicia preview próprio em **3100**, executa Chromium em 390/1440 e acessibilidade também em 768, gera HTML e encerra o preview. A porta deve estar livre. São 52 testes: 32 funcionais/de publicação local, dois percursos com oito capturas visuais e 18 de acessibilidade. Cada teste restaura MSW; REST e Socket.IO usam a camada real de mocks. As verificações de publicação local incluem worker JavaScript, 404 e acesso direto/refresh de detalhe, carrinho, perfil, carteiras, pagamento e recibo.

`npm run test:a11y` executa somente acessibilidade. `npm run test:e2e:update` atualiza referências; revise as diferenças antes de versionar. Referências atuais: Chromium 158/Windows; outros sistemas podem precisar de referências próprias por renderização de fontes. Relógio fixo e animações desativadas nas capturas. Traces e screenshots das falhas ficam em `test-results`, HTML em `playwright-report`; artefatos de execução são ignorados pelo Git. Oito PNGs de referência são versionados em `tests/e2e/visual.spec.ts-snapshots`.

As configurações respeitam `PLAYWRIGHT_BROWSERS_PATH`; também reconhecem `.npm-cache/playwright`, se existir. Detalhes em [política de testes](ARCHITECTURE.md#execução-e-limites-de-validação). Execute os comandos sequencialmente em máquinas com pouca memória.

test:unit executa 31 casos de regras puras com node:test. test:design executa 27 capturas das nove telas em 390/768/1440 e três verificações de geometria dos skeletons. Capturas/métricas ficam em reports/fidelity/after; FIDELITY_PHASE=before seleciona a pasta inicial. O mapa de referências e as exceções estão em [arquitetura](ARCHITECTURE.md#decisões-de-ux-e-desvios-do-figma).

## Lighthouse

```sh
npm run lighthouse
```

O comando faz build otimizado, inicia preview próprio em **3200** e executa **12 auditorias**: início e detalhe, mobile/desktop, três execuções por combinação. Usa perfil Chromium novo por medição, cache frio, dados restaurados e cenário `success` com latência 120 ms. Mocks, Socket.IO, imagens, fontes e funcionalidades permanecem ativos; não há modo de aplicação exclusivo da auditoria. `lighthouse.config.mjs` usa os perfis simulados padrão do Lighthouse: mobile Slow 4G/CPU 4x e desktop Dense 4G.

HTML/JSON individuais e `summary.json` ficam em `reports/lighthouse/delivery/`. O resumo inclui medianas de Performance, Accessibility, Best Practices, SEO, LCP/CLS/TBT, ambiente, versões, condições e hash dos arquivos auditados. Metas: 90/95/95/90. O comando retorna sucesso quando a coleta termina; `meetsTargets` e a auditoria documentam se todas as metas foram atingidas.

Para investigação, `npm run lighthouse -- --runs=1 --label=investigacao` executa uma medição por combinação em outro diretório. Isso não substitui as três execuções finais. `CHROME_PATH` permite indicar executável compatível; por padrão usa Chromium do Playwright. Não execute E2E/Lighthouse simultaneamente.

Os relatórios atuais ficam em delivery; os finais protegidos da etapa 6 permanecem em reports/lighthouse/final como histórico.

## Publicação

O responsável publica com sua conta conforme [ENTREGA](docs/ENTREGA.md#publicação-manual-na-vercel). A configuração local não comprova publicação: verificar URL, commit, worker, Socket.IO e acesso direto/refresh antes de preencher a URL acima. Guia oficial: [Deploy por CLI](https://vercel.com/docs/projects/deploy-from-cli).

## Relatórios e limites

Relatório Playwright entregue em reports/playwright/final; o HTML temporário e traces de falha ficam em playwright-report e test-results. Capturas exploratórias de test:design em reports/fidelity são geradas/ignoradas. O arquivo yarn.lock foi preservado pela regra de não apagar lockfiles; o fluxo oficial e validado é npm ci com package-lock.json.

Figma/fonte exata indisponíveis, recortes de 212×212, preservação de controles funcionais e ajustes de acessibilidade estão em [ARCHITECTURE](ARCHITECTURE.md#decisões-de-ux-e-desvios-do-figma). Automação não substitui revisão humana. Métricas atuais e pendências constam em [ENTREGA](docs/ENTREGA.md).
