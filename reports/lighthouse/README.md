# Lighthouse — medições finais

Execute `npm run lighthouse` para reproduzir 12 medições no build otimizado. Configuração: [lighthouse.config.mjs](../../lighthouse.config.mjs). Ambiente, condições, versões, hash das fontes e medianas: [summary.json](final/summary.json).

| Página/perfil | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) | Meta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Início mobile | 53 | 100 | 96 | 100 | 4809.8 | 0.0000 | 3332.5 | ⚠️ Performance <90 |
| Início desktop | 73 | 100 | 96 | 100 | 1215.5 | 0.0000 | 608.5 | ⚠️ Performance <90 |
| Detalhe mobile | 58 | 100 | 96 | 100 | 4955.6 | 0.0000 | 1124.5 | ⚠️ Performance <90 |
| Detalhe desktop | 96 | 100 | 96 | 100 | 1169.7 | 0.0000 | 85.5 | ✅ |

- home-mobile-1: [HTML](final/home-mobile-1.html), [JSON](final/home-mobile-1.json)
- home-mobile-2: [HTML](final/home-mobile-2.html), [JSON](final/home-mobile-2.json)
- home-mobile-3: [HTML](final/home-mobile-3.html), [JSON](final/home-mobile-3.json)
- home-desktop-1: [HTML](final/home-desktop-1.html), [JSON](final/home-desktop-1.json)
- home-desktop-2: [HTML](final/home-desktop-2.html), [JSON](final/home-desktop-2.json)
- home-desktop-3: [HTML](final/home-desktop-3.html), [JSON](final/home-desktop-3.json)
- detail-mobile-1: [HTML](final/detail-mobile-1.html), [JSON](final/detail-mobile-1.json)
- detail-mobile-2: [HTML](final/detail-mobile-2.html), [JSON](final/detail-mobile-2.json)
- detail-mobile-3: [HTML](final/detail-mobile-3.html), [JSON](final/detail-mobile-3.json)
- detail-desktop-1: [HTML](final/detail-desktop-1.html), [JSON](final/detail-desktop-1.json)
- detail-desktop-2: [HTML](final/detail-desktop-2.html), [JSON](final/detail-desktop-2.json)
- detail-desktop-3: [HTML](final/detail-desktop-3.html), [JSON](final/detail-desktop-3.json)

As pastas before e optimized contêm medições exploratórias de uma execução por combinação e não entram nas medianas finais. Limites e justificativas estão em [AUDITORIA.md](../../docs/AUDITORIA.md). Os perfis e throttling são os padrões simulados do Lighthouse; cada medição usa Chromium novo/cache frio e MSW success/120 ms. Não há simplificação de recursos para a auditoria.
