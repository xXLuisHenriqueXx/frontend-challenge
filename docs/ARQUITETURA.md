# Integração, estado e mocks

O app atual é uma SPA Vite com TanStack Router e renderização cliente. `src/main.tsx` aguarda iniciar o worker MSW antes de montar QueryClientProvider e RouterProvider. Os mocks são carregados por import dinâmico com guarda de window; não há server functions nem API routes para simular backend. Por padrão MSW está ativo inclusive no build de demonstração. `VITE_MOCKS=false` desativa; neste caso `VITE_API_URL` precisa apontar para uma API real compatível. Falha ao iniciar o worker é exibida e impede fetches sem interceptação.

`src/api/contracts.ts` define os contratos compartilhados. `client.ts` concentra Axios, QueryClient e opções de consulta. `hooks.tsx` concentra integrações com mutations. `src/mocks/database.ts` contém fixtures e persistência; `handlers.ts` implementa as regras de negócio simuladas exclusivamente na rede MSW. Interface não importa o banco de mocks. Dados de catálogo, detalhe, carrinho, cotação, carteiras e pedido vêm da API; provedores de carteira e rótulos de navegação são configuração de apresentação.

## URL e consultas

Busca, coleção, rede, categoria, ordenação, página e faixa de preço compõem o search tipado da rota inicial. Alterar filtro reinicia a página. Cada mudança navega pelo Router, permitindo refresh e histórico. Consulta usa a mesma estrutura validada como parâmetros Axios e query key. Não há cache separado sem parâmetros que possa sobrescrever um resultado mais recente. Cada GET recebe AbortSignal do Query; cotações também propagam signal. Ao abandonar uma consulta ou trocar sessão, requests ativos são cancelados. A interface mantém o resultado anterior da mesma key durante refetch e anuncia atualização em segundo plano.

Chaves públicas: `['nfts',search]` e `['nft',id]`. Chaves privadas: `['private',userId,recurso,...]`; visitante usa `guest`. Sessão: `['session']`, sempre revalidada ao montar e na guarda privada. Dados privados não entram em caches globais de catálogo. Logout/login cancela requests, remove cache privado e sessão, e invalida consultas ativas. O cliente envia identidade da sessão conhecida em X-Session-User; o mock rejeita requests iniciados por uma sessão já substituída. Autorização de recibo/cotação é validada também no handler.

Cache padrão: staleTime 15 s, gcTime 5 min, refetch ao focar a janela. Sessão e cotação têm staleTime zero. GETs e cotações têm no máximo uma repetição para erro de rede/5xx, nunca para 4xx. Mutations não são repetidas automaticamente. Pedidos pendentes usam polling REST a cada segundo nesta etapa; terminal interrompe polling. Socket.IO, deduplicação de eventos e reconciliação após reconnect estão pendentes para etapa 3.

Mutations do carrinho invalidam os recursos privados daquele usuário, incluindo a cotação. Favorito cancela a consulta, salva snapshot e altera a lista otimisticamente; falha restaura snapshot; conclusão invalida para reconciliar REST. Botão fica indisponível durante mutation. Falhas são apresentadas com opção de retry nas consultas e feedback acessível nas mutations conectadas.

## Sessão e persistência

O mock persiste dados em localStorage (`kurio.mock.v1`) para sobreviver a refresh. Sessão dura 30 minutos. Esta é uma simulação local compartilhada por abas da mesma origem, sem cookies reais ou backend; não oferece segurança de produção nem sincronização multiaba em tempo real. As duas contas têm dados privados separados. Credenciais de fixture e cenários estão em API.md. Respostas públicas de conta excluem hash e salt; senhas não são persistidas em claro. SHA-256 com salt é apenas hash simulado, não substitui algoritmo de derivação apropriado no servidor real.

Carrinho visitante persiste no banco mock e é mesclado no login por NFT/edição, somando quantidades até o estoque; depois o carrinho visitante é esvaziado. Logout não apaga carrinho autenticado nem o expõe ao visitante. Sessão expirada retorna 401; recursos privados redirecionam para login com retorno interno validado. O carrinho e a tentativa de compra ficam preservados. Retornos externos e `//host` são rejeitados. O escopo atual protege pagamento e confirmação; telas de perfil/carteiras ainda serão implementadas na etapa 3, embora os contratos e handlers existam.

Tentativa de pedido usa chave aleatória por usuário em sessionStorage, com quoteId/walletId fixos. Timeout preserva a tentativa para reenvio idempotente; sucesso a remove. Erro de negócio remove a tentativa e recarrega cotação para nova confirmação. A URL de confirmação contém orderId, nunca status autoritativo; acesso inexistente mostra erro da API. Cotação e recibo usam strings decimais e cálculos BigInt, sem arredondamento binário. A UI mantém sua composição original; estados assíncronos e feedback foram adicionados sem redesenho.

## Execução e limites de validação

`npm install`, `npm run dev`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run preview` e `npm run test:integration`. No PowerShell com npm.ps1 bloqueado, usar npm.cmd. A instalação atual usa package-lock.json para npm; yarn.lock foi atualizado automaticamente pelo npm e não deve ser editado manualmente. Worker gerado em public/mockServiceWorker.js deve ser publicado na raiz. Hosting precisa encaminhar rotas da SPA para index.html e servir worker/assets normalmente.

Testes de integração usam os mesmos handlers MSW com setupServer e Axios sobre HTTP interceptado. Verificam contratos, falhas, persistência e isolamento sem setters de UI. Não são E2E e não comprovam foco, layout, histórico do navegador ou rollback renderizado. A sessão de execução desta etapa não tem navegador conectado; teste manual de interface está pendente. Playwright, Socket.IO, skeletons e Lighthouse continuam como lacunas de etapas posteriores.
