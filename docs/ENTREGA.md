# Entrega — seção 12

## Publicação manual na Vercel

**URL pública: PENDENTE.** O deploy obrigatório ainda não está entregue. A configuração local e os testes no preview não comprovam execução no host público. A publicação fica a cargo do responsável com sua conta, conforme solicitado.

1. Revise o diff, faça commit dos arquivos preparados e envie a branch ao repositório. Registre `git rev-parse HEAD` para conferir a revisão publicada.
2. No painel Vercel, importe o repositório e selecione essa branch. Use framework **Vite**, raiz do projeto, Node **24.x**, instalação `npm ci`, build `npm run build` e saída `dist`. O vercel.json já contém instalação/build/saída, fallback SPA e cache do worker.
3. Configure as variáveis abaixo em **Production e Preview**, antes do build. Nenhum segredo ou serviço privado é necessário. Mudanças em VITE_* exigem novo build.
4. Publique, confira o commit informado pelo deployment, complete o checklist abaixo e preencha a URL pública no README e neste documento.

| Variável        | Valor da demonstração |
| --------------- | --------------------- |
| VITE_MOCKS      | true                  |
| VITE_API_URL    | /api                  |
| VITE_SOCKET_URL | wss://kurio.mock      |

Alternativa pelo terminal, **para o responsável executar** na raiz depois de commit/push:

```sh
npx vercel@latest login
npx vercel@latest link
npx vercel@latest env add VITE_MOCKS production
npx vercel@latest env add VITE_API_URL production
npx vercel@latest env add VITE_SOCKET_URL production
npx vercel@latest env add VITE_MOCKS preview
npx vercel@latest env add VITE_API_URL preview
npx vercel@latest env add VITE_SOCKET_URL preview
npx vercel@latest
npx vercel@latest --prod
```

Informe os valores da tabela nas perguntas env add, confirme o projeto e as configurações de build na vinculação, valide o preview e então publique em produção. Não publique arquivos .env reais; .vercelignore exclui dependências, caches, relatórios e dados locais do upload CLI, preservando src/public/configs.

