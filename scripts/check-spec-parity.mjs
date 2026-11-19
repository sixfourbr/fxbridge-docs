#!/usr/bin/env node
// Garante que os contratos pt-BR e en de cada API/versão têm a MESMA estrutura.
// Compara os bundles em openapi/<api>/<versao>/{pt-BR,en}.json depois de remover
// os campos de texto traduzíveis. Sai com código 1 se houver divergência.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'openapi';
const LANGUAGES = ['pt-BR', 'en'];
const TEXT_KEYS = new Set(['summary', 'description', 'title', 'example', 'examples']);
// Mapas cujas chaves são nomes definidos pelo autor (não campos de texto).
const NAME_MAPS = new Set(['properties', 'patternProperties']);

const stripText = (node, parentKey) => {
  if (Array.isArray(node)) return node.map((item) => stripText(item, null));
  if (node === null || typeof node !== 'object') return node;
  const keepAllKeys = NAME_MAPS.has(parentKey);
  return Object.fromEntries(
    Object.entries(node)
      .filter(([key]) => keepAllKeys || !TEXT_KEYS.has(key))
      .map(([key, value]) => [key, stripText(value, key)]),
  );
};

const findDifferences = (left, right, path = '#') => {
  if (typeof left !== typeof right || Array.isArray(left) !== Array.isArray(right)) {
    return [`${path}: tipos diferentes`];
  }
  if (left === null || typeof left !== 'object') {
    return left === right ? [] : [`${path}: ${JSON.stringify(left)} ≠ ${JSON.stringify(right)}`];
  }
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].flatMap((key) => {
    const childPath = `${path}/${key}`;
    if (!(key in left)) return [`${childPath}: existe apenas em ${LANGUAGES[1]}`];
    if (!(key in right)) return [`${childPath}: existe apenas em ${LANGUAGES[0]}`];
    return findDifferences(left[key], right[key], childPath);
  });
};

const listVersionDirs = () =>
  existsSync(ROOT)
    ? readdirSync(ROOT)
        .map((api) => join(ROOT, api))
        .filter((dir) => statSync(dir).isDirectory())
        .flatMap((apiDir) =>
          readdirSync(apiDir)
            .map((version) => join(apiDir, version))
            .filter((dir) => statSync(dir).isDirectory()),
        )
    : [];

const checkVersionDir = (dir) => {
  const files = LANGUAGES.map((lang) => join(dir, `${lang}.json`));
  const missing = files.filter((file) => !existsSync(file));
  if (missing.length > 0) return missing.map((file) => `${file}: arquivo ausente`);
  const [left, right] = files.map((file) => stripText(JSON.parse(readFileSync(file, 'utf8')), null));
  return findDifferences(left, right).map((diff) => `${dir} ${diff}`);
};

const versionDirs = listVersionDirs();
const problems = versionDirs.flatMap(checkVersionDir);

if (problems.length > 0) {
  console.error(`✖ Paridade de contratos falhou (${problems.length} divergência(s)):`);
  problems.forEach((problem) => console.error(`  - ${problem}`));
  process.exit(1);
}

console.log(`✔ Paridade de contratos ok (${versionDirs.length} API/versão verificada(s)).`);
