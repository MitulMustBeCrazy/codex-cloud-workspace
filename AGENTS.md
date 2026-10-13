# Codex instructions

These instructions apply to the entire repository.

## Build isolation

- Treat each distinct product, prototype, experiment, site, app, or deliverable as a separate build.
- Create each build under `builds/YYYY-MM-DD-short-descriptive-name/`.
- If that name already exists, append `-2`, `-3`, and so on.
- Keep every file for a build inside its build directory, including source code, assets, configuration, tests, generated outputs, and documentation.
- Do not modify another build unless the user explicitly asks.
- Do not place build-specific files in the repository root.

## Documentation and verification

- Every build must include a `README.md` with its purpose, status, setup, run, test, and build instructions.
- Verify the build in proportion to its scope and record any unresolved limitation in its README.
- Prefer reproducible commands and lockfiles.
- Never commit secrets or credentials.

## Publication

- Treat all work here as unpublished by default.
- Do not deploy, publish, open a public preview, or make a release unless the user explicitly asks.
