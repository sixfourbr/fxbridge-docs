# FXBridge — Portal de documentação de APIs

Portal público de documentação das APIs da FXBridge, construído com [Mintlify](https://www.mintlify.com/docs)
e publicado em `docs.fxbridge.com.br`.

## Como contribuir

1. Crie uma branch a partir da `main`.
2. Edite o conteúdo em pt-BR e a página correspondente em `en/` (mesmo nome de arquivo).
3. Para contratos, edite `contracts/` nos dois idiomas e regenere o bundle.
4. Rode as validações localmente e abra um Pull Request.
5. Após aprovação dos donos (CODEOWNERS) e checks verdes, o merge publica automaticamente.

## Rodando localmente

```bash
nvm use            # Node 24 (ver .nvmrc)
npm install
npm run dev        # http://localhost:3000
npm run check
```

Regras completas, estrutura e padrões: [AGENTS.md](AGENTS.md). Decisões de arquitetura: [`.specs/`](.specs/).
