# Arquitetura do Kurio

O app atual é uma SPA Vite com TanStack Router e renderização cliente. `src/main.tsx` carrega `app.tsx` e mocks em paralelo; aguarda iniciar o worker MSW antes de montar QueryClientProvider e RouterProvider. Os mocks usam import dinâmico com guarda de window; não há server functions nem API routes para simular backend. MSW está ativo inclusive no build. `VITE_MOCKS=false` exige API REST e Socket.IO compatíveis. Falha ao iniciar o worker é exibida e impede fetches sem interceptação.

Os contratos, consultas e hooks pertencem às features. `src/api/*` mantém reexports de compatibilidade para as integrações existentes, sem duplicar clientes. O único Axios/QueryClient fica em `shared/api/http.ts`; a fábrica tipada de chaves fica em `shared/api/query-keys.ts`, com os mesmos arrays públicos e prefixos privados. `src/mocks/database.ts` contém fixtures e persistência; `handlers.ts` implementa as regras de negócio simuladas exclusivamente na rede MSW. Interface não importa o banco de mocks. Dados de catálogo, detalhe, carrinho, cotação, carteiras e pedido vêm da API; provedores de carteira e rótulos de navegação são configuração de apresentação.

## URL e consultas

Busca, coleção, rede, categoria, ordenação, página e faixa de preço compõem o search tipado da rota inicial. Alterar filtro reinicia a página. Cada mudança navega pelo Router, permitindo refresh e histórico. Consulta usa a mesma estrutura validada como parâmetros Axios e query key. Não há cache separado sem parâmetros que possa sobrescrever um resultado mais recente. Cada GET recebe AbortSignal do Query; cotações também propagam signal. Ao abandonar uma consulta ou trocar sessão, requests ativos são cancelados. A interface mantém o resultado anterior da mesma key durante refetch e anuncia atualização em segundo plano.

Chaves públicas: `['nfts',search]` e `['nft',id]`. Chaves privadas: `['private',userId,recurso,...]`; visitante usa `guest`. Sessão: `['session']`, sempre revalidada ao montar e na guarda privada. Dados privados não entram em caches globais de catálogo. Logout/login cancela requests, remove cache privado e sessão, e invalida consultas ativas. O cliente envia identidade da sessão conhecida em X-Session-User; o mock rejeita requests iniciados por uma sessão já substituída. Autorização de recibo/cotação é validada também no handler.

Cache padrão: staleTime 15 s, gcTime 5 min, refetch ao focar a janela. Sessão e cotação têm staleTime zero. GETs e cotações têm no máximo uma repetição para erro de rede/5xx, nunca para 4xx. Mutations não são repetidas automaticamente. Socket.IO sincroniza NFTs e pedidos por eventos versionados; o cliente deduplica, rejeita eventos antigos e reconcilia recursos ativos por REST ao reconectar. Pedidos pendentes também possuem polling REST de recuperação; terminal interrompe polling. Transporte e cenários estão em #transporte-e-protocolo.

Mutations do carrinho invalidam os recursos privados daquele usuário, incluindo a cotação. Favorito cancela a consulta, salva snapshot e altera a lista otimisticamente; falha restaura snapshot; conclusão invalida para reconciliar REST. Botão fica indisponível durante mutation. Falhas são apresentadas com opção de retry nas consultas e feedback acessível nas mutations conectadas.

Na remoção do carrinho, a intenção de devolver o foco é aplicada em um efeito após React confirmar o DOM sem a linha removida. O foco vai ao próximo controle disponível ou ao main quando vazio. Isso corrige a corrida identificada na instalação limpa: requestAnimationFrame podia focar um botão ainda presente e o commit seguinte o removia. A correção preserva o teste de foco, os contratos e as baselines.

Os botões animam cores, borda, sombra e transformação, mas não opacidade. Na validação limpa, a transição de disabled para habilitado deixava temporariamente o botão de revisão de pagamento com contraste de 3,07:1. A opacidade agora muda imediatamente com o estado disabled; os estilos finais e as baselines permanecem iguais. O teste axe original foi preservado.

## Sessão e persistência