Referências oficiais consultadas: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [deploy por CLI](https://vercel.com/docs/projects/deploy-from-cli), [configuração estática](https://vercel.com/docs/project-configuration/vercel-json). Não foi executado login, link, upload ou deploy nesta tarefa.

### Checklist pós-deploy — obrigatório no host público

- [ ] URL HTTPS acessível sem login de proteção de deployment durante a avaliação.
- [ ] Deployment aponta para o mesmo commit entregue; preencher a URL no README/ENTREGA.
- [ ] /mockServiceWorker.js retorna JavaScript, não HTML, e o worker controla a página.
- [ ] Primeiro acesso/reset em /?reset=1&scenario=success mostra as fixtures; retirar reset antes de refresh para conferir persistência.
- [ ] Acesso direto e refresh em /product/1, /cart, /profile, /wallets e /payment; guardas redirecionam visitante e retornam após login.
- [ ] Criar pedido real na simulação e conferir acesso direto/refresh da URL /payment/confirm?orderId=ID; manter o mesmo pedido e recibo.
- [ ] Rota desconhecida mostra o 404 da aplicação; assets reais e worker não caem no HTML da SPA. Em SPA, o status HTTP da navegação desconhecida pode ser 200.
- [ ] Dois usuários, logout/expiração e favoritos/carrinhos permanecem isolados; reset recupera a demonstração.
- [ ] Mudança via /api/mock/nft chega pelo socket, recota carrinho/checkout e exige revisão.
- [ ] Socket offline durante pedido pendente, refresh e reconexão recuperam o mesmo orderId; duplicatas/eventos antigos não regridem estado.
- [ ] Compra confirmada remove somente a quantidade comprada; recusa/timeout preservam recuperação.
- [ ] Sem dependência de servidor em kurio.mock, gateway, extensão de carteira ou credenciais privadas.

## Procedimento de validação e restauração

A etapa 7 ainda estava sem commit. Foi criado um checkpoint local independente em `refs/codex/pre-cleanup-stage8`, preservando fontes, alterações e arquivos inicialmente não rastreados antes da exclusão. Recuperação pontual, se uma remoção quebrar o projeto:

```sh
git restore --source=refs/codex/pre-cleanup-stage8 -- caminho/do/arquivo
```

A limpeza usa git rm apenas para candidatos APAGAR. A instalação raiz remove node_modules e executa npm ci; tarballs do cache npm são verificados pelo lockfile. A comprovação adicional usa git clone de um snapshot local preparado, diretório novo, instalação sem node_modules anterior e build, com os mesmos arquivos de runtime. O cache de pacotes/Chromium não fornece código-fonte ou assets ausentes; um checkout comum usa npm ci e npx playwright install chromium.

Resultados locais concluídos abaixo. Publicação manual e avaliação humana continuam pendentes.

O inventário e o plano históricos abaixo foram apresentados antes das exclusões, que já foram executadas. Arquivos já ausentes por movimentações da etapa 7 são identificados separadamente e não representam exclusões desta limpeza.

## Exigências — resultado final

| Requisito da seção 12                                 | Onde está / evidência                                                                                | Status                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Código, lockfile, assets, mocks e fixtures            | src/, public/, package-lock.json; clone com 212 arquivos de execução/teste/config idênticos          | ✅                                                            |
| Testes e baselines                                    | tests/, scripts/unit/; suíte completa 52/52 e 8 imagens com zero diferenças, sem atualizar baselines | ✅                                                            |
| Configurações e relatórios Lighthouse finais          | lighthouse.config.mjs, reports/lighthouse/final preservado e delivery com 12 novas medições          | ✅ Coleta; ⚠️ metas de desempenho não integralmente atingidas |
| Deploy público e correspondência da versão            | vercel.json e procedimento manual acima; URL ainda não publicada                                     | ❌ Publicação pelo responsável pendente                       |
| README com setup, env, credenciais, cenários e falhas | README.md e .env.example                                                                             | ✅                                                            |
| ARCHITECTURE.md completo na raiz                      | Contratos, eventos, sessão, carrinho, cache, reconciliação, UX e limitações consolidados             | ✅                                                            |
| Scripts obrigatórios                                  | package.json; comandos executados abaixo                                                             | ✅                                                            |
| Instalação e checkout limpos, sem backend privado     | node_modules removido; npm ci raiz; clone Git real em outra pasta, novo npm ci e build               | ✅                                                            |

## Validação final

Node 24.14.0 / Windows. Instalação raiz: 612 pacotes após remover node_modules. Clone: `bf0bf196167e56181c0d986006e03ffc1c861cad`, branch local de verificação `codex-delivery-stage8-1794016109388`, criado por git clone --no-local em diretório temporário novo fora do repositório. A branch original não foi trocada, não houve push nem deploy. Os arquivos de execução, testes e configuração foram comparados após o clone, normalizando somente CRLF de texto. [Comprovação](../reports/validation/delivery/checkout.json).

Playwright completo: **52/52**, incluindo 32 verificações funcionais/publicação, 2 testes visuais (8 PNGs) e 18 de acessibilidade em 390/768/1440 px; zero retries. Design: **30/30**. Regras puras: **31/31**. Contratos REST: **60/60**. Transporte/reconciliação Socket.IO: **17/17**. [HTML final](../reports/playwright/final/index.html). O relatório final inclui anexos axe; a automação não substitui revisão humana com leitor de tela ou comparação do Figma original inacessível.

As oito imagens foram comparadas com as baselines preservadas da etapa 7, sem diferenças. A referência de pagamento mobile também foi conferida com a captura final: a simulação usa uma carteira com endereço completo e total de 1.206 ETH, enquanto o PNG usa duas carteiras, endereços abreviados e 8.936 ETH. Os controles reais de conexão/revisão e o formulário adicional alongam a tela; essas divergências funcionais e de dados permanecem explícitas, não foram tratadas como igualdade com o Figma. Os demais desvios por tela estão em ARCHITECTURE.md.

| Execução        | Comando                                                                                                      | Saída         | Evidência                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------ | ------------- | -------------------------------------------------------------- |
| install-root    | `npm ci --offline --no-audit --no-fund --cache .npm-cache`                                                   | ✅ 0          | [log](../reports/validation/delivery/logs/install-root.log)    |
| typecheck       | `npm run typecheck`                                                                                          | ✅ 0          | [log](../reports/validation/delivery/logs/typecheck.log)       |
| build           | `npm run build`                                                                                              | ⚠️ 3221226505 | [log](../reports/validation/delivery/logs/build.log)           |
| lint            | `npm run lint`                                                                                               | ✅ 0          | [log](../reports/validation/delivery/logs/lint.log)            |
| build-final     | `npm run build`                                                                                              | ✅ 0          | [log](../reports/validation/delivery/logs/build-final.log)     |
| smoke           | `npm run test:e2e -- tests/e2e/deployment.spec.ts`                                                           | ✅ 0          | [log](../reports/validation/delivery/logs/smoke.log)           |
| format-check    | `npm run check`                                                                                              | ✅ 0          | [log](../reports/validation/delivery/logs/format-check.log)    |
| e2e             | `npm run test:e2e`                                                                                           | ⚠️ 1          | [log](../reports/validation/delivery/logs/e2e.log)             |
| typecheck-final | `npm run typecheck`                                                                                          | ✅ 0          | [log](../reports/validation/delivery/logs/typecheck-final.log) |
| lint-final      | `npm run lint`                                                                                               | ✅ 0          | [log](../reports/validation/delivery/logs/lint-final.log)      |
| e2e-final       | `npm run test:e2e`                                                                                           | ✅ 0          | [log](../reports/validation/delivery/logs/e2e-final.log)       |
| clone-install   | `npm ci --offline --no-audit --no-fund --cache C:\Users\Luis\Documents\GitHub\frontend-challenge\.npm-cache` | ✅ 0          | [log](../reports/validation/delivery/logs/clone-install.log)   |
| clone-build     | `npm run build`                                                                                              | ✅ 0          | [log](../reports/validation/delivery/logs/clone-build.log)     |
| design          | `npm run test:design`                                                                                        | ✅ 0          | [log](../reports/validation/delivery/logs/design.log)          |
| unit            | `npm run test:unit`                                                                                          | ✅ 0          | [log](../reports/validation/delivery/logs/unit.log)            |
| integration     | `npm run test:integration`                                                                                   | ✅ 0          | [log](../reports/validation/delivery/logs/integration.log)     |
| realtime        | `npm run test:realtime`                                                                                      | ✅ 0          | [log](../reports/validation/delivery/logs/realtime.log)        |
| lighthouse      | `npm run lighthouse`                                                                                         | ✅ 0          | [log](../reports/validation/delivery/logs/lighthouse.log)      |

### Ocorrências e correções

- O Vite em desenvolvimento foi interrompido temporariamente para liberar a DLL nativa no Windows durante a remoção de node_modules. Após as auditorias, foi restabelecido em http://localhost:3000, com resposta HTTP 200 verificada.
- O primeiro build concorrente com lint/typecheck esgotou memória nativa (3221226505); o build isolado passou. As verificações posteriores foram executadas sequencialmente.
- A suíte encontrou uma corrida preexistente: requestAnimationFrame focava um botão antes de sua remoção do DOM no carrinho. O foco agora é aplicado após o commit de React. O teste original foi mantido.
- Axe encontrou contraste transitório de 3,07:1 ao habilitar o botão de pagamento. As transições dos botões agora excluem opacidade; cores e aparência final permanecem iguais. O teste original foi mantido.
- Uma execução intermediária falhou ao importar o chunk de MSW, com net::ERR_INSUFFICIENT_RESOURCES no trace. O chunk existe e foi servido com HTTP 200 nas navegações anteriores. A estação tinha aproximadamente 484 MB de memória física livre; a execução final foi isolada. Os logs intermediários não foram omitidos.
- Nenhum arquivo precisou ser restaurado por dependência da limpeza. Nenhum contrato, rota, query key, handler, baseline ou fixture foi modificado nesta etapa.

Traces preservados das falhas intermediárias: [foco no carrinho](../reports/playwright/final/failures/cart-focus.zip), [contraste transitório](../reports/playwright/final/failures/button-contrast.zip) e [recursos insuficientes](../reports/playwright/final/failures/startup-import.zip). A execução final completa passou sem retries. [Verificação de integridade](../reports/validation/delivery/integrity.json): 34 arquivos protegidos sem alterações, links internos válidos e nenhuma outra versão de dependência modificada no lockfile.

### Lighthouse — medianas de três execuções por página/perfil

| Página / perfil  | Performance | Accessibility | Best Practices | SEO | LCP    | CLS   | TBT    |
| ---------------- | ----------- | ------------- | -------------- | --- | ------ | ----- | ------ |
| home / mobile    | 82          | 100           | 96             | 100 | 4.14 s | 0.001 | 123 ms |
| home / desktop   | 99          | 100           | 96             | 100 | 0.95 s | 0.001 | 3 ms   |
| detail / mobile  | 85          | 100           | 96             | 100 | 4.13 s | 0.000 | 71 ms  |
| detail / desktop | 99          | 100           | 96             | 100 | 0.97 s | 0.000 | 0 ms   |

Metas: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90. **As medianas não atingiram todas as metas; isso permanece uma divergência de entrega.** Saída 0 indica coleta completa, não aprovação das metas. [Resumo com condições, versões, hashes e 12 amostras](../reports/lighthouse/delivery/summary.json). Cenário success/120 ms, cache/browser frios, throttling simulado versionado, imagens/fontes e mocks reais, sem modo especial de auditoria. A estação Windows é compartilhada e não tem isolamento de CPU/memória. A análise por auditoria está no [índice Lighthouse](../reports/lighthouse/README.md).

### Limpeza concluída

178 arquivos existentes classificados APAGAR foram removidos com git rm, conforme lista exata e inventário históricos abaixo. Grupos: prompts e metadados locais; documentação redundante após consolidação; medições Lighthouse exploratórias before/optimized; capturas e verificações intermediárias; dois scripts transitórios. Artefatos locais antigos também foram regenerados. Não foram apagados código em uso, assets, fontes usadas, handlers/fixtures, testes, baselines, configurações, lockfiles ou relatórios Lighthouse finais protegidos.

Dependências removidas por ausência de uso: @fontsource-variable/geist, @fontsource-variable/roboto e @tanstack/eslint-plugin-query. Nenhuma outra versão do lockfile foi atualizada. O warning de peer opcional do preset ESLint já existia; a instalação e o lint com zero warnings passaram. O aviso de chunk de produção >500 kB permanece visível e está relacionado ao custo de distribuição da demonstração.

### Rechecagem dos itens eliminatórios

Stack obrigatória preservada; dados consultados via Axios/TanStack Query; API e Socket.IO realmente interceptados no navegador; compra confirmada somente por estado retornado; isolamento de sessão; falhas, refresh e reconexão cobertos por testes; instalação e build sem serviços privados comprovados no clone. Não foram identificados eliminatórios nesses itens locais. **Deploy é obrigatório no enunciado e segue pendente**, conforme instrução explícita de não publicar automaticamente. Metas Lighthouse e revisão visual/humana não são declaradas aprovadas quando não comprovadas.

## Classificação prévia

| Grupo                                                                       | Decisão                      | Motivo                                                                                 |
| --------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- |
| src/, public/, tests/, scripts de teste/auditoria, configs                  | MANTER                       | Implementação, testes e execução; nenhum módulo ativo será apagado                     |
| package-lock.json e yarn.lock                                               | MANTER                       | Regra expressa de preservar lockfile; instalação oficial exclusivamente por npm ci     |
| docs/DESAFIO.md, AGENTS.md                                                  | MANTER                       | Enunciado imutável e instruções do repositório                                         |
| docs/design/, scripts/optimize-images.mjs e extract-reference-assets.mjs    | MANTER                       | Referências e fontes usadas para reproduzir assets locais                              |
| reports/lighthouse/final/                                                   | MANTER                       | Relatórios finais protegidos da etapa 6; nova coleta irá para delivery/                |
| .env.example, vercel.json e configurações da stack                          | MANTER                       | Instalação, demonstração e publicação                                                  |
| .cta.json e .vscode/settings.json                                           | APAGAR                       | Metadados do gerador e preferências locais de editor                                   |
| docs/prompts/                                                               | APAGAR                       | Histórico de instruções de implementação; não integra a entrega                        |
| docs/API, MOCKS, ARQUITETURA e DECISOES                                     | APAGAR após fusão            | Conteúdo será consolidado em ARCHITECTURE.md                                           |
| docs/AUDITORIA, TESTES e FIDELIDADE                                         | APAGAR após consolidação     | Resultados, comandos e desvios serão incorporados em ENTREGA, README e ARCHITECTURE    |
| reports/lighthouse/before/ e optimized/                                     | APAGAR                       | Medições exploratórias, não finais                                                     |
| reports/fidelity/ e verification/ antigos                                   | APAGAR                       | Capturas, painéis e evidências intermediárias; novos resultados finais serão entregues |
| scripts/prepare-clean.mjs e review-visual-diffs.mjs                         | APAGAR                       | Utilitários transitórios das etapas anteriores; validação usará clone real             |
| dist/, test-results/, playwright-report/ antigos e .verification/ histórica | APAGAR localmente            | Artefatos gerados, serão recriados pelos comandos                                      |
| node_modules/                                                               | REINSTALAR                   | Exclusão e npm ci obrigatórios nesta etapa                                             |
| .npm-cache/ e Chromium instalado                                            | MANTER apenas local/ignorado | Tarballs verificados pelo lockfile e browser de testes; não serão versionados          |
| Devtools em uso e utils apontado por components.json                        | MANTER (dúvida resolvida)    | Imports/configuração mostram uso; remoção seria alteração desnecessária                |

Dependências sem uso direto confirmado: @fontsource-variable/geist, @fontsource-variable/roboto e @tanstack/eslint-plugin-query. Serão removidas sem retirar nenhuma tecnologia obrigatória.

## Lista exata prevista para exclusão

```text
.cta.json
.vscode/settings.json
docs/API.md
docs/ARQUITETURA.md
docs/AUDITORIA.md
docs/DECISOES.md
docs/FIDELIDADE.md
docs/MOCKS.md
docs/TESTES.md
docs/prompts/1.md
docs/prompts/2.md
docs/prompts/3.md
docs/prompts/4.md
docs/prompts/5.md
docs/prompts/6.md
docs/prompts/7.md
docs/prompts/8.md
reports/fidelity/after/cart-1440.json
reports/fidelity/after/cart-1440.png
reports/fidelity/after/cart-390.json
reports/fidelity/after/cart-390.png
reports/fidelity/after/cart-768.json
reports/fidelity/after/cart-768.png
reports/fidelity/after/detail-1440.json
reports/fidelity/after/detail-1440.png
reports/fidelity/after/detail-390.json
reports/fidelity/after/detail-390.png
reports/fidelity/after/detail-768.json
reports/fidelity/after/detail-768.png
reports/fidelity/after/home-1440.json
reports/fidelity/after/home-1440.png
reports/fidelity/after/home-390.json
reports/fidelity/after/home-390.png
reports/fidelity/after/home-768.json
reports/fidelity/after/home-768.png
reports/fidelity/after/login-1440.json
reports/fidelity/after/login-1440.png
reports/fidelity/after/login-390.json
reports/fidelity/after/login-390.png
reports/fidelity/after/login-768.json
reports/fidelity/after/login-768.png
reports/fidelity/after/payment-1440.json
reports/fidelity/after/payment-1440.png
reports/fidelity/after/payment-390.json
reports/fidelity/after/payment-390.png
reports/fidelity/after/payment-768.json
reports/fidelity/after/payment-768.png
reports/fidelity/after/profile-1440.json
reports/fidelity/after/profile-1440.png
reports/fidelity/after/profile-390.json
reports/fidelity/after/profile-390.png
reports/fidelity/after/profile-768.json
reports/fidelity/after/profile-768.png
reports/fidelity/after/receipt-1440.json
reports/fidelity/after/receipt-1440.png
reports/fidelity/after/receipt-390.json
reports/fidelity/after/receipt-390.png
reports/fidelity/after/receipt-768.json
reports/fidelity/after/receipt-768.png
reports/fidelity/after/register-1440.json
reports/fidelity/after/register-1440.png
reports/fidelity/after/register-390.json
reports/fidelity/after/register-390.png
reports/fidelity/after/register-768.json
reports/fidelity/after/register-768.png
reports/fidelity/after/skeleton-1440.json
reports/fidelity/after/skeleton-390.json
reports/fidelity/after/skeleton-768.json
reports/fidelity/after/wallets-1440.json
reports/fidelity/after/wallets-1440.png
reports/fidelity/after/wallets-390.json
reports/fidelity/after/wallets-390.png
reports/fidelity/after/wallets-768.json
reports/fidelity/after/wallets-768.png
reports/fidelity/before/cart-1440.json
reports/fidelity/before/cart-1440.png
reports/fidelity/before/cart-390.json
reports/fidelity/before/cart-390.png
reports/fidelity/before/cart-768.json
reports/fidelity/before/cart-768.png
reports/fidelity/before/detail-1440.json
reports/fidelity/before/detail-1440.png
reports/fidelity/before/detail-390.json
reports/fidelity/before/detail-390.png
reports/fidelity/before/detail-768.json
reports/fidelity/before/detail-768.png
reports/fidelity/before/home-1440.json
reports/fidelity/before/home-1440.png
reports/fidelity/before/home-390.json
reports/fidelity/before/home-390.png
reports/fidelity/before/home-768.json
reports/fidelity/before/home-768.png
reports/fidelity/before/login-1440.json
reports/fidelity/before/login-1440.png
reports/fidelity/before/login-390.json
reports/fidelity/before/login-390.png
reports/fidelity/before/login-768.json
reports/fidelity/before/login-768.png
reports/fidelity/before/payment-1440.json
reports/fidelity/before/payment-1440.png
reports/fidelity/before/payment-390.json
reports/fidelity/before/payment-390.png
reports/fidelity/before/payment-768.json
reports/fidelity/before/payment-768.png
reports/fidelity/before/profile-1440.json
reports/fidelity/before/profile-1440.png
reports/fidelity/before/profile-390.json
reports/fidelity/before/profile-390.png
reports/fidelity/before/profile-768.json
reports/fidelity/before/profile-768.png
reports/fidelity/before/receipt-1440.json
reports/fidelity/before/receipt-1440.png
reports/fidelity/before/receipt-390.json
reports/fidelity/before/receipt-390.png
reports/fidelity/before/receipt-768.json
reports/fidelity/before/receipt-768.png
reports/fidelity/before/register-1440.json
reports/fidelity/before/register-1440.png
reports/fidelity/before/register-390.json
reports/fidelity/before/register-390.png
reports/fidelity/before/register-768.json
reports/fidelity/before/register-768.png
reports/fidelity/before/wallets-1440.json
reports/fidelity/before/wallets-1440.png
reports/fidelity/before/wallets-390.json
reports/fidelity/before/wallets-390.png
reports/fidelity/before/wallets-768.json
reports/fidelity/before/wallets-768.png
reports/fidelity/code-audit.json
reports/fidelity/diffs/cart-1440.png
reports/fidelity/diffs/cart-390.png
reports/fidelity/diffs/detail-1440.png
reports/fidelity/diffs/detail-390.png
reports/fidelity/diffs/home-1440.png
reports/fidelity/diffs/home-390.png
reports/fidelity/diffs/payment-1440.png
reports/fidelity/diffs/payment-390.png
reports/fidelity/diffs/summary.json
reports/fidelity/reference-comparison/cart-1440.png
reports/fidelity/reference-comparison/cart-390.png
reports/fidelity/reference-comparison/detail-1440.png
reports/fidelity/reference-comparison/detail-390.png
reports/fidelity/reference-comparison/home-1440.png
reports/fidelity/reference-comparison/home-390.png
reports/fidelity/reference-comparison/login-1440.png
reports/fidelity/reference-comparison/login-390.png
reports/fidelity/reference-comparison/payment-1440.png
reports/fidelity/reference-comparison/payment-390.png
reports/fidelity/reference-comparison/profile-1440.png
reports/fidelity/reference-comparison/receipt-1440.png
reports/fidelity/reference-comparison/register-1440.png
reports/fidelity/reference-comparison/register-390.png
reports/fidelity/reference-comparison/wallets-1440.png
reports/fidelity/reference-strip.png
reports/lighthouse/before/detail-desktop-1.html
reports/lighthouse/before/detail-desktop-1.json
reports/lighthouse/before/detail-mobile-1.html
reports/lighthouse/before/detail-mobile-1.json
reports/lighthouse/before/home-desktop-1.html
reports/lighthouse/before/home-desktop-1.json
reports/lighthouse/before/home-mobile-1.html
reports/lighthouse/before/home-mobile-1.json
reports/lighthouse/before/summary.json
reports/lighthouse/optimized/detail-desktop-1.html
reports/lighthouse/optimized/detail-desktop-1.json
reports/lighthouse/optimized/detail-mobile-1.html
reports/lighthouse/optimized/detail-mobile-1.json
reports/lighthouse/optimized/home-desktop-1.html
reports/lighthouse/optimized/home-desktop-1.json
reports/lighthouse/optimized/home-mobile-1.html
reports/lighthouse/optimized/home-mobile-1.json
reports/lighthouse/optimized/summary.json
reports/verification/stage7/summary.json
reports/verification/summary.json
reports/verification/test-integration.log
reports/verification/test-realtime.log
scripts/prepare-clean.mjs
scripts/review-visual-diffs.mjs
```

Exclusões locais de artefatos antigos:

```text
dist
test-results
playwright-report
.verification/clean
.verification/detail-review.png
.verification/finalize-stage7-evidence.mjs
.verification/migrations
.verification/prune-view-props.mjs
.verification/reference-panels.mjs
.verification/stage7-audit.mjs
.verification/update-stage7-docs.mjs
node_modules/ (reinstalar)
```

## Inventário inicial completo

187 caminhos rastreados e 275 não rastreados (sem artefatos ignorados).

<details>
<summary>Arquivos, estado inicial e classificação</summary>

| Caminho                                                            | Git inicial            | Decisão |
| ------------------------------------------------------------------ | ---------------------- | ------- |
| .cta.json                                                          | Rastreado              | APAGAR  |
| .env.example                                                       | Rastreado              | MANTER  |
| .gitignore                                                         | Rastreado              | MANTER  |
| .prettierignore                                                    | Rastreado              | MANTER  |
| .vscode/settings.json                                              | Rastreado              | APAGAR  |
| AGENTS.md                                                          | Rastreado              | MANTER  |
| ARCHITECTURE.md                                                    | Rastreado              | MANTER  |
| README.md                                                          | Rastreado              | MANTER  |
| components.json                                                    | Rastreado              | MANTER  |
| docs/API.md                                                        | Rastreado              | APAGAR  |
| docs/ARQUITETURA.md                                                | Rastreado              | APAGAR  |
| docs/AUDITORIA.md                                                  | Rastreado              | APAGAR  |
| docs/DECISOES.md                                                   | Rastreado              | APAGAR  |
| docs/DESAFIO.md                                                    | Rastreado              | MANTER  |
| docs/FIDELIDADE.md                                                 | Não rastreado          | APAGAR  |
| docs/MOCKS.md                                                      | Rastreado              | APAGAR  |
| docs/TESTES.md                                                     | Rastreado              | APAGAR  |
| docs/design/cart-desktop.png                                       | Rastreado              | MANTER  |
| docs/design/cart-mobile.png                                        | Rastreado              | MANTER  |
| docs/design/collector-profile-desktop.png                          | Rastreado              | MANTER  |
| docs/design/details-desktop.png                                    | Rastreado              | MANTER  |
| docs/design/details-mobile.png                                     | Rastreado              | MANTER  |
| docs/design/home-desktop.png                                       | Rastreado              | MANTER  |
| docs/design/home-mobile.png                                        | Rastreado              | MANTER  |
| docs/design/login-mobile.png                                       | Rastreado              | MANTER  |
| docs/design/modal-login-desktop.png                                | Rastreado              | MANTER  |
| docs/design/modal-register-desktop.png                             | Rastreado              | MANTER  |
| docs/design/payment-confirm-desktop.png                            | Rastreado              | MANTER  |
| docs/design/payment-desktop.png                                    | Rastreado              | MANTER  |
| docs/design/payment-mobile.png                                     | Rastreado              | MANTER  |
| docs/design/register-mobile.png                                    | Rastreado              | MANTER  |
| docs/design/wallets-desktop.png                                    | Rastreado              | MANTER  |
| docs/prompts/1.md                                                  | Rastreado              | APAGAR  |
| docs/prompts/2.md                                                  | Rastreado              | APAGAR  |
| docs/prompts/3.md                                                  | Rastreado              | APAGAR  |
| docs/prompts/4.md                                                  | Rastreado              | APAGAR  |
| docs/prompts/5.md                                                  | Rastreado              | APAGAR  |
| docs/prompts/6.md                                                  | Rastreado              | APAGAR  |
| docs/prompts/7.md                                                  | Não rastreado          | APAGAR  |
| docs/prompts/8.md                                                  | Não rastreado          | APAGAR  |
| eslint.config.js                                                   | Rastreado              | MANTER  |
| index.html                                                         | Rastreado              | MANTER  |
| lighthouse.config.mjs                                              | Rastreado              | MANTER  |
| package-lock.json                                                  | Rastreado              | MANTER  |
| package.json                                                       | Rastreado              | MANTER  |
| playwright.a11y.config.ts                                          | Rastreado              | MANTER  |
| playwright.config.ts                                               | Rastreado              | MANTER  |
| playwright.design.config.ts                                        | Não rastreado          | MANTER  |
| public/favicon.svg                                                 | Rastreado              | MANTER  |
| public/mockServiceWorker.js                                        | Rastreado              | MANTER  |
| public/robots.txt                                                  | Rastreado              | MANTER  |
| reports/fidelity/after/cart-1440.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/after/cart-1440.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/cart-390.json                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/cart-390.png                                | Não rastreado          | APAGAR  |
| reports/fidelity/after/cart-768.json                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/cart-768.png                                | Não rastreado          | APAGAR  |
| reports/fidelity/after/detail-1440.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/detail-1440.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/detail-390.json                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/detail-390.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/after/detail-768.json                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/detail-768.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/after/home-1440.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/after/home-1440.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/home-390.json                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/home-390.png                                | Não rastreado          | APAGAR  |
| reports/fidelity/after/home-768.json                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/home-768.png                                | Não rastreado          | APAGAR  |
| reports/fidelity/after/login-1440.json                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/login-1440.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/after/login-390.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/after/login-390.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/login-768.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/after/login-768.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/after/payment-1440.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/payment-1440.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/payment-390.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/payment-390.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/payment-768.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/payment-768.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/profile-1440.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/profile-1440.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/profile-390.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/profile-390.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/profile-768.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/profile-768.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/receipt-1440.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/receipt-1440.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/receipt-390.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/receipt-390.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/receipt-768.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/receipt-768.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/register-1440.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/after/register-1440.png                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/register-390.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/register-390.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/register-768.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/register-768.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/skeleton-1440.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/after/skeleton-390.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/skeleton-768.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/wallets-1440.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/after/wallets-1440.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/wallets-390.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/wallets-390.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/after/wallets-768.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/after/wallets-768.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/cart-1440.json                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/cart-1440.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/cart-390.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/cart-390.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/before/cart-768.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/cart-768.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/before/detail-1440.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/detail-1440.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/detail-390.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/detail-390.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/detail-768.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/detail-768.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/home-1440.json                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/home-1440.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/home-390.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/home-390.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/before/home-768.json                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/home-768.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/before/login-1440.json                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/login-1440.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/login-390.json                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/login-390.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/login-768.json                             | Não rastreado          | APAGAR  |
| reports/fidelity/before/login-768.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/before/payment-1440.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/before/payment-1440.png                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/payment-390.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/payment-390.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/payment-768.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/payment-768.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/profile-1440.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/before/profile-1440.png                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/profile-390.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/profile-390.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/profile-768.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/profile-768.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/receipt-1440.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/before/receipt-1440.png                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/receipt-390.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/receipt-390.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/receipt-768.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/receipt-768.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/register-1440.json                         | Não rastreado          | APAGAR  |
| reports/fidelity/before/register-1440.png                          | Não rastreado          | APAGAR  |
| reports/fidelity/before/register-390.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/before/register-390.png                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/register-768.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/before/register-768.png                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/wallets-1440.json                          | Não rastreado          | APAGAR  |
| reports/fidelity/before/wallets-1440.png                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/wallets-390.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/wallets-390.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/before/wallets-768.json                           | Não rastreado          | APAGAR  |
| reports/fidelity/before/wallets-768.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/code-audit.json                                   | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/cart-1440.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/cart-390.png                                | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/detail-1440.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/detail-390.png                              | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/home-1440.png                               | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/home-390.png                                | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/payment-1440.png                            | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/payment-390.png                             | Não rastreado          | APAGAR  |
| reports/fidelity/diffs/summary.json                                | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/cart-1440.png                | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/cart-390.png                 | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/detail-1440.png              | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/detail-390.png               | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/home-1440.png                | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/home-390.png                 | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/login-1440.png               | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/login-390.png                | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/payment-1440.png             | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/payment-390.png              | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/profile-1440.png             | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/receipt-1440.png             | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/register-1440.png            | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/register-390.png             | Não rastreado          | APAGAR  |
| reports/fidelity/reference-comparison/wallets-1440.png             | Não rastreado          | APAGAR  |
| reports/fidelity/reference-strip.png                               | Não rastreado          | APAGAR  |
| reports/lighthouse/README.md                                       | Rastreado              | MANTER  |
| reports/lighthouse/before/detail-desktop-1.html                    | Rastreado              | APAGAR  |
| reports/lighthouse/before/detail-desktop-1.json                    | Rastreado              | APAGAR  |
| reports/lighthouse/before/detail-mobile-1.html                     | Rastreado              | APAGAR  |
| reports/lighthouse/before/detail-mobile-1.json                     | Rastreado              | APAGAR  |
| reports/lighthouse/before/home-desktop-1.html                      | Rastreado              | APAGAR  |
| reports/lighthouse/before/home-desktop-1.json                      | Rastreado              | APAGAR  |
| reports/lighthouse/before/home-mobile-1.html                       | Rastreado              | APAGAR  |
| reports/lighthouse/before/home-mobile-1.json                       | Rastreado              | APAGAR  |
| reports/lighthouse/before/summary.json                             | Rastreado              | APAGAR  |
| reports/lighthouse/final/detail-desktop-1.html                     | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-desktop-1.json                     | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-desktop-2.html                     | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-desktop-2.json                     | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-desktop-3.html                     | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-desktop-3.json                     | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-mobile-1.html                      | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-mobile-1.json                      | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-mobile-2.html                      | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-mobile-2.json                      | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-mobile-3.html                      | Rastreado              | MANTER  |
| reports/lighthouse/final/detail-mobile-3.json                      | Rastreado              | MANTER  |
| reports/lighthouse/final/home-desktop-1.html                       | Rastreado              | MANTER  |
| reports/lighthouse/final/home-desktop-1.json                       | Rastreado              | MANTER  |
| reports/lighthouse/final/home-desktop-2.html                       | Rastreado              | MANTER  |
| reports/lighthouse/final/home-desktop-2.json                       | Rastreado              | MANTER  |
| reports/lighthouse/final/home-desktop-3.html                       | Rastreado              | MANTER  |
| reports/lighthouse/final/home-desktop-3.json                       | Rastreado              | MANTER  |
| reports/lighthouse/final/home-mobile-1.html                        | Rastreado              | MANTER  |
| reports/lighthouse/final/home-mobile-1.json                        | Rastreado              | MANTER  |
| reports/lighthouse/final/home-mobile-2.html                        | Rastreado              | MANTER  |
| reports/lighthouse/final/home-mobile-2.json                        | Rastreado              | MANTER  |
| reports/lighthouse/final/home-mobile-3.html                        | Rastreado              | MANTER  |
| reports/lighthouse/final/home-mobile-3.json                        | Rastreado              | MANTER  |
| reports/lighthouse/final/summary.json                              | Rastreado              | MANTER  |
| reports/lighthouse/optimized/detail-desktop-1.html                 | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/detail-desktop-1.json                 | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/detail-mobile-1.html                  | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/detail-mobile-1.json                  | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/home-desktop-1.html                   | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/home-desktop-1.json                   | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/home-mobile-1.html                    | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/home-mobile-1.json                    | Rastreado              | APAGAR  |
| reports/lighthouse/optimized/summary.json                          | Rastreado              | APAGAR  |
| reports/verification/stage7/summary.json                           | Não rastreado          | APAGAR  |
| reports/verification/summary.json                                  | Rastreado              | APAGAR  |
| reports/verification/test-integration.log                          | Rastreado              | APAGAR  |
| reports/verification/test-realtime.log                             | Rastreado              | APAGAR  |
| scripts/audit-lighthouse.mjs                                       | Rastreado              | MANTER  |
| scripts/audit-source.mjs                                           | Não rastreado          | MANTER  |
| scripts/extract-reference-assets.mjs                               | Não rastreado          | MANTER  |
| scripts/optimize-images.mjs                                        | Rastreado              | MANTER  |
| scripts/prepare-clean.mjs                                          | Rastreado              | APAGAR  |
| scripts/review-visual-diffs.mjs                                    | Não rastreado          | APAGAR  |
| scripts/run-a11y.mjs                                               | Rastreado              | MANTER  |
| scripts/run-e2e.mjs                                                | Rastreado              | MANTER  |
| scripts/run-lighthouse.mjs                                         | Rastreado              | MANTER  |
| scripts/test-integration.mjs                                       | Rastreado              | MANTER  |
| scripts/test-realtime.mjs                                          | Rastreado              | MANTER  |
| scripts/unit/domain.test.mjs                                       | Não rastreado          | MANTER  |
| src/api/checkout.ts                                                | Rastreado              | MANTER  |
| src/api/client.ts                                                  | Rastreado              | MANTER  |
| src/api/contracts.ts                                               | Rastreado              | MANTER  |
| src/api/hooks.tsx                                                  | Rastreado              | MANTER  |
| src/api/realtime.tsx                                               | Rastreado              | MANTER  |
| src/app.tsx                                                        | Rastreado              | MANTER  |
| src/assets/artwork.ts                                              | Não rastreado          | MANTER  |
| src/assets/auth-backdrop.webp                                      | Não rastreado          | MANTER  |
| src/assets/icons/facebook.svg                                      | Rastreado              | MANTER  |
| src/assets/icons/google.svg                                        | Rastreado              | MANTER  |
| src/assets/icons/instagram.svg                                     | Rastreado              | MANTER  |
| src/assets/icons/linkedin.svg                                      | Rastreado              | MANTER  |
| src/assets/icons/twitter.svg                                       | Rastreado              | MANTER  |
| src/assets/icons/youtube.svg                                       | Rastreado              | MANTER  |
| src/assets/monkey-256.webp                                         | Rastreado              | MANTER  |
| src/assets/monkey-512.webp                                         | Rastreado              | MANTER  |
| src/assets/monkey-768.webp                                         | Rastreado              | MANTER  |
| src/assets/monkey.png                                              | Rastreado              | MANTER  |
| src/assets/monkey.webp                                             | Rastreado              | MANTER  |
| src/assets/nft-golden.webp                                         | Não rastreado          | MANTER  |
| src/assets/nft-neon.webp                                           | Não rastreado          | MANTER  |
| src/assets/nft-sage.webp                                           | Não rastreado          | MANTER  |
| src/assets/thank-you.png                                           | Rastreado              | MANTER  |
| src/components/AccessibleForm.tsx                                  | Rastreado — já ausente | MANTER  |
| src/components/Account.tsx                                         | Rastreado — já ausente | MANTER  |
| src/components/Footer.tsx                                          | Rastreado — já ausente | MANTER  |
| src/components/Modal.tsx                                           | Rastreado — já ausente | MANTER  |
| src/components/NftImage.tsx                                        | Rastreado — já ausente | MANTER  |
| src/components/RouteAccessibility.tsx                              | Rastreado — já ausente | MANTER  |
| src/components/Skeleton.tsx                                        | Rastreado — já ausente | MANTER  |
| src/components/ui/badge.tsx                                        | Rastreado              | MANTER  |
| src/components/ui/button.tsx                                       | Rastreado              | MANTER  |
| src/components/ui/card.tsx                                         | Rastreado              | MANTER  |
| src/components/ui/field.tsx                                        | Rastreado              | MANTER  |
| src/components/ui/input.tsx                                        | Rastreado              | MANTER  |
| src/components/ui/label.tsx                                        | Rastreado              | MANTER  |
| src/components/ui/separator.tsx                                    | Rastreado              | MANTER  |
| src/components/ui/slider.tsx                                       | Rastreado              | MANTER  |
| src/features/auth/api/queries.ts                                   | Não rastreado          | MANTER  |
| src/features/auth/components/auth-heading.tsx                      | Não rastreado          | MANTER  |
| src/features/auth/components/login-form.tsx                        | Não rastreado          | MANTER  |
| src/features/auth/components/login-page.tsx                        | Não rastreado          | MANTER  |
| src/features/auth/components/register-page-view.tsx                | Não rastreado          | MANTER  |
| src/features/auth/components/register-page.tsx                     | Não rastreado          | MANTER  |
| src/features/auth/components/registration-fields.tsx               | Não rastreado          | MANTER  |
| src/features/auth/hooks/use-identity.ts                            | Não rastreado          | MANTER  |
| src/features/auth/hooks/use-login-page.ts                          | Não rastreado          | MANTER  |
| src/features/auth/hooks/use-logout.ts                              | Não rastreado          | MANTER  |
| src/features/auth/hooks/use-register-page.ts                       | Não rastreado          | MANTER  |
| src/features/auth/types/contracts.ts                               | Não rastreado          | MANTER  |
| src/features/auth/types/login-page-model.ts                        | Não rastreado          | MANTER  |
| src/features/auth/types/register-page-model.ts                     | Não rastreado          | MANTER  |
| src/features/cart/api/queries.ts                                   | Não rastreado          | MANTER  |
| src/features/cart/components/cart-line.tsx                         | Não rastreado          | MANTER  |
| src/features/cart/components/cart-page-view.tsx                    | Não rastreado          | MANTER  |
| src/features/cart/components/cart-page.tsx                         | Não rastreado          | MANTER  |
| src/features/cart/components/cart-summary.tsx                      | Não rastreado          | MANTER  |
| src/features/cart/hooks/use-cart-page.ts                           | Não rastreado          | MANTER  |
| src/features/cart/hooks/use-cart.ts                                | Não rastreado          | MANTER  |
| src/features/cart/hooks/use-quote.ts                               | Não rastreado          | MANTER  |
| src/features/cart/types/cart-page-model.ts                         | Não rastreado          | MANTER  |
| src/features/cart/types/contracts.ts                               | Não rastreado          | MANTER  |
| src/features/catalog/api/favorites.ts                              | Não rastreado          | MANTER  |
| src/features/catalog/api/queries.ts                                | Não rastreado          | MANTER  |
| src/features/catalog/api/search.ts                                 | Não rastreado          | MANTER  |
| src/features/catalog/components/blog-card.tsx                      | Não rastreado          | MANTER  |
| src/features/catalog/components/blog.tsx                           | Não rastreado          | MANTER  |
| src/features/catalog/components/categories.tsx                     | Não rastreado          | MANTER  |
| src/features/catalog/components/hero.tsx                           | Não rastreado          | MANTER  |
| src/features/catalog/components/pagination.tsx                     | Não rastreado          | MANTER  |
| src/features/catalog/components/product-card.tsx                   | Não rastreado          | MANTER  |
| src/features/catalog/components/products.tsx                       | Não rastreado          | MANTER  |
| src/features/catalog/components/promo-card.tsx                     | Não rastreado          | MANTER  |
| src/features/catalog/components/promos.tsx                         | Não rastreado          | MANTER  |
| src/features/catalog/components/search-bar.tsx                     | Não rastreado          | MANTER  |
| src/features/catalog/components/sidebar.tsx                        | Não rastreado          | MANTER  |
| src/features/catalog/components/sort-select.tsx                    | Não rastreado          | MANTER  |
| src/features/catalog/hooks/use-favorites.ts                        | Não rastreado          | MANTER  |
| src/features/catalog/hooks/use-nfts.ts                             | Não rastreado          | MANTER  |
| src/features/catalog/types/contracts.ts                            | Não rastreado          | MANTER  |
| src/features/checkout/components/checkout-actions.tsx              | Não rastreado          | MANTER  |
| src/features/checkout/components/checkout-page-view.tsx            | Não rastreado          | MANTER  |
| src/features/checkout/components/checkout-page.tsx                 | Não rastreado          | MANTER  |
| src/features/checkout/components/checkout-wallet-options.tsx       | Não rastreado          | MANTER  |
| src/features/checkout/components/collector-contact-fields.tsx      | Não rastreado          | MANTER  |
| src/features/checkout/components/collector-form.tsx                | Não rastreado          | MANTER  |
| src/features/checkout/components/collector-identity-fields.tsx     | Não rastreado          | MANTER  |
| src/features/checkout/components/collector-wallet-fields.tsx       | Não rastreado          | MANTER  |
| src/features/checkout/components/provider-card.tsx                 | Não rastreado          | MANTER  |
| src/features/checkout/components/saved-wallet-card.tsx             | Não rastreado          | MANTER  |
| src/features/checkout/hooks/use-checkout-page.ts                   | Não rastreado          | MANTER  |
| src/features/checkout/hooks/use-checkout.ts                        | Não rastreado          | MANTER  |
| src/features/checkout/lib/presentation.tsx                         | Não rastreado          | MANTER  |
| src/features/checkout/types/checkout-page-model.ts                 | Não rastreado          | MANTER  |
| src/features/nft/api/queries.ts                                    | Não rastreado          | MANTER  |
| src/features/nft/components/nft-description.tsx                    | Não rastreado          | MANTER  |
| src/features/nft/components/nft-details-tabs.tsx                   | Não rastreado          | MANTER  |
| src/features/nft/components/nft-gallery.tsx                        | Não rastreado          | MANTER  |
| src/features/nft/components/nft-page-parts.tsx                     | Não rastreado          | MANTER  |
| src/features/nft/components/nft-page-view.tsx                      | Não rastreado          | MANTER  |
| src/features/nft/components/nft-page.tsx                           | Não rastreado          | MANTER  |
| src/features/nft/components/nft-purchase-controls.tsx              | Não rastreado          | MANTER  |
| src/features/nft/hooks/use-nft-page.ts                             | Não rastreado          | MANTER  |
| src/features/nft/hooks/use-nft.ts                                  | Não rastreado          | MANTER  |
| src/features/nft/types/contracts.ts                                | Não rastreado          | MANTER  |
| src/features/nft/types/nft-page-model.ts                           | Não rastreado          | MANTER  |
| src/features/orders/api/queries.ts                                 | Não rastreado          | MANTER  |
| src/features/orders/components/order-page-parts.tsx                | Não rastreado          | MANTER  |
| src/features/orders/components/order-page-view.tsx                 | Não rastreado          | MANTER  |
| src/features/orders/components/order-page.tsx                      | Não rastreado          | MANTER  |
| src/features/orders/components/order-receipt.tsx                   | Não rastreado          | MANTER  |
| src/features/orders/components/receipt-amounts.tsx                 | Não rastreado          | MANTER  |
| src/features/orders/components/receipt-items.tsx                   | Não rastreado          | MANTER  |
| src/features/orders/components/receipt-status.tsx                  | Não rastreado          | MANTER  |
| src/features/orders/components/receipt-totals.tsx                  | Não rastreado          | MANTER  |
| src/features/orders/hooks/use-order-page.ts                        | Não rastreado          | MANTER  |
| src/features/orders/hooks/use-order.ts                             | Não rastreado          | MANTER  |
| src/features/orders/lib/receipt-state.ts                           | Não rastreado          | MANTER  |
| src/features/orders/types/contracts.ts                             | Não rastreado          | MANTER  |
| src/features/orders/types/order-page-model.ts                      | Não rastreado          | MANTER  |
| src/features/profile/api/queries.ts                                | Não rastreado          | MANTER  |
| src/features/profile/components/password-form.tsx                  | Não rastreado          | MANTER  |
| src/features/profile/components/profile-fields.tsx                 | Não rastreado          | MANTER  |
| src/features/profile/components/profile-page-parts.tsx             | Não rastreado          | MANTER  |
| src/features/profile/components/profile-page-view.tsx              | Não rastreado          | MANTER  |
| src/features/profile/components/profile-page.tsx                   | Não rastreado          | MANTER  |
| src/features/profile/hooks/use-profile-form.ts                     | Não rastreado          | MANTER  |
| src/features/profile/hooks/use-profile-page.ts                     | Não rastreado          | MANTER  |
| src/features/profile/hooks/use-profile.ts                          | Não rastreado          | MANTER  |
| src/features/realtime/api/event-gate.ts                            | Não rastreado          | MANTER  |
| src/features/realtime/components/realtime-status.tsx               | Não rastreado          | MANTER  |
| src/features/realtime/hooks/use-realtime-status.ts                 | Não rastreado          | MANTER  |
| src/features/realtime/types/contracts.ts                           | Não rastreado          | MANTER  |
| src/features/wallets/api/queries.ts                                | Não rastreado          | MANTER  |
| src/features/wallets/components/wallets-page-parts.tsx             | Não rastreado          | MANTER  |
| src/features/wallets/components/wallets-page-view.tsx              | Não rastreado          | MANTER  |
| src/features/wallets/components/wallets-page.tsx                   | Não rastreado          | MANTER  |
| src/features/wallets/hooks/use-wallet-form.ts                      | Não rastreado          | MANTER  |
| src/features/wallets/hooks/use-wallets-page.ts                     | Não rastreado          | MANTER  |
| src/features/wallets/hooks/use-wallets.ts                          | Não rastreado          | MANTER  |
| src/features/wallets/types/contracts.ts                            | Não rastreado          | MANTER  |
| src/lib/utils.ts                                                   | Rastreado              | MANTER  |
| src/main.tsx                                                       | Rastreado              | MANTER  |
| src/mocks/browser.ts                                               | Rastreado              | MANTER  |
| src/mocks/database.ts                                              | Rastreado              | MANTER  |
| src/mocks/events.ts                                                | Rastreado              | MANTER  |
| src/mocks/handlers.ts                                              | Rastreado              | MANTER  |
| src/mocks/socket.ts                                                | Rastreado              | MANTER  |
| src/routeTree.gen.ts                                               | Rastreado              | MANTER  |
| src/router.tsx                                                     | Rastreado              | MANTER  |
| src/routes/-components/Blog.tsx                                    | Rastreado — já ausente | MANTER  |
| src/routes/-components/BlogCard.tsx                                | Rastreado — já ausente | MANTER  |
| src/routes/-components/BottomBar.tsx                               | Rastreado — já ausente | MANTER  |
| src/routes/-components/Categories.tsx                              | Rastreado — já ausente | MANTER  |
| src/routes/-components/Header.tsx                                  | Rastreado — já ausente | MANTER  |
| src/routes/-components/Hero.tsx                                    | Rastreado — já ausente | MANTER  |
| src/routes/-components/Pagination.tsx                              | Rastreado — já ausente | MANTER  |
| src/routes/-components/ProductCard.tsx                             | Rastreado — já ausente | MANTER  |
| src/routes/-components/Products.tsx                                | Rastreado — já ausente | MANTER  |
| src/routes/-components/PromoCard.tsx                               | Rastreado — já ausente | MANTER  |
| src/routes/-components/Promos.tsx                                  | Rastreado — já ausente | MANTER  |
| src/routes/-components/SearchBar.tsx                               | Rastreado — já ausente | MANTER  |
| src/routes/-components/Sidebar.tsx                                 | Rastreado — já ausente | MANTER  |
| src/routes/-components/SortSelect.tsx                              | Rastreado — já ausente | MANTER  |
| src/routes/__root.tsx                                              | Rastreado              | MANTER  |
| src/routes/cart/-components/ProductCard.tsx                        | Rastreado — já ausente | MANTER  |
| src/routes/cart/index.tsx                                          | Rastreado              | MANTER  |
| src/routes/index.tsx                                               | Rastreado              | MANTER  |
| src/routes/login/index.tsx                                         | Rastreado              | MANTER  |
| src/routes/payment/confirm/index.tsx                               | Rastreado              | MANTER  |
| src/routes/payment/index.tsx                                       | Rastreado              | MANTER  |
| src/routes/product/$productId/index.tsx                            | Rastreado              | MANTER  |
| src/routes/profile/index.tsx                                       | Rastreado              | MANTER  |
| src/routes/register/index.tsx                                      | Rastreado              | MANTER  |
| src/routes/wallets/index.tsx                                       | Rastreado              | MANTER  |
| src/shared/api/api-error.ts                                        | Não rastreado          | MANTER  |
| src/shared/api/http.ts                                             | Não rastreado          | MANTER  |
| src/shared/api/query-keys.ts                                       | Não rastreado          | MANTER  |
| src/shared/components/accessible-form.tsx                          | Não rastreado          | MANTER  |
| src/shared/components/account.tsx                                  | Não rastreado          | MANTER  |
| src/shared/components/bottom-bar.tsx                               | Não rastreado          | MANTER  |
| src/shared/components/eth-price.tsx                                | Não rastreado          | MANTER  |
| src/shared/components/labeled-field.tsx                            | Não rastreado          | MANTER  |
| src/shared/components/modal.tsx                                    | Não rastreado          | MANTER  |
| src/shared/components/nft-image.tsx                                | Não rastreado          | MANTER  |
| src/shared/components/quantity-stepper.tsx                         | Não rastreado          | MANTER  |
| src/shared/components/remote-state.tsx                             | Não rastreado          | MANTER  |
| src/shared/components/route-accessibility.tsx                      | Não rastreado          | MANTER  |
| src/shared/components/site-footer.tsx                              | Não rastreado          | MANTER  |
| src/shared/components/site-header.tsx                              | Não rastreado          | MANTER  |
| src/shared/components/skeleton.tsx                                 | Não rastreado          | MANTER  |
| src/shared/components/summary-row.tsx                              | Não rastreado          | MANTER  |
| src/shared/lib/errors.ts                                           | Não rastreado          | MANTER  |
| src/shared/lib/money.ts                                            | Não rastreado          | MANTER  |
| src/shared/lib/validation.ts                                       | Não rastreado          | MANTER  |
| src/styles.css                                                     | Rastreado              | MANTER  |
| tests/a11y/accessibility.spec.ts                                   | Rastreado              | MANTER  |
| tests/design/fidelity.spec.ts                                      | Não rastreado          | MANTER  |
| tests/e2e/helpers.ts                                               | Rastreado              | MANTER  |
| tests/e2e/marketplace.spec.ts                                      | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts                                           | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/cart-chromium-1440-win32.png    | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/cart-chromium-390-win32.png     | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/detail-chromium-1440-win32.png  | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/detail-chromium-390-win32.png   | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/home-chromium-1440-win32.png    | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/home-chromium-390-win32.png     | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/payment-chromium-1440-win32.png | Rastreado              | MANTER  |
| tests/e2e/visual.spec.ts-snapshots/payment-chromium-390-win32.png  | Rastreado              | MANTER  |
| tsconfig.json                                                      | Rastreado              | MANTER  |
| tsr.config.json                                                    | Rastreado              | MANTER  |
| vercel.json                                                        | Rastreado              | MANTER  |
| vite.config.ts                                                     | Rastreado              | MANTER  |
| yarn.lock                                                          | Rastreado              | MANTER  |

</details>
