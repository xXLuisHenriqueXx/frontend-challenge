# Mocks REST e Socket.IO

O app continua SPA. `src/main.tsx` aguarda o MSW antes de montar a interface. `src/mocks/browser.ts` registra handlers HTTP e WebSocket; ambos consultam o mesmo banco persistente de `database.ts`. `socket.io-client` é importado depois do bootstrap do worker. Não existem chamadas da simulação diretamente a setters React ou ao QueryClient: mutations passam por Axios e eventos passam pelo Socket.IO.

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

## Cenários e comandos

`npm run dev`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run preview`, `npm run test:integration`, `npm run test:realtime`. No PowerShell, usar `npm.cmd` se o wrapper npm.ps1 estiver bloqueado.

Abrir `/?reset=1&scenario=success` restaura fixtures e encerra a sessão. Retirar `reset=1` da URL após inicializar evita repetir reset a cada refresh. Alternativamente, os controles abaixo são endpoints REST do próprio mock; depois de reset, recarregar a página para descartar caches em memória. O reset limpa os rascunhos e tentativas do checkout da aba atual. A simulação não coordena abas independentes.

```js
// Console do navegador, com o app e MSW ativos:
await fetch("/api/mock/scenario", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ scenario: "duplicate-events" }),
});
await fetch("/api/mock/nft", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: "1", price: "1.25", stock: 5 }),
});
```

Todos os cenários REST anteriores continuam disponíveis em API.md. Adições:

| Cenário            | Resultado                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------- |
| `wallet-refused`   | POST `/wallet-connection` retorna erro de recusa                                          |
| `duplicate-events` | Cada evento é enviado duas vezes com mesmo ID e versão                                    |
| `old-events`       | Após o evento atual, envia versão anterior com preço/estoque obsoletos ou pedido pendente |
| `socket-offline`   | Fecha conexões a cada 250 ms; retornar a success permite reconectar                       |
| `payment-refused`  | Novos pedidos terminam recusados, preservando carrinho                                    |
| `pending-orders`   | Mantém pedidos pendentes, inclusive após refresh, até mudar o cenário                     |

`POST /api/mock/timing` permite configurar `latency` (milissegundos) e `settlementPaused` (booleano) nos testes. Os controles são aplicados somente no servidor simulado e limpos por `/api/mock/reset`; são voláteis e não sobrevivem ao refresh. O cenário `pending-orders` usa a persistência normal para controlar a retomada de pedidos. Nenhum desses controles atualiza a interface diretamente.

Para o cenário completo de preço: adicionar NFT 1 ao carrinho, entrar no checkout, conectar carteira e revisar. Alterar preço usando `/mock/nft`. O evento deve avisar a mudança e recotar o resumo; o checkout exige revisar novamente. A API também rejeita o quoteId antigo com 409 mesmo se o evento não chegar. Para interrupção de pedido: criar tentativa, ativar socket-offline enquanto pendente e voltar a success; recuperar o mesmo orderId pela API após reconexão/refresh. Com order-timeout, usar Recuperar tentativa, mantendo chave e corpo persistidos por usuário.

## Validação e limites

`test:integration` usa Axios e os mesmos handlers HTTP, incluindo perfil/avatar/senha/carteiras, conexão, falhas e idempotência. `test:realtime` usa socket.io-client com transporte WebSocket do navegador no Node e o binding real do MSW: handshake, eventos, duplicatas/antigos pela rede, cotação obsoleta, terminalidade, snapshot, desconexão/reconexão e troca de usuário.

Esses testes de contratos são complementados por `test:e2e`: Playwright usa os mesmos mocks no navegador, exercita a interface em 390/1440 e acessibilidade também em 768. As referências PNG cobrem início, detalhe, carrinho e pagamento em desktop/mobile. Execução, controles e limites estão em [TESTES.md](TESTES.md). A inspeção humana com teclado/zoom nativo e a medição de CLS continuam pendentes; automação e capturas não equivalem a essas avaliações.
