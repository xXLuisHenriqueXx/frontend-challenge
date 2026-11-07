# Arquitetura do Kurio

O Kurio é um marketplace de NFTs feito em React e TypeScript, com descoberta, compra e conta do colecionador funcionando de ponta a ponta sobre uma API simulada. Este documento explica como o projeto foi organizado, por que algumas decisões foram tomadas e onde estão os limites da simulação.

- Aplicação publicada: https://frontend-challenge-sigma-sable.vercel.app
- Repositório: https://github.com/xXLuisHenriqueXx/frontend-challenge
- Como rodar, credenciais e cenários de falha: veja o [README](README.md).

## Sumário

1. [Visão geral](#visão-geral)
2. [Como o app inicia](#como-o-app-inicia)
3. [Estrutura do código](#estrutura-do-código)
4. [Dados, URL e cache](#dados-url-e-cache)
5. [Sessão](#sessão)
6. [Carrinho](#carrinho)
7. [Checkout e pedidos](#checkout-e-pedidos)
8. [Contratos REST](#contratos-rest)
9. [Mocks com MSW](#mocks-com-msw)
10. [Tempo real com Socket.IO](#tempo-real-com-socketio)
11. [Acessibilidade](#acessibilidade)
12. [Decisões de UX e desvios do Figma](#decisões-de-ux-e-desvios-do-figma)
13. [Testes](#testes)
14. [Performance](#performance)
15. [Deploy](#deploy)
16. [Limitações conhecidas](#limitações-conhecidas)

## Visão geral

| Responsabilidade | Tecnologia                       | Papel na solução                                        |
| ---------------- | -------------------------------- | ------------------------------------------------------- |
| Interface        | React + TypeScript               | Telas, formulários e estados de interface               |
| Roteamento       | TanStack Router                  | Rotas, search params tipados, guardas de rotas privadas |
| Estado remoto    | TanStack Query                   | Consultas, mutations, cache, atualização otimista       |
| Cliente HTTP     | Axios                            | Único caminho para chamadas REST                        |
| Tempo real       | Socket.IO (cliente)              | Eventos `nft.updated` e `order.updated`                 |
| Estilo           | Tailwind CSS + shadcn/ui         | Tokens do projeto e primitivos de interface             |
| Mocking          | MSW + `@mswjs/socket.io-binding` | Toda a API e o servidor de eventos simulados            |
| Testes           | Playwright, axe                  | E2E, regressão visual e acessibilidade                  |
| Auditoria        | Lighthouse                       | Performance, acessibilidade, boas práticas e SEO        |

A regra que guiou o projeto: **tudo o que é fingimento vive na camada de rede**. Componentes, hooks e o cliente Axios não conhecem respostas fictícias nem caminhos alternativos de negócio. Se eu desligar os mocks e apontar para uma API compatível, a interface não muda.

## Como o app inicia

O projeto nasceu a partir do template TanStack Start, mas a entrega é uma **SPA estática** (Vite, renderização no cliente). Escolhi assim porque o MSW e o `socket.io-client` rodam no navegador e porque uma SPA publica em qualquer host estático sem servidor. Não usei server functions nem API routes do Start para simular backend.

No arranque, `src/main.tsx` carrega o app e os mocks em paralelo e **espera o worker do MSW iniciar antes de montar** o `QueryClientProvider` e o `RouterProvider`. Assim nenhuma requisição escapa sem interceptação. Se o worker falhar ao iniciar, o erro aparece na tela em vez de a aplicação seguir com chamadas quebradas.

Os mocks ficam ativos por padrão, inclusive no build publicado. `VITE_MOCKS=false` desliga a simulação e exige uma API REST e um servidor Socket.IO compatíveis.

## Estrutura do código

```text
src/
  routes/                    # Registro de rotas, search params validados e guardas
  features/
    catalog/                 # Catálogo, filtros, busca e favoritos
    nft/                     # Galeria, descrição e controles de compra
    cart/                    # Itens, cupom e cotação
    checkout/                # Dados do colecionador, conexão, revisão e idempotência
    auth/                    # Identidade, login, cadastro e logout
    profile/                 # Perfil, avatar e senha
    wallets/                 # Carteiras principal e secundária
    orders/                  # Consulta de pedido e recibo
    realtime/                # Assinatura, deduplicação e reconciliação
  shared/
    api/                     # Cliente HTTP, query keys e erros de transporte
    components/              # Layout, campos, preço em ETH, quantidade, estados
    lib/                     # Decimal com BigInt, validação, mapeamento de erros
  components/ui/             # Primitivos shadcn/ui
  api/                       # Reexports de compatibilidade (sem clientes duplicados)
  mocks/                     # Backend simulado em MSW, sem dependência da interface
```

Algumas convenções que mantive:

- Cada feature separa `api/`, `hooks/`, `components/` e `types/` conforme a necessidade; não criei pastas vazias para cumprir um modelo.
- Componentes `*-page` ligam hooks à tela. As views (`*-view`) recebem props tipadas e **não buscam dados nem chamam Axios**.
- Existe um único cliente Axios e um único `QueryClient`, em `shared/api/http.ts`. As query keys vêm de uma fábrica tipada em `shared/api/query-keys.ts`.
- Regras de preço (decimal), formatação de ETH, validação e mapeamento de erros são funções puras, testadas sem a interface.
- Nomes de arquivo em kebab-case, componentes e tipos em PascalCase, hooks como `use-*`. Não há um barrel genérico que arraste todas as telas para o mesmo bundle.
- A interface nunca importa o banco dos mocks. Provedores de carteira e rótulos de navegação são configuração de apresentação; todo o resto (catálogo, detalhe, carrinho, cotação, carteiras, pedidos) vem da API.

## Dados, URL e cache

### A URL é o estado do catálogo

Busca, coleção, rede, categoria, ordenação, página e faixa de preço compõem os search params tipados da rota inicial. Isso garante que refresh e histórico do navegador funcionem sem esforço extra. Mudar qualquer filtro **reinicia a página**. A mesma estrutura validada serve de parâmetro do Axios e de chave da consulta, então não existe um cache paralelo que possa sobrescrever um resultado mais novo com um mais antigo.

### Query keys e isolamento por usuário

| Tipo           | Chave                                                       |
| -------------- | ----------------------------------------------------------- |
| Catálogo       | `['nfts', search]`                                          |
| Detalhe        | `['nft', id]`                                               |
| Sessão         | `['session']`                                               |
| Dados privados | `['private', userId, recurso, ...]` (visitante usa `guest`) |

Dados privados nunca entram em caches globais de catálogo. No logout ou na troca de usuário, as requisições em andamento são canceladas, o cache privado e a sessão são removidos e as consultas ativas são invalidadas. O cliente também envia a identidade da sessão conhecida no header `X-Session-User`; o mock rejeita requisições iniciadas por uma sessão que já foi substituída.

### Política de cache, retries e sincronização

| Item                         | Política                                                                  |
| ---------------------------- | ------------------------------------------------------------------------- |
| `staleTime` padrão           | 15 s                                                                      |
| `gcTime`                     | 5 min                                                                     |
| Refetch ao focar a janela    | Ativo                                                                     |
| Sessão e cotação             | `staleTime` zero, sempre revalidadas                                      |
| Retries em GET e cotação     | No máximo uma repetição, apenas para erro de rede ou 5xx; nunca em 4xx    |
| Retries em mutations         | Nenhum automático (evita duplicar operações)                              |
| Cancelamento                 | Todo GET recebe o `AbortSignal` do Query; cotações também                 |
| Atualização em segundo plano | A tela mantém o resultado anterior da mesma chave e anuncia a atualização |

### Atualização otimista

Favoritos usam atualização otimista com rollback. A mutation cancela a consulta em andamento, guarda um snapshot, altera a lista na hora, restaura o snapshot se a requisição falhar e invalida a consulta ao terminar para reconciliar com a API. O botão fica indisponível enquanto a mutation corre. O cenário `favorite-failure` reproduz a falha.

Mutations do carrinho invalidam os recursos privados daquele usuário, incluindo a cotação. Consultas com erro oferecem "Tentar novamente"; mutations conectadas dão feedback acessível.

## Sessão

- A sessão dura **30 minutos** e carrega um token aleatório, persistido junto dela. Após refresh, `/auth/session` recupera a mesma sessão.
- O cliente envia identidade e token nas requisições privadas. Respostas de conta nunca incluem hash nem salt. Senhas não são guardadas em claro: o mock persiste apenas SHA-256 com salt, que é uma simulação e não substitui uma derivação de chave adequada em um servidor real.
- A sessão é revalidada ao montar, nas guardas de rotas privadas, ao focar a janela e a cada 15 s.
- Uma resposta 401 limpa os dados privados e **preserva a URL atual**. Após o login, o usuário volta para onde estava. O destino de retorno é validado: endereços externos e `//host` são rejeitados.
- Checkout, perfil, carteiras, favoritos e pedidos exigem autenticação. Carrinho, rascunho do colecionador e tentativa de compra ficam preservados por usuário, inclusive durante uma expiração.
- Logout e troca de conta encerram o socket e removem listeners **antes** de limpar o cache privado.

Os dados do mock ficam em `localStorage` (`kurio.mock.v1`) para sobreviver a refresh. Isso é uma simulação local, sem cookies reais nem backend, e não oferece segurança de produção.

## Carrinho

- Itens são identificados por NFT e edição, e as quantidades respeitam a disponibilidade de cada uma. Quantidades são sempre inteiras.
- O carrinho persiste no banco do mock e sobrevive a refresh.
- **Visitante que faz login:** os itens do carrinho de visitante são mesclados ao carrinho da conta, somando quantidades até o limite de estoque; depois o carrinho de visitante é esvaziado. O logout não apaga o carrinho autenticado nem o expõe ao visitante.
- `POST /cart/items` substitui a quantidade absoluta por padrão (edição) e aceita `mode: 'add'` para somar.
- Cupom: aplicar e remover pela cotação. `KURIO10` dá 10%; cupons inválidos e expirados retornam erro de validação tratado na tela.
- A cotação traz subtotal, desconto, taxa de rede e total, todos vindos da API. A taxa simulada é fixa em `0.016` ETH para carrinho não vazio, e a cotação vale 60 segundos.
- **Valores em ETH** trafegam como strings decimais com até 18 casas. Os cálculos usam inteiros `BigInt` em unidades de 10⁻¹⁸ ETH, então não há erro de arredondamento binário.
- Mudanças de preço e disponibilidade recebidas por Socket.IO enquanto o carrinho está aberto atualizam o resumo e são anunciadas.

## Checkout e pedidos

O fluxo é: dados do colecionador, seleção de carteira e rede, conexão simulada, revisão e envio.

- **Revalidação.** Antes de confirmar, o servidor revalida itens, preço, disponibilidade, cupom e taxas. Se algo mudou, a resposta é um conflito 409, a interface recarrega a cotação e exige uma nova confirmação.
- **Idempotência.** Cada tentativa gera uma chave aleatória por usuário, guardada em `sessionStorage`, com `quoteId` e `walletId` fixos. Cliques repetidos e reenvios após timeout reutilizam a mesma chave e recuperam o mesmo pedido. Reutilizar a chave com outro corpo gera 409. Em erro de negócio, a tentativa é descartada e a cotação é recarregada.
- **Estados do pedido.** `pending`, `confirmed` e `refused`. Os dois últimos são terminais e nunca regridem. O resultado é decidido na criação; mudar o cenário depois não altera um pedido terminal.
- **Confirmação só quando existe.** A URL de confirmação carrega apenas o `orderId`, nunca um status. A tela consulta a API; pedido inexistente ou de outro usuário mostra o erro correspondente.
- **Recuperação.** Pedido pendente se recupera após refresh ou queda de conexão, por Socket.IO e por polling REST de segurança. O polling para quando o pedido chega a um estado terminal.
- **Recibo imutável.** O pedido guarda uma cópia da cotação e da carteira no momento da compra. Alterações posteriores no catálogo não mudam o recibo.
- **Carrinho após a compra.** Apenas as quantidades efetivamente compradas saem do carrinho; acréscimos feitos depois permanecem. Em falha ou recusa, os itens e o estoque são preservados. Se faltar estoque na liquidação, o pedido é recusado e o estoque nunca fica negativo.
- Referências de transação e links de exploração são simulados, e nenhuma transferência real acontece.

## Contratos REST

Base `/api` (configurável por `VITE_API_URL`). O transporte é o Axios e a simulação é `src/mocks/handlers.ts`. Os tipos compartilhados ficam em `src/api/contracts.ts` e nas pastas `types/` de cada feature.

### Formato de erro

```ts
{ code: string; message: string; fields?: Record<string, string> }
```

| HTTP | Quando                                                     |
| ---- | ---------------------------------------------------------- |
| 400  | Solicitação inválida                                       |
| 401  | Sessão inválida ou expirada                                |
| 403  | Recurso de outro usuário                                   |
| 404  | Recurso inexistente                                        |
| 409  | Conflito: conta, estoque, cotação ou chave de idempotência |
| 422  | Validação de campos                                        |
| 503  | Indisponibilidade transitória                              |

Falha de conexão simulada não tem resposta HTTP.

### Recursos

| Método e caminho              | Entrada                                                                   | Resposta                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| POST `/auth/register`         | `{email, username, password}` (e-mail válido, username ≥ 3, senha ≥ 8)    | 201 `{ok:true}`; 409 se e-mail ou username já existem                                           |
| POST `/auth/login`            | `{email, password}`                                                       | `Session {user, token, expiresAt}`; mescla o carrinho de visitante                              |
| GET `/auth/session`           | n/d                                                                       | Session ou 401                                                                                  |
| POST `/auth/logout`           | n/d                                                                       | `{ok:true}`                                                                                     |
| GET `/nfts`                   | `q, collection, network, category, sort, page, min, max`                  | `Catalog {items, total, pages}`, 9 itens por página                                             |
| GET `/nfts/:id`               | ID                                                                        | Nft ou 404                                                                                      |
| GET `/favorites`              | Sessão                                                                    | IDs de NFT                                                                                      |
| PUT / DELETE `/favorites/:id` | Sessão                                                                    | Lista atualizada; PUT não duplica                                                               |
| GET `/cart`                   | Visitante ou sessão                                                       | `{items, coupon}` com preços e estoque atuais                                                   |
| POST `/cart/items`            | `{nftId, edition, quantity, mode?}`                                       | Carrinho atualizado                                                                             |
| DELETE `/cart/items/:id`      | ID da linha (`nftId:edition`, URI-encoded)                                | Carrinho atualizado                                                                             |
| POST `/quote`                 | `{coupon?}`                                                               | Quote com snapshot dos itens, subtotal, desconto, taxa, total e `expiresAt`; cupom vazio remove |
| POST `/wallet-connection`     | `{walletId, network}`                                                     | `{connectionId}`; recusa e rede incompatível retornam 422                                       |
| DELETE `/wallet-connection`   | Sessão                                                                    | Encerra as conexões da sessão                                                                   |
| POST `/orders`                | `{quoteId, walletId, connectionId, collector}` + header `Idempotency-Key` | 201 pedido pendente; mesma tentativa retorna 200 com o mesmo pedido                             |
| GET `/orders/:id`             | Sessão proprietária                                                       | Order com status, versão e recibo                                                               |
| GET `/profile`                | Sessão                                                                    | Usuário público                                                                                 |
| PATCH `/profile`              | `{displayName, username?, email?, ens?, walletNickname?, avatar?}`        | Usuário atualizado; avatar vazio ou data URL PNG, JPEG ou WebP                                  |
| POST `/profile/password`      | `{currentPassword, password}`                                             | `{ok:true}`                                                                                     |
| GET `/wallets`                | Sessão                                                                    | Carteiras                                                                                       |
| POST `/wallets`               | `{name, address, network, role?, nickname?, profileName?, ens?}`          | Carteiras atualizadas; endereço `0x` com 40 hexadecimais; máximo de duas                        |
| PATCH `/wallets/:id`          | Mesmo corpo                                                               | Carteiras atualizadas; 404 se não pertence ao usuário                                           |

### Modelos principais

- **Nft:** `id, name, price, collection, network, category, stock, version` e os dados do detalhe. Redes: Ethereum, Polygon e Solana. Categorias: `new` e `hot` (vazio significa todas). Ordenação: `recent`, `price-asc`, `price-desc`. Parâmetros inválidos são normalizados pelo mesmo parser na rota e no mock.
- **CartLine:** `id, nftId, name, tokenId, edition, price, quantity, stock`.
- **Quote:** `id, items, subtotal, discount, fee, total, coupon, expiresAt`.
- **Order:** `id, userId, status, quote` (cópia imutável)`, wallet` (cópia)`, transactionId` simulado`, createdAt, version`.
- **Chave de idempotência:** isolada por usuário e persistida. O corpo canônico inclui `{quoteId, walletId, collector, connectionId}`. Mesma chave e mesmo corpo recuperam o pedido; qualquer diferença gera 409.

## Mocks com MSW

O MSW intercepta a rede no navegador (e no Node, nos testes de integração). Os handlers mantêm **um estado único** entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos, persistido em `localStorage` para sobreviver a refresh. O worker fica versionado em `public/mockServiceWorker.js`.

A base traz 36 NFTs com variedade de coleções, redes, categorias e preços (para exercitar filtros e paginação) e duas contas de teste. As credenciais estão no README.

### Controle dos mocks

Disponível apenas com os mocks ativos. Esses endpoints também passam pela rede; não existem atalhos de negócio nos hooks.

| Método e caminho      | Entrada                         | Efeito                                                                                                                          |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| POST `/mock/reset`    | `{scenario?}`                   | Restaura as 36 fixtures, contas, estoque, carrinhos, favoritos, carteiras, cupons, cotações, pedidos e chaves; encerra a sessão |
| POST `/mock/scenario` | `{scenario}`                    | Troca o cenário sem resetar dados                                                                                               |
| POST `/mock/expire`   | `{}`                            | Expira a sessão atual                                                                                                           |
| POST `/mock/nft`      | `{id, price?, stock?}`          | Altera o recurso, incrementa a versão e publica `nft.updated` pelo Socket.IO                                                    |
| POST `/mock/timing`   | `{latency?, settlementPaused?}` | Controla latência e liquidação de pedidos                                                                                       |

Abrir `/?reset=1&scenario=success` restaura tudo. `?scenario=NOME` em qualquer rota seleciona um cenário persistente depois de recarregar. Parâmetros de controle não são filtros do catálogo.

### Cenários determinísticos

| Cenário                            | Comportamento                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `success`                          | Latência de 120 ms, catálogo normal e pagamento confirmado                                                                   |
| `empty`                            | Catálogo vazio                                                                                                               |
| `slow`                             | Latência de 1800 ms (skeletons visíveis)                                                                                     |
| `out-of-order`                     | Busca com comprimento ímpar demora 1500 ms e par demora 100 ms                                                               |
| `offline`                          | Falha de conexão                                                                                                             |
| `http-400`, `http-500`             | Respostas 400 e 503 nas operações de negócio                                                                                 |
| `expired`, `unauthorized`          | 401 nos recursos privados                                                                                                    |
| `register-conflict`                | Cadastro retorna 409                                                                                                         |
| `favorite-failure`                 | Mutation de favorito falha (503) e a interface desfaz a atualização otimista                                                 |
| `coupon-invalid`, `coupon-expired` | Cotação com cupom retorna 422                                                                                                |
| `price-changed`, `sold-out`        | A primeira criação de pedido altera preço ou estoque e retorna 409; a mudança fica no catálogo e o cenário volta a `success` |
| `order-timeout`                    | O pedido é criado, mas a resposta demora 6 s; o Axios expira em 4 s e a mesma chave recupera o pedido                        |
| `payment-refused`                  | O pedido termina recusado e preserva o carrinho                                                                              |
| `wallet-refused`                   | A conexão da carteira é recusada                                                                                             |
| `duplicate-events`                 | Eventos enviados duas vezes com o mesmo ID e versão                                                                          |
| `old-events`                       | Evento atual seguido de uma versão antiga                                                                                    |
| `socket-offline`                   | Derruba as conexões; voltar a `success` permite reconectar e reconciliar                                                     |
| `pending-orders`                   | Mantém pedidos pendentes após refresh                                                                                        |

Validações de cadastro, perfil, senha, carteiras e quantidade são determinísticas por payload inválido e não dependem do cenário global. Os endpoints de controle não sofrem as falhas do cenário.

## Tempo real com Socket.IO

### Transporte e limitações

Usei `@mswjs/socket.io-binding` **0.2.0** com MSW 2.12.7. A API dessa versão é `toSocketIo(connection)`; o README do pacote instalado é a referência (a branch `main` do repositório pode mostrar uma API diferente).

- O cliente usa exclusivamente **WebSocket**, sem polling Engine.IO nem upgrades.
- O endpoint padrão é `wss://kurio.mock`, com path `/socket.io/`. Não existe serviço nesse domínio: o MSW intercepta a conexão. Nessa versão, o matcher WebSocket do MSW normaliza o prefixo `/socket.io/`, por isso o `ws.link` usa só a origem.
- O mock faz o handshake pelo binding e envia heartbeat Engine.IO a cada 10 s.
- Uso o namespace padrão e payloads JSON em texto. Rooms, namespaces personalizados, anexos binários e acknowledgements **não** são usados. O evento `ready` confirma a subscription sem depender de acknowledgement.
- Todos os eventos passam pelo `socket.io-client` real. Nunca chamo setters ou o cache diretamente para simular um evento.

### Contrato de eventos

```ts
type ResourceEvent = {
  eventId: string; // identidade estável do evento
  resourceId: string; // recurso afetado
  version: number; // versão do recurso
  userId?: string;
  sessionToken?: string;
  data: Nft | Order;
};
```

| Evento          | Origem                                                       | Efeito na interface                                                                                |
| --------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `nft.updated`   | `/mock/nft`, conflito de preço ou estoque, compra confirmada | Invalida catálogo, detalhe, carrinho e cotação; anuncia a mudança numa região de status            |
| `order.updated` | Processamento do pedido no mock                              | Atualiza o pedido do usuário por versão; invalida carrinho e cotação; mostra confirmação ou recusa |

### Reconciliação entre REST e Socket.IO

O REST é a fonte da verdade e o Socket.IO é o aviso rápido. Para os dois conviverem:

- O `eventGate` guarda os IDs já vistos e a última versão de cada recurso. Duplicatas e versões antigas são descartadas, e pedidos terminais não regridem, nem quando o cache REST já tem um estado terminal.
- Cada conexão emite `subscribe {userId, token}`. O mock valida identidade, token e expiração antes de responder `ready`. Visitantes recebem só eventos públicos de NFT.
- Ao receber `ready` depois de conectar ou **reconectar**, o cliente reconcilia os recursos ativos pela API REST. Eventos perdidos durante a queda não deixam a tela desatualizada.
- A página do pedido também faz polling REST de recuperação. Ele complementa o Socket.IO, que continua sendo testado separadamente, sem polling.
- Eventos de pedido são filtrados pelo proprietário. O mock encerra conexões substituídas ou expiradas, e o cliente descarta eventos de outro usuário ou token.
- Listeners e subscriptions são liberados quando o ciclo de vida termina. O cleanup cancela inclusive uma conexão que ainda aguardava o import dinâmico. O mock libera timers, heartbeat e subscription no fechamento.

O pedido é liquidado depois de 1,5 s, pelo timer do mock ou por uma consulta REST após refresh. Estados terminais não são reaplicados.

## Acessibilidade

O que foi implementado, sem alterar a identidade visual:

- Navegação completa por teclado, ordem de foco lógica, foco visível e link "Pular para o conteúdo".
- Diálogo de filtros com `dialog.showModal()`: fundo inerte, Tab e Shift+Tab presos, Escape fecha e o foco volta ao gatilho. Segui o [padrão modal do WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- Formulários com rótulo associado, erros ligados por `aria-describedby` e `aria-invalid`, resumo de erros e foco no primeiro campo inválido. Erros devolvidos pela API também ficam associados.
- Estados que não dependem só de cor: filtros selecionados, favoritos e abas usam também texto, forma ou sublinhado, além de `aria-pressed` e `aria-selected`.
- Região de status estável para anunciar mudanças de preço, disponibilidade e resultado de pedido, sem repetir anúncios a cada atualização em segundo plano.
- Skeletons com `aria-busy`, com animações respeitando `prefers-reduced-motion`.
- Título por rota, idioma `pt-BR`, descrição e cor de tema. O foco vai ao `h1` depois do carregamento (ou ao `main` rotulado, quando o título é oculto); trocar só os parâmetros do catálogo não tira o foco da busca.
- Reflow até 200% de zoom em 390 px, sem overflow horizontal e sem perda de conteúdo.
- Ao remover um item do carrinho, o foco vai para o próximo controle disponível (ou para o `main`, se o carrinho ficou vazio).

### Ajustes em relação ao layout

Estes são os pontos em que a interface se afasta do desenho por causa de acessibilidade:

| Ajuste                                                                       | Efeito visual                                                                                                                                                     |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contorno de foco visível em links, botões, campos, abas e avatar             | Aparece só durante a navegação por teclado                                                                                                                        |
| Link "Pular para o conteúdo"                                                 | Fica oculto e aparece somente ao receber foco                                                                                                                     |
| Sublinhado, texto e `aria-pressed` em filtros selecionados, favoritos e abas | O estado deixa de depender só da cor                                                                                                                              |
| Mensagens de validação e resumo de erros nos formulários                     | Aparecem apenas quando há erro                                                                                                                                    |
| Cor do texto de erro em `#ff6b77`                                            | Troca o vermelho `#ed1b2e` do desenho, que tem 4,0:1 de contraste contra o fundo `#241612`, por um coral da mesma família com 6,36:1 (mínimo de 4,5:1 para texto) |
| Borda dos campos de formulário em `#92735c`                                  | Torna o limite dos campos distinguível: 4,03:1 contra o fundo `#241612` (mínimo de 3:1 para componentes de interface)                                             |
| Barras de rolagem visíveis                                                   | O projeto base as ocultava globalmente                                                                                                                            |
| Reflow abaixo de 320 px CSS (zoom de 200% em 390 px)                         | Cards em uma coluna e botões com quebra de linha; não afeta 390, 768 e 1440 px                                                                                    |
| Quebra de endereços longos                                                   | Evita overflow horizontal em telas estreitas                                                                                                                      |
| Botão de filtros funcional, com diálogo                                      | Usa os controles e a paleta existentes                                                                                                                            |

Esses dois ajustes de cor são os únicos em relação à paleta do Figma, e foram mantidos porque o contraste do desenho não atingia o mínimo de legibilidade. Os demais estados, bordas e cores seguem os tokens existentes.

Os testes com axe cobrem as telas principais em 390, 768 e 1440 px, sem desativar nenhuma regra. Mesmo assim, automação não substitui uma revisão humana com leitor de tela e zoom, nem certifica conformidade com a WCAG.

## Decisões de UX e desvios do Figma

O arquivo original do Figma não esteve acessível durante o desenvolvimento. Trabalhei a partir dos frames exportados em imagem, então a fidelidade é a de uma comparação visual cuidadosa, não de uma medição exata. Onde o desenho não definia algo, segui os padrões visuais que já existiam no projeto, sem inventar estilos novos.

Principais escolhas e desvios:

| Tema                          | O que fiz e por quê                                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipografia                    | Usei Roboto Mono Variable, local, como aproximação. Não foi possível identificar a fonte exata nas imagens.                                                                                                                                                                                                                              |
| Imagens de NFT                | Três artes adicionais (Sage, Neon e Golden) foram recortadas dos frames de referência, com 212 × 212 px, e podem parecer ampliadas em telas muito densas. O fundo decorativo da autenticação desktop também é derivado de um frame.                                                                                                      |
| Autenticação                  | O desenho mostra login e cadastro como modais sobre uma página. Mantive rotas independentes (`/login`, `/register`) com retorno ao fluxo anterior, que serve melhor a refresh, acesso direto e acessibilidade.                                                                                                                           |
| Início                        | Busca, filtros, ordenação e paginação aparecem completos mesmo quando o recorte do desenho não os mostra; o espaço extra altera a altura total da tela em relação à imagem.                                                                                                                                                              |
| Detalhe                       | Dados, descrição e edição vêm da API simulada. Favoritos ficam no detalhe, a galeria usa miniaturas e os relacionados são listas, em vez de badges, zoom e carrosséis que o desenho sugere.                                                                                                                                              |
| Carrinho                      | As capturas usam itens reais da simulação; a imagem de referência traz outros itens e totais.                                                                                                                                                                                                                                            |
| Pagamento                     | No mobile, as carteiras aparecem primeiro e o formulário completo continua logo abaixo, preservando a ordem de leitura do teclado. Conexão, revisão e recuperação são reais, então a tela é mais longa que a referência. A simulação usa uma carteira com endereço completo, enquanto a referência mostra duas com endereços abreviados. |
| Perfil, carteiras e recibo    | Perfil e carteiras funcionam também no mobile, mesmo sem frame próprio. O recibo mostra um aviso de simulação, IDs completos e o estado consultado, sem alegar transferência real.                                                                                                                                                       |
| Ações fora do escopo          | Botões e links sem contrato na API ficam desativados e não aparentam sucesso. O recibo não abre um explorador de blocos fictício.                                                                                                                                                                                                        |
| 768 px                        | Não existe frame nessa largura. Ela é uma transição responsiva entre mobile e desktop, sem identidade nova.                                                                                                                                                                                                                              |
| Hover, focus, disabled e erro | As imagens não documentam esses estados, então reaproveitei os tokens e as regras do projeto.                                                                                                                                                                                                                                            |

Sobre as imagens: preservei a arte original (`src/assets/monkey.png`, 1254 × 1254) e gerei WebP sem perdas em 256, 512, 768 e 1254 px. O arquivo integral é pixel a pixel idêntico ao PNG e pesa bem menos. O componente `NftImage` escolhe a resolução com `srcset` e `sizes` e reserva largura e altura. Os cards posteriores usam lazy loading. O favicon é um "K" vetorial, na paleta existente.

Os skeletons reservam as dimensões do conteúdo final para evitar deslocamento de layout. Essa reserva de espaço não equivale a uma medição geral de CLS.

## Testes

| Suíte            | Comando                    | Escopo                                                                                                                                           |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| E2E (Playwright) | `npm run test:e2e`         | 52 testes em Chromium (390 e 1440 px; acessibilidade também em 768 px): 32 funcionais, 2 de regressão visual (8 capturas) e 18 de acessibilidade |
| Acessibilidade   | `npm run test:a11y`        | axe, teclado, foco, reflow e movimento reduzido                                                                                                  |
| Contratos REST   | `npm run test:integration` | 60 verificações pelos mesmos handlers MSW, via Axios                                                                                             |
| Tempo real       | `npm run test:realtime`    | 17 verificações de transporte, deduplicação e reconciliação com `socket.io-client`                                                               |
| Regras puras     | `npm run test:unit`        | 31 casos (ETH com 18 casas, avatar, senha, mensagens, query keys, eventos, estados do recibo)                                                    |

Os testes partem de um estado isolado (cada um restaura o MSW), controlam relógio e latência nos cenários sensíveis e não usam pausas fixas. As baselines visuais ficam em `tests/e2e/visual.spec.ts-snapshots` e foram geradas com Chromium no Windows; em outro sistema, a renderização de fontes pode exigir baselines próprias. Falhas geram traces e screenshots em `test-results`, e o relatório HTML sai em `playwright-report`.

Os testes verificam o que o usuário vê e o resultado das operações. As chamadas REST passam pelos handlers do MSW e os eventos em tempo real passam pelo cliente Socket.IO, nunca por atalhos.

## Performance

Auditoria feita com Lighthouse sobre o build otimizado, no cenário `success` (120 ms), com cache e navegador frios, três medições por página e perfil. Os números abaixo são as medianas. Condições, versões e as 12 amostras estão no [resumo da auditoria](reports/lighthouse/delivery/summary.json); os HTML individuais ficam na mesma pasta.

| Página e perfil  | Performance | Accessibility | Best Practices | SEO | LCP    | CLS   | TBT    |
| ---------------- | ----------- | ------------- | -------------- | --- | ------ | ----- | ------ |
| Início, mobile   | 82          | 100           | 96             | 100 | 4,14 s | 0,001 | 123 ms |
| Início, desktop  | 99          | 100           | 96             | 100 | 0,95 s | 0,001 | 3 ms   |
| Detalhe, mobile  | 85          | 100           | 96             | 100 | 4,13 s | 0,000 | 71 ms  |
| Detalhe, desktop | 99          | 100           | 96             | 100 | 0,97 s | 0,000 | 0 ms   |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

**Performance mobile ficou abaixo da meta** (82 e 85). As causas que identifiquei:

- Em mobile, o Lighthouse simula Slow 4G e CPU 4x mais lenta. Nesse perfil, o arranque frio da SPA pesa muito: o app precisa baixar o bundle, iniciar o worker do MSW e só então montar a interface.
- A simulação de backend faz parte da entrega e da auditoria (o enunciado proíbe simplificar funcionalidades para pontuar), então o MSW e o Socket.IO simulados estão no caminho crítico do primeiro carregamento.
- Os relatórios identificam a imagem de Emerald Ape como LCP. Na home, falta prioridade no preload; no detalhe, a imagem não é descobrível no HTML inicial da SPA.
- A auditoria estima 87/88 KiB de JavaScript não utilizados nas navegações de início/detalhe, principalmente nos chunks da aplicação e do MSW; o trabalho da thread principal foi de aproximadamente 1,34/0,98 s nas primeiras amostras mobile. Isso indica custo de carregamento e execução, sem garantir que os módulos possam ser removidos com segurança.
- O build avisa sobre um chunk acima de 500 kB. Não ocultei o aviso.
- As medições rodaram numa estação Windows compartilhada, sem isolamento de CPU e memória, o que adiciona variação.

Não usei modo especial de auditoria: imagens, fontes, mocks e funcionalidades ficam todos ativos.

### Medição na aplicação publicada

Também rodei o PageSpeed Insights contra a URL pública da Vercel (uma execução por perfil, na página Início). A CDN melhora o resultado em relação à medição local, que roda sem otimizações de entrega:

| Perfil  | Performance | Accessibility | Best Practices | SEO |
| ------- | ----------- | ------------- | -------------- | --- |
| Mobile  | 86          | 100           | 96             | 100 |
| Desktop | 100         | 100           | 96             | 100 |

No desktop, todas as metas são atendidas. No mobile, Accessibility, Best Practices e SEO passam, e Performance (86) segue abaixo de 90 pelas causas descritas acima. Por ser uma única execução, esses números servem de referência e não substituem as medianas de três medições da tabela anterior. O PageSpeed também exibe uma categoria experimental de "navegação agêntica", que não faz parte das metas do desafio.

Melhorias futuras incluem antecipar a descoberta da imagem e reduzir o JavaScript inicial, preservando o MSW, o Socket.IO e todas as funcionalidades da simulação. Essas mudanças precisam de novas medições para comprovar o efeito.

### Relatórios entregues

Os relatórios completos excedem 25 MB, por isso versionei somente os HTML e o `summary.json` de `reports/lighthouse/delivery` e `reports/lighthouse/final`. Os JSON individuais do Lighthouse e o relatório HTML do Playwright (com traces) não estão no repositório e são gerados pelos comandos documentados no README (`npm run lighthouse` e `npm run test:e2e`). Esse é um desvio assumido em relação à entrega de relatórios do enunciado.

## Deploy

A aplicação está publicada na Vercel, no ramo `main`: https://frontend-challenge-sigma-sable.vercel.app

| Configuração | Valor                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------- |
| Framework    | Vite                                                                                        |
| Node         | 24.x                                                                                        |
| Instalação   | `npm ci`                                                                                    |
| Build        | `npm run build`                                                                             |
| Saída        | `dist`                                                                                      |
| Variáveis    | Opcionais: os mocks vêm ativos por padrão (`VITE_MOCKS`, `VITE_API_URL`, `VITE_SOCKET_URL`) |

Por ser uma SPA estática, não existe servidor para manter: a API e o Socket.IO são simulados no navegador pelo MSW. O `vercel.json` encaminha as rotas para `index.html`, o que permite acesso direto e refresh em `/product/1`, `/cart`, `/payment` e demais telas. O worker `mockServiceWorker.js` é servido na raiz, sem reescrita. Rotas inexistentes mostram o 404 da aplicação, e o status HTTP dessa navegação pode ser 200 por causa do fallback da SPA.

### Verificação na versão publicada

Depois do deploy, conferi o que o enunciado pede do ambiente publicado:

- A URL abre sem tela de proteção e o commit do deploy corresponde ao código do repositório.
- `/mockServiceWorker.js` é servido como JavaScript (não como HTML) e controla a página.
- Acesso direto e refresh funcionam nas rotas da aplicação, e rotas inexistentes mostram o 404 da aplicação.
- Os mocks e o Socket.IO simulado funcionam no build publicado: catálogo, login com as contas de teste, compra até o recibo e aviso de preço em tempo real.
- PageSpeed Insights executado contra a URL pública (resultados na seção de Performance).

## Limitações conhecidas

- **Tudo é simulado.** Não há blockchain, extensão de carteira, gateway de pagamento nem backend. Saldos, transações e links de exploração são fictícios.
- **Segurança.** Sessão, token e hash vivem no navegador (`localStorage`), sem cookies reais. O SHA-256 com salt é só uma simulação de armazenamento de senha. Os dados do mock são compartilhados entre abas da mesma origem e não sincronizam em tempo real entre elas.
- **Socket.IO simulado.** Namespace padrão, só WebSocket, sem rooms, binários nem acknowledgements. Um servidor real pode exigir ajustes de transporte.
- **Fidelidade visual.** Aproximação feita a partir de imagens: a fonte exata e alguns recortes de arte não puderam ser reproduzidos com exatidão.
- **Performance mobile** abaixo da meta, pelos motivos descritos na seção de performance.
- **Acessibilidade.** Verificada por automação e teste por teclado. Falta uma revisão humana com leitor de tela.
- **Baselines visuais** geradas em Chromium no Windows.
