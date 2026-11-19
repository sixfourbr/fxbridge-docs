## O que muda

<!-- Descreva a mudança em uma ou duas frases. -->

## Tipo

- [ ] Conteúdo (guias, quickstart, changelog)
- [ ] Contrato OpenAPI (`contracts/`)
- [ ] Configuração do portal (`docs.json`, tema, navegação)
- [ ] Automação / CI

## Checklist

- [ ] Página pt-BR e página en correspondente (mesmo nome de arquivo em `en/`)
- [ ] Contrato alterado nos dois idiomas e bundle regenerado (`npm run bundle`)
- [ ] Sem breaking change na mesma versão `/vN` (ou label `breaking-approved` com justificativa)
- [ ] Entrada no `changelog.mdx` quando a mudança afeta consumidores da API
- [ ] Nenhum segredo, credencial, dado real ou contrato restrito/interno
- [ ] `npm run check` executado localmente
