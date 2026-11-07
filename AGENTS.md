# Contexto

Projeto: NFT Marketplace (React + TypeScript), SPA Vite com TanStack Router.

- `docs/DESAFIO.md` é o enunciado completo e a fonte da verdade. NUNCA editar ou apagar.
- README.md documenta instalação, mocks, testes e Lighthouse; ARCHITECTURE.md concentra contratos e decisões.
- O layout do Figma define a identidade visual; como ele não está acessível a você, o código
  atual e as capturas em `docs/design/` (se existirem) são a referência visual.

# Particularidades do TanStack Start

- O projeto usa SPA com renderização cliente. NÃO use server functions nem API routes
  do Start para simular a API: toda a API simulada vive no MSW.
- Dados remotos devem ser buscados via TanStack Query + Axios, no cliente. O MSW e o
  socket.io-client rodam no navegador; garanta que nada disso quebre no render de servidor
  (guardas de `typeof window`, inicialização do MSW antes do primeiro fetch).
- Avalie e documente em `ARCHITECTURE.md` se o app roda em modo SPA ou SSR, e garanta que o
  build de demonstração funcione com os mocks ativos.
