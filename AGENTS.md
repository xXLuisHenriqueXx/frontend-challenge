# Contexto

Projeto: NFT Marketplace (React + TypeScript) sobre TanStack Start.

- `docs/DESAFIO.md` é o enunciado completo e a fonte da verdade. NUNCA editar ou apagar.
- O `README.md` atual é o template padrão do TanStack Start. Deve ser SUBSTITUÍDO na etapa
  final por um README de execução do projeto (instalação, mocks, testes, Lighthouse).
- O layout do Figma define a identidade visual; como ele não está acessível a você, o código
  atual e as capturas em `docs/design/` (se existirem) são a referência visual.

# Particularidades do TanStack Start

- O projeto usa TanStack Start (SSR + server functions). NÃO use server functions nem API routes
  do Start para simular a API: toda a API simulada vive no MSW.
- Dados remotos devem ser buscados via TanStack Query + Axios, no cliente. O MSW e o
  socket.io-client rodam no navegador; garanta que nada disso quebre no render de servidor
  (guardas de `typeof window`, inicialização do MSW antes do primeiro fetch).
- Avalie e documente em `docs/DECISOES.md` se o app roda em modo SPA ou SSR, e garanta que o
  build de demonstração funcione com os mocks ativos.
