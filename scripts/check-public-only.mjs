#!/usr/bin/env node
// O portal é público e o Mintlify serve todo JSON/YAML do repositório.
// Bloqueia contratos com cara de restritos: nome contendo internal/private/interno/privado
// ou operações/schemas marcados com x-internal.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['contracts', 'openapi'];
// Palavra isolada por separadores de caminho (evita falso positivo em "InternalServerError").
const RESTRICTED_NAME = /(^|[/._-])(internal|private|interno|privado)([/._-]|$)/i;
const RESTRICTED_FLAG = /["']?x-internal["']?: ?true/;

const listFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });

const files = ROOTS.flatMap((root) => {
  try {
    return listFiles(root);
  } catch {
    return [];
  }
});

const problems = [
  ...files.filter((path) => RESTRICTED_NAME.test(path)).map((path) => `${path}: nome indica conteúdo restrito`),
  ...files
    .filter((path) => /\.(ya?ml|json)$/.test(path))
    .filter((path) => RESTRICTED_FLAG.test(readFileSync(path, 'utf8')))
    .map((path) => `${path}: contém x-internal: true`),
];

if (problems.length > 0) {
  console.error('✖ Conteúdo possivelmente restrito em repositório público:');
  problems.forEach((problem) => console.error(`  - ${problem}`));
  process.exit(1);
}

console.log(`✔ Apenas conteúdo público (${files.length} arquivo(s) verificados).`);
