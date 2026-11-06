# Contratos REST

Adições da etapa 3: sessão inclui `token`; perfil aceita também `username`, `email`, `ens` e `walletNickname`; PATCH de perfil valida antes de persistir. Carteiras aceitam `role` (primary/secondary), `nickname`, `profileName` e `ens`, com limite de duas e ordem estável. POST `/cart/items` aceita `mode: 'add'` para somar quantidade, mantendo substituição absoluta como padrão para edição.

POST `/wallet-connection` recebe `{walletId,network}` e devolve `{connectionId}`; DELETE encerra as conexões da sessão. Recusa de conexão e rede incompatível retornam 422. No fluxo da interface, POST `/orders` inclui também `connectionId` e `collector {displayName,username,profileName,email,network,walletAddress,walletType,referralCode,...}`. Dados e conexão são validados, incluindo token da sessão e rede. O contrato básico anterior de pedidos permanece compatível para testes de baixo nível; a interface exige a conexão e a revisão dos dados. Todos os campos presentes fazem parte do corpo canônico da tentativa, e o mesmo corpo/chave recupera o pedido existente.

POST `/mock/nft` recebe `{id,price?,stock?}`, persiste alteração, incrementa a versão e publica nft.updated por Socket.IO. Cenários adicionais: wallet-refused, duplicate-events, old-events e socket-offline. Eventos, transporte e instruções completas em [MOCKS.md](MOCKS.md).

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

`Order`: id, userId, status, quote (cópia imutável), wallet (cópia), transactionId simulado, createdAt e version. Chaves de idempotência são isoladas por usuário e persistidas. Corpo canônico inclui `{quoteId,walletId,collector,connectionId}`; mesma chave e corpo recuperam o pedido após timeout ou mudança de estado; diferenças retornam 409. O mock liquida pedidos após 1,5 s via timer/consulta, exceto quando pausado explicitamente. Estados terminais não são reaplicados; confirmação remove somente quantidades compradas. `order.updated` e `nft.updated` são transmitidos pelo Socket.IO; contrato em MOCKS.md.

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