O mock persiste dados em localStorage (`kurio.mock.v1`) para sobreviver a refresh. Sessão dura 30 minutos. Esta é uma simulação local compartilhada por abas da mesma origem, sem cookies reais ou backend; não oferece segurança de produção nem sincronização multiaba em tempo real. As duas contas têm dados privados separados. Credenciais de fixture e cenários estão em #contratos-rest. Respostas públicas de conta excluem hash e salt; senhas não são persistidas em claro. SHA-256 com salt é apenas hash simulado, não substitui algoritmo de derivação apropriado no servidor real.

Carrinho visitante persiste no banco mock e é mesclado no login por NFT/edição, somando quantidades até o estoque; depois o carrinho visitante é esvaziado. Logout não apaga carrinho autenticado nem o expõe ao visitante. Sessão expirada retorna 401; recursos privados redirecionam para login com retorno interno validado. Carrinho, rascunho do coletor e tentativa de compra ficam preservados por usuário. Retornos externos e `//host` são rejeitados. Pagamento, confirmação, perfil e carteiras têm guardas. Perfil inclui avatar local e senha; carteiras principal/secundária são cadastradas/editadas pela API, em páginas responsivas seguindo os tokens e referências existentes.

Tentativa de pedido usa chave aleatória por usuário em sessionStorage, com quoteId/walletId fixos. Timeout preserva a tentativa para reenvio idempotente; sucesso a remove. Erro de negócio remove a tentativa e recarrega cotação para nova confirmação. A URL de confirmação contém orderId, nunca status autoritativo; acesso inexistente mostra erro da API. Cotação e recibo usam strings decimais e cálculos BigInt, sem arredondamento binário. A UI mantém sua composição original; estados assíncronos e feedback foram adicionados sem redesenho.

## Execução e limites de validação

Instalação reproduzível com `npm ci` e `package-lock.json`; comandos completos no README. No PowerShell com npm.ps1 bloqueado, usar npm.cmd. Worker versionado em public/mockServiceWorker.js deve ser publicado na raiz. Hosting precisa encaminhar rotas SPA para index.html e servir worker/assets normalmente; `vercel.json` fornece a configuração, sem comprovar publicação.

Testes de integração usam os mesmos handlers MSW com setupServer e Axios. `test:realtime` exercita socket.io-client e o binding MSW. `test:e2e` exercita interface, histórico, falhas, conta, compra, teclado e oito capturas nas larguras 390/1440, com acessibilidade também em 768. `lighthouse` executa três medições por página/perfil no build otimizado; relatórios em reports/lighthouse/delivery. Evidências e limites atuais estão em docs/ENTREGA.md. Inspeção humana continua pendente: Browser retornou ausência de navegador conectado.

Imagens usam NftImage com dimensões reservadas e srcset WebP da mesma arte; catálogos priorizam os primeiros itens e usam lazy loading nos demais. O original PNG permanece disponível e o derivado integral possui pixels decodificados idênticos. Preload do LCP usa a mesma lista de fontes responsivas. A etapa 7 usa Roboto Mono Variable local como aproximação da fonte das referências PNG. A identidade exata da fonte não está disponível. As três artes adicionais são recortes das referências, reproduzíveis por scripts/extract-reference-assets.mjs. Mocks de produção apenas suprimem logs verbosos; rede e regras permanecem iguais.

## Organização por feature — etapa 7

```text
src/
  routes/                    # Registro, search validado e guardas
  features/
    catalog/                 # Catálogo, filtros e favoritos
    nft/                     # Galeria, descrição e compra
    cart/                    # Itens, cupom e cotação
    checkout/                # Coletor, conexão, revisão e idempotência
    auth/                    # Identidade, login, cadastro e logout
    profile/                 # Perfil, avatar e senha
    wallets/                 # Carteiras principal/secundária
    orders/                  # Consulta e recibo
    realtime/                # Assinatura, deduplicação e reconciliação
  shared/
    api/                     # HTTP, query keys e erro de transporte
    components/              # Layout, campos, ETH, quantidade e estados
    lib/                     # Decimal BigInt, validação e erros
  components/ui/             # Primitivos shadcn
  api/                       # Fachadas de compatibilidade
  mocks/                     # Backend MSW, sem dependência da UI
```

