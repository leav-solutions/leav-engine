---
name: generate-commit-message
description: Use this skill when the user wants to generate a git commit message or uses "/generate-commit-message". Generates a conventional commit message in English based on staged changes only.
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git branch:*)
argument-hint: [optional context]
---

## Context

- Staged diff only: !`git diff --cached`
- Recent commits (for style reference): !`git log --oneline -5`
- Current branch: !`git branch --show-current`

## Your task

### Step 1 — Check staged changes

If `git diff --cached` is empty, tell the user there are no staged changes and stop. Do not proceed.

### Step 2 — Generate the commit message

Analyze the **staged** changes only and generate a **conventional commit** message:

```
<type>(<optional scope>): <short description in English>

[optional body]
```

**Types allowed:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`, `build`, `revert`

**Rules:**

- Subject line: English, imperative mood, lowercase, no period, max 72 chars
- Body: optional — only if the change needs explanation beyond type+scope
- Scope: affected package/module. Common scopes in this repo: `core`, `ui`, `app-studio`,
  `admin`, `automate-scan`, `mcp-runtime`, `views`, `explorer`, `record`, `api`
- **You are not allowed to create a commit, only generate the message.** Output it inside a
  fenced code block so the user can copy-paste it.

**Examples:**

```
feat(record): add getRecordIdentity helper
fix(ui): prevent crash when value is null
refactor(core): extract permission check into standalone function
```
