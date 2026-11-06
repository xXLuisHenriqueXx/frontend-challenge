# Arquitetura do Kurio

A descrição mantida está em [docs/ARQUITETURA.md](docs/ARQUITETURA.md). Contratos REST em [docs/API.md](docs/API.md), protocolo Socket.IO em [docs/MOCKS.md](docs/MOCKS.md), decisões de execução/assets/acessibilidade em [docs/DECISOES.md](docs/DECISOES.md) e evidências/limites em [docs/AUDITORIA.md](docs/AUDITORIA.md).

SPA Vite com TanStack Router. O bootstrap carrega aplicação e mocks em paralelo, mas só monta React/Query após o worker MSW estar pronto. Nenhuma server function ou API route simula backend. Axios atende REST; socket.io-client recebe eventos pelo binding MSW; ambos consultam a mesma simulação persistida localmente.

Estado privado é separado por usuário. Pedidos usam tentativa idempotente persistida, revisão de cotação e recibo snapshot. ETH trafega como strings e usa BigInt nos cálculos. Rejeição de eventos antigos/duplicados, cleanup de subscriptions e reconciliação REST evitam regressão ou mistura de sessões.

Otimizações mantêm a arte original em derivados WebP responsivos, reservam dimensões, priorizam LCP e carregam imagens secundárias sob demanda. Não há simplificações condicionadas à auditoria. Mocks continuam ativos no build. Hospedagem deve servir `dist`, worker/assets e fallback SPA; configuração local não comprova deploy público.
