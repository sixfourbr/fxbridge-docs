#!/usr/bin/env node
// Garante o espelhamento pt-BR (raiz) ↔ en (en/) das páginas MDX.
// Erro: página sem correspondente no outro idioma.
// Aviso: página pt-BR alterada depois da en (tradução possivelmente desatualizada).
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const EN_DIR = 'en';
const IGNORED = new Set(['node_modules', 'snippets', EN_DIR]);
const IN_ACTIONS = process.env.GITHUB_ACTIONS === 'true';

const listMdx = (dir, ignored = new Set()) =>
  readdirSync(dir).flatMap((name) => {
    if (name.startsWith('.') || ignored.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listMdx(path);
    return path.endsWith('.mdx') ? [path] : [];
  });

const lastCommit = (path) =>
  execFileSync('git', ['log', '-1', '--format=%H', '--', path], { encoding: 'utf8' }).trim();

const isAncestor = (ancestor, descendant) => {
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Desatualizada: o último commit da pt-BR é posterior (descendente) ao último commit da en.
const isOutdated = (ptPath, enPath) => {
  const [ptCommit, enCommit] = [lastCommit(ptPath), lastCommit(enPath)];
  return ptCommit !== '' && enCommit !== '' && ptCommit !== enCommit && isAncestor(enCommit, ptCommit);
};

const warn = (path, message) =>
  console.log(IN_ACTIONS ? `::warning file=${path}::${message}` : `⚠ ${path}: ${message}`);

const ptPages = listMdx('.', IGNORED);
const enPages = existsSync(EN_DIR) ? listMdx(EN_DIR).map((path) => relative(EN_DIR, path)) : [];

const missingEn = ptPages.filter((page) => !enPages.includes(page)).map((page) => `${join(EN_DIR, page)} (falta tradução de ${page})`);
const orphanEn = enPages.filter((page) => !ptPages.includes(page)).map((page) => `${join(EN_DIR, page)} (sem página pt-BR ${page})`);
const errors = [...missingEn, ...orphanEn];

ptPages
  .filter((page) => enPages.includes(page))
  .filter((page) => isOutdated(page, join(EN_DIR, page)))
  .forEach((page) => warn(join(EN_DIR, page), `pt-BR (${page}) foi alterada depois desta tradução; revise.`));

if (errors.length > 0) {
  console.error(`✖ Espelhamento de idiomas falhou (${errors.length}):`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

console.log(`✔ Espelhamento de idiomas ok (${ptPages.length} página(s) em cada idioma).`);