Cada feature usa api/, hooks/, components/ e types/ conforme a responsabilidade; não há diretórios vazios para cumprir um modelo. Arquivos seguem kebab-case, componentes/tipos PascalCase e hooks use-*. Arquivos de rota e routeTree.gen.ts seguem o gerador. Imports são organizados pelo TypeScript e formatados pelo Prettier; entre features usam @/, e os locais usam caminhos relativos curtos. Tipos usam import type. Não foi criado um barrel genérico que carregue todas as telas.

Os componentes *-page conectam hooks às views. As views recebem props tipadas, sem buscar dados nem chamar Axios. Galeria, controles de compra, coletor, campos, carteiras, ações do checkout e seções do recibo têm responsabilidades próprias. Tipos de apresentação derivados dos hooks evitam duplicar os tipos de Query/mutation. useNfts, useNft, useCart, useQuote, useWallets, useProfile e useOrder encapsulam consultas por recurso. Hooks dos formulários concentram mutations e navegação. useCheckout mantém a trava síncrona, o preflight, a revisão e a tentativa persistida juntos, pois sua ordem garante a idempotência.

EthPrice preserva strings decimais; QuantityStepper compartilha limites/rótulos com variantes cva. Campos, resumo, imagens, estados remotos e skeletons são compartilhados. ReceiptState é uma união discriminada interna; erros normalizados distinguem API, rede e falha inesperada. Os contratos HTTP continuam iguais. Validação nativa permanece no formulário; mensagens, confirmação de senha e regras do avatar são funções puras. Não foi adicionada biblioteca de schemas.

useRealtimeStatus controla conexão e cleanup; eventGate é puro e testável. Logout encerra a assinatura antes de limpar caches. A importação dinâmica da fachada realtime nessa limpeza mantém a fronteira de ciclo de vida existente. Componentes do catálogo usam getRouteApi sem importar a implementação da rota. Não foi adicionada memoização sem medição; permanecem splitting por rota, AbortSignal e chaves estáveis das listas.

