# AGENTS.md — Portal de documentação de APIs FXBridge

Instruções para pessoas e agentes de IA (Claude Code, Copilot, Codex, Cursor, Gemini CLI)
que contribuem neste repositório. Este arquivo é a **fonte única**; o `CLAUDE.md` apenas o importa.

## Visão geral

Portal público de documentação de APIs publicado pelo **Mintlify** (plano Free) em
`docs.fxbridge.com.br`. O repositório Git é a fonte única: todo merge na `main` é publicado
automaticamente pelo GitHub App do Mintlify.

Decisões, arquitetura e plano de implementação estão em [`.specs/`](.specs/) (versionado e
compartilhado com o time). Consulte o plano antes de mudar estrutura, navegação ou padrões.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `docs.json` | Configuração do Mintlify (tema, navegação, idiomas, versões) |
| `contracts/<api>/v<N>/<idioma>/` | **Fonte** dos contratos OpenAPI 3.1 (design-first) |
| `contracts/_shared/` | Componentes comuns (Problem Details RFC 9457, headers) |
| `openapi/<api>/v<N>/<idioma>.yaml` | Bundle gerado (`npm run bundle`) — não editar à mão |
| `*.mdx` na raiz, `guides/`, `apis/` | Conteúdo em **pt-BR** (idioma-fonte) |
| `en/` | Espelho em inglês com **nomes de arquivo idênticos** |
| `snippets/` | Trechos MDX reutilizáveis |

## Regras

- **Idioma-fonte é pt-BR.** Toda página nova em pt-BR exige a página correspondente em `en/`
  com o mesmo caminho e nome de arquivo. Nomes de arquivo e slugs são em inglês.
- **Contratos são design-first.** Edite em `contracts/`, nunca em `openapi/`. Altere os dois
  idiomas no mesmo PR — a estrutura deve ser idêntica; só textos mudam.
- **Breaking change** em uma versão publicada (`/vN`) é proibida: crie `/v(N+1)`.
- **Erros** seguem RFC 9457 (`application/problem+json`) via `$ref` para `contracts/_shared`.
- **Segurança:** o portal é público e o Mintlify serve publicamente **todo** JSON/YAML do
  repositório. Nunca adicione contratos internos/restritos, segredos, tokens ou dados reais.
  Exemplos usam apenas valores fictícios.
- Toda mudança entra por **Pull Request** com checks verdes; não edite pelo editor web do Mintlify.

## Comandos

Requer Node.js `>=20.19 <21` ou `>=22.12 <25` (ver `.nvmrc`).

```bash
npm install
npm run dev        # preview local (http://localhost:3000)
npm run check      # validações do portal (mint validate + broken-links)
npm run a11y       # contraste e texto alternativo
```

## Commits

Conventional Commits em português do Brasil: `tipo(escopo): resumo` no imperativo, até ~72
caracteres. Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`, `build`, `style`,
`perf`. Escopos sugeridos: nome da API (`pingpong`), `portal`, `ci`, `contracts`.
