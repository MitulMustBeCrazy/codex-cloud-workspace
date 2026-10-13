# Codex Cloud Workspace

A shared workspace for unpublished builds created with Codex Cloud.

## Structure

Each separate build belongs in its own directory:

```text
builds/
  YYYY-MM-DD-build-name/
    README.md
    src/
    assets/
    docs/
```

A build may use a different internal layout when its framework requires one, but its files must remain inside that build's directory.

## Starting a build

1. Create `builds/YYYY-MM-DD-short-name/`.
2. Copy the guidance from `builds/_template/README.md`.
3. Keep all source, assets, configuration, tests, and documentation for the build in that directory.
4. Record setup, run, test, and status notes in the build's `README.md`.
5. Do not deploy or publish a build unless explicitly requested.

Do not commit passwords, API keys, tokens, personal data, or production secrets.
