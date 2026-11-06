# Kurio — marketplace de NFTs

SPA React/TypeScript com TanStack Router, TanStack Query, Axios, Tailwind/shadcn, MSW e Socket.IO. Catálogo, conta, carteiras e compra são funcionais na simulação local. Não há transferência real de NFTs, gateway de pagamento ou backend privado.

[Repositório](https://github.com/xXLuisHenriqueXx/frontend-challenge). **URL pública: pendente de publicação e validação**; não há evidência de deploy nesta entrega local.

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

MSW está ativo por padrão em dev **e no build de demonstração**. Nenhuma variável é necessária. O arquivo `.env.example` documenta:

| Variável          | Padrão             | Uso                                                                     |
| ----------------- | ------------------ | ----------------------------------------------------------------------- |
| `VITE_MOCKS`      | `true`             | `false` desliga a simulação e exige serviços REST/Socket.IO compatíveis |
| `VITE_API_URL`    | `/api`             | Base do Axios                                                           |
| `VITE_SOCKET_URL` | `wss://kurio.mock` | Origem fictícia interceptada pelo MSW; não é serviço externo            |

Credenciais fictícias: `ana@kurio.test` e `bruno@kurio.test`, ambas com senha **`Kurio123!`**. Cadastro cria novas contas locais. Cupom válido: **`KURIO10`**.

## Build e rotas

```sh
npm run typecheck
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 3000
```

Rotas: `/`, `/product/1`, `/cart`, `/login`, `/register`, `/profile`, `/wallets`, `/payment` e `/payment/confirm?orderId=ID`. Recibo exige pedido existente e sessão proprietária. Pagamento, perfil e carteiras também são protegidos. Acesso direto e refresh funcionam no preview; hospedagem pública precisa oferecer fallback para `index.html` e servir assets/worker sem reescrita.

`vercel.json` configura build Vite, saída `dist` e fallback SPA, seguindo a [documentação Vite/Vercel](https://vercel.com/docs/frameworks/frontend/vite) e a [configuração de rewrites](https://vercel.com/docs/project-configuration/vercel-json). A configuração não comprova publicação. Ainda é necessário publicar esta revisão e validar URL, rotas diretas/refresh, worker, REST e Socket.IO no host público.

## Cenários reproduzíveis

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

Aviso e novo total chegam pelo Socket.IO; a compra exige nova revisão. Use `stock: 0` para esgotar. `POST /api/mock/expire` com `{}` expira a sessão. `POST /api/mock/reset` com `{scenario:'success'}` restaura dados; recarregue depois para descartar caches da interface. Controles `/api/mock/timing` estão em [MOCKS.md](docs/MOCKS.md).

Fluxo: explorar NFT → Comprar → Carrinho → Conectar e finalizar → login se necessário → preencher dados obrigatórios → Conectar carteira → Revisar compra → Confirmar compra → recibo pendente/confirmado ou recusado. Confirmação vem da simulação, nunca de parâmetro `status` da URL.

## Testes

```sh
npm run test:integration
npm run test:realtime
npm run test:e2e
npm run test:e2e:report
```

`test:e2e` faz build, inicia preview próprio em **3100**, executa Chromium em 390/1440 e acessibilidade também em 768, gera HTML e encerra o preview. A porta deve estar livre. São 48 testes: 28 funcionais, dois percursos com oito capturas visuais e 18 de acessibilidade. Cada teste restaura MSW; REST e Socket.IO usam a camada real de mocks.

`npm run test:a11y` executa somente acessibilidade. `npm run test:e2e:update` atualiza referências; revise as diferenças antes de versionar. Referências atuais: Chromium 158/Windows; outros sistemas podem precisar de referências próprias por renderização de fontes. Relógio fixo e animações desativadas nas capturas. Traces e screenshots das falhas ficam em `test-results`, HTML em `playwright-report`; artefatos de execução são ignorados pelo Git. Oito PNGs de referência são versionados em `tests/e2e/visual.spec.ts-snapshots`.

As configurações respeitam `PLAYWRIGHT_BROWSERS_PATH`; também reconhecem `.npm-cache/playwright`, se existir. Detalhes em [TESTES.md](docs/TESTES.md). Execute os comandos sequencialmente em máquinas com pouca memória.

## Lighthouse

```sh
npm run lighthouse
```

O comando faz build otimizado, inicia preview próprio em **3200** e executa **12 auditorias**: início e detalhe, mobile/desktop, três execuções por combinação. Usa perfil Chromium novo por medição, cache frio, dados restaurados e cenário `success` com latência 120 ms. Mocks, Socket.IO, imagens, fontes e funcionalidades permanecem ativos; não há modo de aplicação exclusivo da auditoria. `lighthouse.config.mjs` usa os perfis simulados padrão do Lighthouse: mobile Slow 4G/CPU 4x e desktop Dense 4G.

HTML/JSON individuais e `summary.json` ficam em `reports/lighthouse/final/`. O resumo inclui medianas de Performance, Accessibility, Best Practices, SEO, LCP/CLS/TBT, ambiente, versões, condições e hash dos arquivos auditados. Metas: 90/95/95/90. O comando retorna sucesso quando a coleta termina; `meetsTargets` e a auditoria documentam se todas as metas foram atingidas.

Para investigação, `npm run lighthouse -- --runs=1 --label=investigacao` executa uma medição por combinação em outro diretório. Isso não substitui as três execuções finais. `CHROME_PATH` permite indicar executável compatível; por padrão usa Chromium do Playwright. Não execute E2E/Lighthouse simultaneamente.

## Arquitetura, decisões e limites

- [Arquitetura](docs/ARQUITETURA.md) e [ARCHITECTURE.md](ARCHITECTURE.md): SPA, cache, sessão, checkout e reconciliação.
- [API](docs/API.md): contratos REST, ETH decimal e erros.
- [Mocks](docs/MOCKS.md): Socket.IO, cenários e limites locais.
- [Decisões](docs/DECISOES.md): assets, acessibilidade e otimizações.
- [Auditoria final](docs/AUDITORIA.md): requisitos, métricas, evidências e pendências.

O código recebido já utilizava Vite/Router em SPA; não foi introduzido SSR/TanStack Start. A stack obrigatória do enunciado é efetiva. Dados simulados são locais e não oferecem segurança nem sincronização multiaba de produção. SHA-256 com salt é somente simulação. As referências visuais seguem o código e as capturas recebidas; o Figma original não foi verificado. Automação não substitui leitor de tela e inspeção humana de teclado/zoom. Publicação pública permanece pendente.
