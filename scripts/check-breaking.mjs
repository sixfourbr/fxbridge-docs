#!/usr/bin/env node
// Bloqueia breaking changes (impacto "major") em contratos já publicados.
// Compara cada bundle openapi/**/*.json com a versão da branch base (BASE_REF,
// padrão origin/main). Bundles novos (API ou versão nova) não são comparados.
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE_REF = process.env.BASE_REF ?? 'origin/main';
const ROOT = 'openapi';
const REDOCLY = join('node_modules', '.bin', 'redocly');
const FORMAT = process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : 'stylish';

const listJsonFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listJsonFiles(path);
    return path.endsWith('.json') ? [path] : [];
  });

const existsInBase = (path) => {
  try {
    execFileSync('git', ['cat-file', '-e', `${BASE_REF}:${path}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const hasBreakingChanges = (path) => {
  const result = spawnSync(
    REDOCLY,
    ['diff', `${BASE_REF}:${path}`, path, '--fail-on=major', `--format=${FORMAT}`],
    { stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  return result.status !== 0;
};

const bundles = listJsonFiles(ROOT);
const compared = bundles.filter(existsInBase);
const broken = compared.filter(hasBreakingChanges);

if (broken.length > 0) {
  console.error(`✖ Breaking change em ${broken.length} contrato(s) publicado(s):`);
  broken.forEach((path) => console.error(`  - ${path}`));
  console.error('Crie uma nova versão (/v<N+1>) ou, se aprovado, aplique o label "breaking-approved".');
  process.exit(1);
}

console.log(`✔ Sem breaking changes (${compared.length} comparado(s) com ${BASE_REF}, ${bundles.length - compared.length} novo(s)).`);
