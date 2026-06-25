---
name: generate-pr-description
description: Use this skill when the user wants to generate a PR or MR description, or uses "/generate-pr-description". Analyzes all commits on the current branch vs the base branch and generates a concise description in French.
allowed-tools: Bash(git log:*), Bash(git diff:*), Bash(git branch:*), Bash(git merge-base:*), mcp__claude_ai_Atlassian__getJiraIssue
argument-hint: [optional base branch, default: develop]
---

## Context

- Current branch: !`git branch --show-current`
- Base branch commits comparison: !`git log --oneline develop...HEAD 2>/dev/null || git log --oneline main...HEAD 2>/dev/null`

## Your task

### Step 1 — Guard: refuse on protected branches

If the current branch is `develop`, `main`, or `master`, stop immediately and tell the user:

> "Ce skill ne peut pas s'exécuter sur `develop`/`main` — l'historique serait trop volumineux."

### Step 2 — Gather context

Determine the base branch (default: `develop`, fallback: `main`). Then read the full diff of the branch:

```bash
git diff $(git merge-base HEAD develop 2>/dev/null || git merge-base HEAD main) HEAD
```

### Step 3 — Detect a Jira ticket

Look for a Jira ticket reference in:

1. The branch name (e.g. `feat/leavc-934-...` → `LEAVC-934`)
2. The commit messages (`git log --oneline develop...HEAD`)

If a ticket is found, fetch it via MCP Atlassian (`getJiraIssue`) to read its title and description. **Do not rewrite this content** — use it as base context and complement it with what the diff reveals (implementation details, scope clarifications, edge cases handled).

If no ticket is found, infer 2-3 possible context summaries from the diff and branch name, then ask the user to pick one or adjust:

> "Je n'ai pas trouvé de ticket Jira. Voici quelques propositions de contexte — choisis ou ajuste :
>
> 1. …
> 2. …
> 3. …"

### Step 4 — Generate the MR description in French

Write a **concise description in French** structured as follows, respecting the per-section quotas.

**Format:** Always output the description inside a fenced markdown code block (` ```markdown `) so the user can copy-paste it directly into GitLab.

````
```markdown
## Contexte
<2 phrases max. Si ticket Jira : compléter, ne pas réécrire. Sinon : s'appuyer sur l'option validée à l'étape 3.>

## Ce qui a changé
- <bullet 1 — haut niveau>
- <bullet 2 — haut niveau>
- <bullet 3 — haut niveau (optionnel)>

## Impact
<2-3 phrases. Mentionner explicitement les consommateurs affectés si pertinent :
- `@leav/ui` → AMP et xStream
- `app-studio` → instances (explorer-studio, campaigns_manager…)
- `apps/core` → API GraphQL, plugins
- Autres packages internes>

## Test fonctionnel
[Préconditions si nécessaire :]
- <précondition 1>
- …

Étapes :
1. <action concrète>
2. <action concrète>
3. <résultat attendu à vérifier>
```
````

**Rules:**

- French only, neutral tone
- No filler words, no padding
- Focus on the WHY, not just the WHAT
- If there are `console.log`, TODOs, or obviously temporary code, flag it explicitly at the end of the description
- Keep it readable by a reviewer who hasn't seen the code
- Always wrap the output in a fenced ` ```markdown ` block
- Respect per-section quotas (2 phrases Contexte, 3 bullets Ce qui a changé, 2-3 phrases Impact)
- Omit the "Préconditions" block in Test fonctionnel if there are none
