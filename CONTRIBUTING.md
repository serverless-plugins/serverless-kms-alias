# Contributors

## Check in

- Do check in source (src)
- Do not check in build output (dist)
- Do not check in node_modules

## Development

This project uses [pnpm](https://pnpm.io) and the [Vite+](https://viteplus.dev) toolchain (`vp`) for
formatting, linting, type checking, and library builds. Git hooks are installed automatically by
`vp config` when dependencies are installed, and run `vp staged` before each commit to format and
lint the files you are committing.

```sh
pnpm install                                # installs all devDependencies and sets up git hooks
git add abc.ext                             # Add the files you've changed
git commit -m "Informative commit message"  # Commit. This will run the pre-commit hook
```

During the commit step, the pre-commit hook formats staged files with `vp fmt` (oxfmt) and lints them
with `vp lint` (oxlint + type-aware rules powered by the native TypeScript compiler). Any fixes are
included in your commit automatically.

Useful commands:

```sh
pnpm run build        # bundle the library (ESM + CJS + type declarations) with vp pack
pnpm run lint         # format, lint, and markdownlint everything
pnpm run check:types  # type check with TypeScript (tsc --noEmit)
```
