# Decisões de execução

O código existente usa Vite + TanStack Router em modo SPA, não TanStack Start SSR. Esta etapa preserva esse modo para manter os componentes e o visual existentes. Dados remotos são obtidos no cliente com Query + Axios; toda simulação REST usa MSW, sem API routes ou server functions. Não foi introduzida infraestrutura de SSR.

MSW fica ativo por padrão tanto no desenvolvimento quanto no build de demonstração; pode ser desativado explicitamente por VITE_MOCKS=false. Sua inicialização precede a primeira consulta e protege acesso a window. O worker e as fixtures são locais; não é necessário backend privado. O deploy deve oferecer fallback de SPA para acesso direto às rotas.

Contratos, cenários, política de cache e limitações estão em API.md, ARQUITETURA.md e MOCKS.md. A etapa 3 integra socket.io-client com o binding MSW, em transporte WebSocket; polling REST permanece apenas como recuperação de pedidos pendentes. Perfil e carteiras seguem as capturas em docs/design e os tokens existentes, com formulários adaptados ao mobile. Nenhuma avaliação visual ou de CLS foi declarada sem navegador disponível.
