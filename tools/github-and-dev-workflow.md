# GitHub and Development Workflow Tools

Purpose: manage repositories, pull requests, issues, branches, CI, and public template publishing.

## Tools and credits

### GitHub CLI

- Source/credit: GitHub, `cli/cli`
- Website: https://cli.github.com/
- Manual: https://cli.github.com/manual/
- Repository: https://github.com/cli/cli
- License: MIT, per repository metadata
- Purpose: command-line access to GitHub repositories, issues, pull requests, releases, Actions, and repo settings.

### git

- Source/credit: Git project
- Website: https://git-scm.com/
- Purpose: distributed version control.

### zx

- Source/credit: Google, `google/zx`
- Repository: https://github.com/google/zx
- Documentation: https://google.github.io/zx/
- License: Apache-2.0, per repository metadata
- Purpose: write shell-oriented scripts in JavaScript with safer argument handling.

## Public-safe usage policy

Never commit credentials, token-bearing remotes, private issue exports, private PR diffs, or local GitHub auth files.

For public starter repos, enable hygiene CI and keep docs placeholder-only.

## Safe smoke tests

```bash
gh --version
git --version
```

Do not print tokens or auth files.
