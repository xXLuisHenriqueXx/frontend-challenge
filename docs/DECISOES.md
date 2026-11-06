# Decisões de execução

O código existente usa Vite + TanStack Router em modo SPA, não TanStack Start SSR. Esta etapa preserva esse modo para manter os componentes e o visual existentes. Dados remotos são obtidos no cliente com Query + Axios; toda simulação REST usa MSW, sem API routes ou server functions. Não foi introduzida infraestrutura de SSR.

MSW fica ativo por padrão tanto no desenvolvimento quanto no build de demonstração; pode ser desativado explicitamente por VITE_MOCKS=false. Sua inicialização precede a primeira consulta e protege acesso a window. O worker e as fixtures são locais; não é necessário backend privado. O deploy deve oferecer fallback de SPA para acesso direto às rotas.

Contratos, cenários, política de cache e limitações estão em API.md e ARQUITETURA.md. Tempo real será integrado na etapa 3, conforme docs/prompts/3.md; polling de pedidos nesta etapa é mecanismo de consulta REST, não atendimento ao requisito Socket.IO.
