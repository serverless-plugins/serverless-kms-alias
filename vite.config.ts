import { oxlintConfig } from 'eslint-config-decent/oxlint';
import { type UserConfig } from 'vite';
import { defineConfig } from 'vite-plus';

type LintConfig = ReturnType<typeof oxlintConfig>;
type LintRules = NonNullable<LintConfig['rules']>;

const baseLintConfig: LintConfig = oxlintConfig({ enableReact: false, enableTestingLibrary: false, enableVitest: false });

// These compat plugins import @typescript-eslint/typescript-estree, which cannot
// load alongside typescript 7 (it supports typescript <6.1 only). Drop them and
// their rules (member-ordering, explicit-member-accessibility) until
// typescript-eslint supports typescript 7.
const estreeDependentPlugins = new Set(['@typescript-eslint/eslint-plugin']);
const estreeDependentRulePrefixes = ['typescript-compat/'];

function withoutEstreeDependentRules(rules: LintRules | undefined): LintRules {
  return Object.fromEntries(Object.entries(rules ?? {}).filter(([ruleName]) => !estreeDependentRulePrefixes.some((prefix) => ruleName.startsWith(prefix))));
}

const config: UserConfig = defineConfig({
  fmt: {
    printWidth: 200,
    singleQuote: true,
  },
  lint: {
    ...baseLintConfig,
    jsPlugins: (baseLintConfig.jsPlugins ?? []).filter((plugin) => !estreeDependentPlugins.has(typeof plugin === 'string' ? plugin : plugin.specifier)),
    rules: withoutEstreeDependentRules(baseLintConfig.rules),
    overrides: [
      ...(baseLintConfig.overrides ?? [])
        .map((override) => ({
          ...override,
          rules: withoutEstreeDependentRules(override.rules),
        }))
        .filter((override) => Object.keys(override.rules).length > 0 || override.jsPlugins),
      {
        // Plain JavaScript config files have no type annotations, so the
        // type-aware unsafe-* rules only produce noise for untyped imports.
        files: ['**/*.mjs', '**/*.cjs'],
        rules: {
          'typescript/no-unsafe-argument': 'off',
          'typescript/no-unsafe-assignment': 'off',
          'typescript/no-unsafe-call': 'off',
          'typescript/no-unsafe-member-access': 'off',
          'typescript/no-unsafe-return': 'off',
        },
      },
    ],
  },
  pack: {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: { oxc: true },
    publint: true,
    // Match the historical unbuild output layout referenced by package.json
    // (index.mjs + index.d.ts for ESM, index.cjs + index.d.cts for CJS).
    outExtensions: ({ format }) => (format === 'es' ? { js: '.mjs', dts: '.d.ts' } : { js: '.cjs', dts: '.d.cts' }),
  },
  staged: {
    '*.md': ['vp fmt', 'markdownlint --config=.github/linters/.markdown-lint.yml --fix'],
    '*.{cjs,mjs,ts}': ['vp fmt', 'vp lint --fix'],
    '*.{json,json5,yml,yaml}': ['vp fmt --no-error-on-unmatched-pattern'],
  },
});

export default config;
