# Testes automatizados

Use Node 24 e `npm ci`. Instale o Chromium da versão de Playwright fixada no lockfile com `npx playwright install chromium`. Se `PLAYWRIGHT_BROWSERS_PATH` não estiver definido, a configuração também reconhece a instalação local em `.npm-cache/playwright`.

- `npm run test:e2e`: build otimizado, preview em 127.0.0.1:3100, testes funcionais/visuais em 390 e 1440 e acessibilidade também em 768; encerra o preview ao terminar.
- `npm run test:e2e:update`: executa a mesma suíte e atualiza as referências PNG. Revise as diferenças antes de versionar os arquivos em `tests/e2e/visual.spec.ts-snapshots`.
- `npm run test:e2e:report`: abre o relatório HTML da última execução em `playwright-report/index.html`.
- `npm run test:a11y`: executa somente acessibilidade nas três larguras.
- `npm run test:integration` e `npm run test:realtime`: verificações complementares dos contratos REST e do transporte Socket.IO.

É possível filtrar, por exemplo, com `npm run test:e2e -- tests/e2e/marketplace.spec.ts --project=chromium-390`. A porta precisa estar livre; para reutilizar explicitamente um preview compatível, defina `E2E_REUSE_SERVER=true`. O executor próprio chama Node diretamente para evitar processos npm/cmd órfãos no Windows.

Cada teste usa um contexto de navegador novo e restaura os dados MSW. Os fluxos usam Axios, handlers MSW e socket.io-client da aplicação. O helper faz fetch no navegador para configurar os mocks e verificar os resultados REST; `page.request` não passa pelo service worker. Não há interceptações Playwright substituindo respostas de negócio ou chamadas a setters/cache da interface.

Os testes aguardam estados observáveis, respostas ou asserções com polling, sem `waitForTimeout` ou sleeps fixos. Cenários `slow`, `out-of-order` e `order-timeout` têm latências definidas no mock. `pending-orders` preserva pedidos pendentes até a mudança de cenário; `POST /api/mock/timing` aceita `latency` em milissegundos e `settlementPaused` booleano para controlar a simulação. Esses controles voláteis são limpos por `/api/mock/reset`; `pending-orders` é persistido para testar refresh. Continuam valendo as regras de autorização, estoque e idempotência normais.

As capturas de início, detalhe, carrinho e pagamento usam data fixa (06/11/2026 às 12:00 UTC), dados restaurados, preferência de movimento reduzido, animações desativadas, carregamento de fontes/imagens concluído e respostas de latência determinística. A comparação exige zero pixels diferentes. Os nomes incluem projeto e plataforma: as referências atuais são Chromium/Windows; outro sistema operacional pode renderizar fontes diferentemente e exige referências próprias revisadas. As referências são arquivos do repositório; sua criação não equivale a comprovar fidelidade ao Figma indisponível.

Falhas preservam trace e screenshot em `test-results`; relatório, traces e resultados de execução são ignorados pelo Git. Não há retries automáticos para ocultar instabilidade. O HTML reúne os resultados e anexos axe. Automação de teclado, reflow e axe complementa a inspeção humana, sem substituí-la.

Após as otimizações, as capturas percorrem as imagens CSS visíveis para acionar lazy loading nativo, aguardam decode/fontes e retornam ao topo. Imagens ocultas de outro breakpoint não bloqueiam a espera. Carrinho mobile usa captura do viewport para preservar o resumo fixo; o teste exige que Conectar e finalizar esteja no viewport. As demais capturas continuam de página inteira. Referências foram revisadas após adicionar WebP responsivo e dimensões; nenhum recurso foi ocultado para fazer o teste passar.