Testes unitários usam node:test e o carregador TypeScript do Vite já instalado, sem nova dependência de testes. Cobrem 31 casos de ETH com 18 casas, avatar, senha, mensagens, query keys, eventos e estados do recibo. test:design captura nove telas em três larguras e verifica a geometria da arte dos skeletons. Referências e exceções estão em [#decisões-de-ux-e-desvios-do-figma](#decisões-de-ux-e-desvios-do-figma). Os finais da etapa 6 permanecem em reports/lighthouse/final; resultados atuais em reports/lighthouse/delivery.

## Contratos REST

Campos adicionais: sessão inclui `token`; perfil aceita também `username`, `email`, `ens` e `walletNickname`; PATCH de perfil valida antes de persistir. Carteiras aceitam `role` (primary/secondary), `nickname`, `profileName` e `ens`, com limite de duas e ordem estável. POST `/cart/items` aceita `mode: 'add'` para somar quantidade, mantendo substituição absoluta como padrão para edição.

POST `/wallet-connection` recebe `{walletId,network}` e devolve `{connectionId}`; DELETE encerra as conexões da sessão. Recusa de conexão e rede incompatível retornam 422. No fluxo da interface, POST `/orders` inclui também `connectionId` e `collector {displayName,username,profileName,email,network,walletAddress,walletType,referralCode,...}`. Dados e conexão são validados, incluindo token da sessão e rede. O contrato mínimo de pedidos permanece compatível para testes de baixo nível; a interface exige a conexão e a revisão dos dados. Todos os campos presentes fazem parte do corpo canônico da tentativa, e o mesmo corpo/chave recupera o pedido existente.

POST `/mock/nft` recebe `{id,price?,stock?}`, persiste alteração, incrementa a versão e publica nft.updated por Socket.IO. Cenários adicionais: wallet-refused, duplicate-events, old-events e socket-offline. Eventos, transporte e instruções completas em [#transporte-e-protocolo](#transporte-e-protocolo).

Base `/api` (configurável por `VITE_API_URL`). Transporte único: Axios; simulação única: handlers MSW em `src/mocks/handlers.ts`. Tipos compartilhados em `src/api/contracts.ts`. Valores ETH são strings decimais com até 18 casas; cálculos usam inteiros BigInt em unidades de 10⁻¹⁸ ETH. Quantidades são inteiros positivos. Nenhum saldo ou transação corresponde a blockchain real.

Erros: `{ code: string, message: string, fields?: Record<string,string> }`. HTTP 400 para solicitação inválida, 401 para sessão inválida/expirada, 403 para recurso de outro usuário, 404 para recurso inexistente, 409 para conflito (conta, estoque, cotação ou chave de idempotência), 422 para validação e 503 para indisponibilidade transitória. Falha de conexão MSW não tem resposta HTTP. Requests inválidos não devem ser tratados como sucesso.

| Método e caminho            | Entrada                                                             | Resposta                                                                                        |
| --------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| POST `/auth/register`       | `{email, username, password}`; e-mail válido, username ≥3, senha ≥8 | 201 `{ok:true}`; 409 se e-mail/username ocupado                                                 |
| POST `/auth/login`          | `{email,password}`                                                  | `Session {user,expiresAt}`; mescla carrinho visitante com limite de estoque                     |
| GET `/auth/session`         | —                                                                   | Session ou 401; User nunca inclui salt/hash                                                     |
| POST `/auth/logout`         | —                                                                   | `{ok:true}`; encerra sessão                                                                     |
| GET `/nfts`                 | `q,collection,network,category,sort,page,min,max`                   | `Catalog {items:Nft[],total,pages}`; 9 itens/página                                             |
| GET `/nfts/:id`             | ID                                                                  | Nft ou 404                                                                                      |
| GET `/favorites`            | Sessão                                                              | string[] de IDs de NFT                                                                          |
| PUT/DELETE `/favorites/:id` | Sessão                                                              | Lista atualizada; PUT é inclusão sem duplicata                                                  |
| GET `/cart`                 | Visitante ou sessão                                                 | `{items:CartLine[],coupon:string}` com preços/estoque atuais                                    |
| POST `/cart/items`          | `{nftId,edition,quantity}`                                          | Carrinho atualizado; cria/substitui quantidade absoluta por NFT/edição                          |
| DELETE `/cart/items/:id`    | ID da linha, URI-encoded (`nftId:edition`)                          | Carrinho atualizado                                                                             |
| POST `/quote`               | `{coupon?:string}`                                                  | Quote com ID, snapshot de itens, subtotal, discount, fee, total e expiresAt; cupom vazio remove |
| POST `/orders`              | `{quoteId,walletId}` + header `Idempotency-Key`                     | 201 Order pendente; mesma tentativa retorna 200 com mesmo pedido                                |
| GET `/orders/:id`           | Sessão proprietária                                                 | Order com status `pending`, `confirmed` ou `refused`, versão e recibo snapshot                  |
| GET `/profile`              | Sessão                                                              | User público                                                                                    |
| PATCH `/profile`            | `{displayName,avatar?}`                                             | User atualizado; avatar vazio ou data URL PNG/JPEG/WebP                                         |
| POST `/profile/password`    | `{currentPassword,password}`                                        | `{ok:true}`; valida senha atual e mínimo 8 caracteres                                           |
| GET `/wallets`              | Sessão                                                              | Wallet[]                                                                                        |
| POST `/wallets`             | `{name,address,network}`                                            | Wallet[] atualizado; endereço hexadecimal 0x com 40 caracteres                                  |
| PATCH `/wallets/:id`        | `{name,address,network}`                                            | Wallet[] atualizado; 404 se não pertence ao usuário                                             |

`Nft` inclui id, name, price, collection, network, category, stock, version e dados usados no detalhe. Redes da fixture: Ethereum, Polygon, Solana. Coleções: Arte digital, Fotografia, Música, Arte 3D, Colecionáveis, Generativa, Jogos, Assinaturas, Utilidade. Categorias: `new` e `hot`; vazio significa todas. Ordenação: `recent`, `price-asc`, `price-desc`. Search params inválidos são normalizados pelo mesmo parser tipado na rota e no mock.

`CartLine`: id, nftId, name, tokenId, edition, price, quantity, stock. `Quote`: id, items, subtotal, discount, fee, total, coupon, expiresAt. Cupom padrão `KURIO10`: 10%; taxa fixa simulada de `0.016` ETH para carrinho não vazio. A cotação dura 60 segundos. Servidor revalida os itens e o total antes de criar pedido; conflito exige obter outra cotação e confirmar novamente.

`Order`: id, userId, status, quote (cópia imutável), wallet (cópia), transactionId simulado, createdAt e version. Chaves de idempotência são isoladas por usuário e persistidas. Corpo canônico inclui `{quoteId,walletId,collector,connectionId}`; mesma chave e corpo recuperam o pedido após timeout ou mudança de estado; diferenças retornam 409. O mock liquida pedidos após 1,5 s via timer/consulta, exceto quando pausado explicitamente. Estados terminais não são reaplicados; confirmação remove somente quantidades compradas. `order.updated` e `nft.updated` são transmitidos pelo Socket.IO; contrato em #transporte-e-protocolo.

## Controle dos mocks

Disponível somente quando MSW está ativo. Estes endpoints também passam pela rede; não existem atalhos de negócio nos hooks.

| Método/caminho        | Entrada                                       | Efeito                                                                                                                             |
| --------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| POST `/mock/reset`    | `{scenario?:string}`                          | Restaura as 36 fixtures, duas contas, estoque, carrinhos, favoritos, carteiras, cupons, cotações, pedidos e chaves; encerra sessão |
| POST `/mock/scenario` | `{scenario:string}`                           | Seleciona cenário sem reset de dados                                                                                               |
| POST `/mock/expire`   | `{}`                                          | Expira a sessão atual                                                                                                              |
| POST `/mock/nft`      | `{id,price?,stock?}`                          | Altera recurso, incrementa versão e transmite evento Socket.IO                                                                     |
| POST `/mock/timing`   | `{latency?:number,settlementPaused?:boolean}` | Controla latência e liquidação no mock; reset limpa controles voláteis                                                             |

Pode-se abrir `/?reset=1&scenario=success` para reset completo ou usar `?scenario=...` em qualquer rota e recarregar para selecionar cenário persistente. Parâmetros de controle não são filtros do catálogo. Reset limpa dados do mock; para ensaio totalmente novo, usar nova aba e recarregar para descartar caches e tentativas de checkout da aba anterior.

| Cenário                             | Comportamento reproduzível                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `success`                           | 120 ms de latência, listagem e pagamento confirmado                                                                   |
| `empty`                             | Catálogo vazio                                                                                                        |
| `slow`                              | 1800 ms de latência                                                                                                   |
| `out-of-order`                      | Busca com comprimento ímpar demora 1500 ms; par demora 100 ms                                                         |
| `offline`                           | Falha de conexão com HttpResponse.error                                                                               |
| `http-400` / `http-500`             | 400 / 503 nas operações de negócio                                                                                    |
| `expired` / `unauthorized`          | 401 nos recursos privados                                                                                             |
| `register-conflict`                 | Cadastro retorna 409                                                                                                  |
| `favorite-failure`                  | Mutation de favorito retorna 503; UI desfaz otimismo                                                                  |
| `coupon-invalid` / `coupon-expired` | Cotação com cupom retorna 422                                                                                         |
| `price-changed` / `sold-out`        | Primeira criação de pedido altera preço/estoque e retorna 409; mudança permanece no catálogo; cenário volta a success |
| `order-timeout`                     | Persiste pedido, espera 6 s e falha de rede; Axios expira em 4 s; mesma chave recupera pedido                         |
| `payment-refused`                   | Pedido pendente termina recusado e preserva carrinho                                                                  |

Validações de cadastro, perfil, senha, carteiras e quantidade também são determinísticas por payload inválido; não dependem de cenário global. Para voltar de falha persistente, selecionar `success` e usar o botão Tentar novamente. Endpoints de controle não recebem falhas do próprio cenário.

Credenciais de desenvolvimento: `ana@kurio.test` e `bruno@kurio.test`, senha fictícia `Kurio123!`. Apenas SHA-256 com salt é persistido pelo mock; não é uma implementação de autenticação para produção.

## Transporte e protocolo

Foi instalado `@mswjs/socket.io-binding` **0.2.0**, compatível com MSW 2.12.7. A API dessa versão é `toSocketIo(connection)`, documentada no README do pacote instalado; o [repositório do binding](https://github.com/mswjs/socket.io-binding) pode mostrar uma API diferente na branch main.

O cliente usa exclusivamente transporte WebSocket, sem polling Engine.IO ou upgrades. Endpoint fictício padrão: `wss://kurio.mock`, com path Socket.IO `/socket.io/`. Não há serviço externo nesse domínio: o MSW intercepta a conexão. Na versão instalada, o matcher WebSocket do MSW normaliza o prefixo `/socket.io/`; por isso `ws.link` usa a origem. O mock faz handshake pelo binding e envia heartbeat Engine.IO a cada 10 s. Eventos usam namespace padrão e payload JSON textual; rooms, namespaces personalizados, anexos binários e acknowledgements não são utilizados. O evento `ready` confirma a subscription da aplicação sem depender de acknowledgement.

`VITE_MOCKS=false` desativa a simulação; nesse modo, configurar `VITE_API_URL` e `VITE_SOCKET_URL` para serviços compatíveis. A demonstração usa mocks ativos por padrão, inclusive no build, com worker em `public/mockServiceWorker.js`.

## Sessão e ciclo de vida

Login cria token aleatório persistido junto da sessão. `/auth/session` recupera o mesmo token após refresh. O cliente envia identidade e token nos requests privados. Cada conexão emite `subscribe {userId,token}`; o mock valida identidade, token e expiração antes de emitir `ready`. Visitante recebe apenas eventos públicos de NFT.

Eventos de pedido são filtrados pelo proprietário. O mock encerra conexões substituídas ou expiradas; o cliente também descarta eventos com token ou usuário diferentes do ciclo atual. Logout e troca de conta encerram o socket e removem listeners antes de limpar cache privado. O cleanup do efeito cancela também uma conexão que ainda esteja aguardando o import dinâmico. O mock libera timers, heartbeat e subscription no fechamento. A sessão é revalidada a cada 15 s, nas guardas e ao focar a janela; 401 limpa dados privados e preserva a URL para retomada após login.

## Contrato de eventos

```ts
type ResourceEvent = {
  eventId: string;
  resourceId: string;
  version: number;
  userId?: string;
  sessionToken?: string;
  data: Nft | Order;
};
```

| Evento          | Origem                                                      | Efeito na interface                                                                                |
| --------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `nft.updated`   | `/mock/nft`, conflito de preço/estoque ou compra confirmada | Invalida catálogo, detalhe, carrinho e cotação; anuncia mudança em região de status                |
| `order.updated` | Processamento de pedido pendente no mock                    | Atualiza pedido do usuário por versão e invalida carrinho/cotação; apresenta confirmação ou recusa |

`eventGate` mantém IDs vistos e última versão por recurso; rejeita duplicatas e versões antigas. Pedidos terminais não regridem, inclusive quando o cache REST já possui estado terminal. Ao receber `ready` após conectar/reconectar, o cliente reconcilia recursos ativos pela API REST. A página do pedido também possui polling REST de recuperação; isso não substitui o Socket.IO, exercitado pelos testes específicos sem polling.

Processamento de pedido ocorre após 1,5 s, pelo timer dos mocks ou por consulta REST após refresh. Resultado confirmado/recusado fica definido no momento da criação; mudar o cenário depois não altera um resultado terminal. Falta de estoque ao liquidar recusa o pedido, sem estoque negativo. Snapshot da cotação e carteira é imutável. Somente quantidades compradas são removidas; acréscimos posteriores permanecem.

## Decisões de UX e desvios do Figma

Roboto Mono Variable é aproximação observável, pois PNG não identifica a fonte exata. Os recortes Sage, Neon e Golden vêm de cart-desktop.png (212×212 px); o script de extração registra as coordenadas. O fundo de autenticação desktop é uma imagem decorativa derivada de home-desktop.png, sem interatividade. As rotas de autenticação e returnTo continuam iguais: não se transformaram em um novo fluxo modal. São aproximações documentadas, não reprodução exata do Figma.

Foco visível, bordas contrastantes, rótulos/erros, tamanhos mínimos e espaçamento dos alvos de toque, reduced motion e reflow prevalecem sobre os PNGs. Por isso, o recibo mantém o aviso de simulação e não abre um explorador fictício; botões fora do escopo permanecem desativados. Busca/ordenação/paginação e todos os campos obrigatórios continuam acessíveis, mesmo quando ausentes do recorte da referência. No pagamento mobile, carteiras aparecem primeiro visualmente e o formulário completo continua abaixo. A ordem de leitura/Tab preserva o formulário antes das ações de envio.

As regras/latências/cenários dos mocks, IDs, preços, estoques, query keys e endpoints não mudaram. Apenas as URLs de imagens das fixtures foram associadas às artes de referência na Parte A, mantendo o formato e o significado do campo images. Os mocks continuam sendo a única simulação de backend. A organização por feature e as fachadas src/api/* preservam os pontos de integração existentes.

A arte original `src/assets/monkey.png` (1254×1254, 1.885.435 bytes) foi preservada. `scripts/optimize-images.mjs` gera WebP sem perdas em 256/512/768 e 1254 px. O arquivo integral tem 1.276.290 bytes e a comparação dos buffers RGB decodificados é idêntica ao PNG. Os menores usam redimensionamento Lanczos do Sharp, com mesma composição/cores; podem alterar pixels de amostragem sem redesenhar a arte. NftImage escolhe a resolução por srcset/sizes e reserva largura/altura. Hero e primeiros cards priorizam carregamento; cards posteriores e conteúdo editorial usam lazy loading. O preload inicial usa a mesma família responsiva. O logo favicon é um K vetorial local na paleta existente; não é nova ilustração NFT.

| Ajuste                                                                                    | Motivo e efeito visual                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contorno de foco de 2 px, offset de 4 px, em `--font-accent`                              | Foco consistente em links, botões, inputs, selects, tabs e avatar. Link Pular para o conteúdo aparece somente ao receber foco.                                                                                                         |
| `--font-primary` corrigido para `#f7f3ec` e referência CSS válida                         | Corrige o token originalmente inválido, usando a cor clara já pretendida no projeto.                                                                                                                                                   |
| Erro de `#ed1b2e` para `#ff6b77`                                                          | Preserva a família vermelha/coral e eleva o contraste do texto de erro. Relação calculada contra `#241612`: 6,36:1.                                                                                                                    |
| Bordas dos campos em `#92735c`                                                            | Torna o limite dos controles distinguível: contraste 4,03:1 contra `#241612`. Wrappers de busca mantêm uma borda única. Bordas decorativas do restante da interface permanecem nos tokens existentes.                                  |
| Sublinhado em filtros selecionados, Favoritado/Remover dos favoritos e coração preenchido | Estado distinguível por texto/forma e `aria-pressed`, além da cor. Miniaturas selecionadas usam borda dupla; tabs usam seleção ARIA e borda/sublinhado.                                                                                |
| Barras de rolagem disponíveis e reduced motion global                                     | Remove a ocultação global das barras; shimmer, pulse, spin e transições respeitam a preferência de movimento reduzido.                                                                                                                 |
| Reflow adicional abaixo de 320 px CSS                                                     | Em largura equivalente a 390 px com zoom de 200%, cards passam a uma coluna, busca e filtros quebram linha, botões permitem texto em múltiplas linhas e ícones fixos cabem na grade. Não altera os layouts normais de 390/768/1440 px. |
| Quebra de endereços longos e rodapé sem controles interativos aninhados                   | Conteúdo permanece acessível em telas estreitas. O rodapé passa a ser landmark independente de main, mantendo largura e tokens; links preservam as classes visuais dos antigos botões.                                                 |
| Mensagens de validação associadas e resumo de erros                                       | Novas mensagens aparecem apenas em estados de erro; campos recebem aria-invalid/aria-describedby e foco no primeiro erro. Autenticação mantém labels visualmente ocultas e placeholders originais.                                     |
| Diálogo de filtros                                                                        | Usa os controles e a paleta existentes; botão de filtro passa a funcionar. `dialog.showModal()` torna o fundo inerte; Tab/Shift+Tab, Escape e retorno ao gatilho são tratados.                                                         |

Títulos por rota, idioma pt-BR, descrição básica e cor de tema foram adicionados. O foco vai ao h1 após carregamento; para headings visualmente ocultos, vai ao main rotulado. A troca somente de parâmetros do catálogo não rouba foco da busca. Background refetches não geram anúncios repetidos; notificações de preço/pedido usam uma região estável e educada.

A implementação do diálogo segue o [padrão modal do WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) e os testes usam a [integração axe com Playwright](https://playwright.dev/docs/accessibility-testing). Nenhuma regra foi desativada para ocultar violações encontradas.

| Tela/elemento             | Resultado atual                                                                                | Diferença justificada                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Tipografia global         | Roboto Mono Variable local, pesos/tamanhos e entrelinhas ajustados                             | Fonte exata não identificável no PNG; aproximação, sem alegação de equivalência exata                               |
| Layout global             | Contêiner desktop de 1200 px a x=120; controles compactos                                      | Alvos/foco/contraste preservados quando o desenho é menor ou menos legível                                          |
| Início                    | Hero de 450 px desktop; cartão compacto mobile; três novas artes, molduras e coluna escalonada | Busca, filtros, paginação e texto real dos mocks ocupam espaço próprio; altura total não é cópia exata              |
| Detalhe                   | Header desktop, margens, volta circular e galeria ajustados                                    | Dados/descrição/edição e avaliações seguem API; foco visível aparece nas capturas de navegação                      |
| Carrinho                  | Card mobile de 100 px, remover/quantidade compactos e resumo alinhado                          | Captura usa um item real; referência contém vários itens e totais distintos                                         |
| Pagamento                 | Imagens no resumo; desktop com header; carteiras primeiro no mobile                            | Coletor obrigatório permanece abaixo; rede, conexão, revisão e recuperação continuam reais                          |
| Autenticação              | Painel desktop de 500 px, abas, fundo decorativo, proporções mobile                            | Rota independente, não um modal sobre uma página interativa; campos/bordas acessíveis e links de retorno permanecem |
| Perfil/carteiras          | Menu de 310 px, ícones/destaque lateral e grade de campos                                      | Avatar local, senha, erros e salvamentos atuais; áreas sem contrato continuam desativadas                           |
| Recibo                    | Painel de 578 px; padding superior de 166 px no main                                           | Aviso de simulação, IDs completos e estado consultado; sem alegar transferência real                                |
| Hover/focus/disabled/erro | Tokens e regras existentes preservados                                                         | PNGs não documentam todos esses estados; nenhum estilo novo foi inventado para eles                                 |
| 768 px                    | Nove telas verificadas sem overflow horizontal                                                 | Sem PNG próprio nessa largura; transição responsiva, não identidade nova                                            |

As artes recortadas têm 212×212 px e podem mostrar ampliação em telas densas. A autenticação permanece em rota independente com fundo decorativo. Ícones sociais originais coloridos são mantidos. Busca, sort, formulário completo, conexão, revisão, aviso de simulação e IDs completos permanecem mesmo quando ausentes da referência. A notificação realtime soma 36 px antes do main do recibo com padding de 166 px. Badges promocionais, coração no card, zoom e carrosséis não foram inventados como novos controles: favoritos continuam no detalhe, a galeria usa miniaturas e relacionados são listas.

Os skeletons compartilham dimensões com o conteúdo: o teste exige igualdade exata de x/y/largura/altura da arte nas três larguras. Isso não é medição global de CLS. Acessibilidade automatizada não equivale a inspeção humana com leitor de tela/zoom nem certificação WCAG. Não há modo simplificado de auditoria; funcionalidades, fonte, imagens e mocks permanecem ativos.

## Publicação e entrega

Saída estática SPA em dist; nenhuma infraestrutura SSR ou servidor Socket.IO precisa ser publicado. Worker na raiz, HTTPS e fallback para index.html são necessários. Rotas inexistentes exibem o 404 do Router, podendo retornar HTTP 200 no fallback SPA. Instruções e verificação pós-deploy estão em [ENTREGA](docs/ENTREGA.md#publicação-manual-na-vercel), seguindo o [guia oficial Vite/Vercel](https://vercel.com/docs/frameworks/frontend/vite). A URL pública ainda é pendente.

Lighthouse executa três medições por página/perfil, 12 no total, com cenário success/120 ms e build otimizado. HTML/JSON, versões, condições, medianas, LCP/CLS/TBT e hash ficam em reports/lighthouse/delivery. O aviso de chunk >500 kB não foi ocultado. Resultados abaixo das metas são tratados em ENTREGA; a estação é compartilhada e o bootstrap frio da SPA/MSW participa do caminho crítico. Os resultados históricos protegidos permanecem em reports/lighthouse/final.
