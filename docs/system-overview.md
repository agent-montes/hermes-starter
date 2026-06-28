# System Overview

This starter describes a public-safe Hermes workspace pattern. It is a reconstruction guide, not a copy of a live runtime.

## Council decision

The recommended Git structure is documentation-heavy and state-light:

- document the purpose and boundaries of each folder;
- include empty or placeholder-only folder shells where helpful;
- keep secret inventories as blank templates outside the secrets folder;
- keep recovery as process documentation, not backup material;
- require hygiene checks before every commit and push.

## Folder roles

```text
Hermes Wiki/        durable Obsidian-style knowledge base
Hermes Operations/  operating manual, runbooks, command center, tool provenance
Hermes Secrets/     credentials only; blank in Git
Hermes Recovery/    backup and restore process; no archives in Git
Hermes Starter/     this clean public-safe template
```

These folders should remain siblings. Do not merge secrets into Operations, Recovery into Wiki, or live runtime state into Starter.

## How the parts work together

1. Hermes Starter is used once to create a clean workspace.
2. Hermes Operations explains how the workspace is run day to day.
3. Hermes Wiki stores durable, cited knowledge that should outlive a single chat.
4. Hermes Secrets stores credentials and authentication material outside Git.
5. Hermes Recovery stores private backup and restore artifacts outside Git.
6. Automated jobs may read public-safe instructions and write reports, but they must not publish secrets, sessions, channel routes, or recovery archives.

## Public-safe specificity

This repository may describe:

- folder structure;
- governance rules;
- model/provider policy placeholders;
- tool lanes and approval gates;
- blank secret inventory headings;
- backup and restore procedures;
- hygiene checks;
- agent responsibilities.

This repository must not include:

- real environment files;
- authentication JSON;
- OAuth tokens;
- API keys;
- passwords;
- recovery codes;
- phone numbers;
- private chat or channel IDs;
- session databases;
- gateway routing state;
- live memories;
- request dumps;
- recovery archives;
- private Wiki pages.
