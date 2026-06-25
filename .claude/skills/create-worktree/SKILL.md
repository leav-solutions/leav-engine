---
name: create-worktree
description: Work on a different git branch via a temporary git worktree, without touching the current working tree. Triggers when the user wants to keep their current WIP intact while editing/amending/pushing somewhere else — e.g. "travaillons dans un git worktree", "je voudrais revenir sur une branche sans toucher à ma branche actuelle", "applique ça sur la branche X", "let's use a worktree to amend Y". Do NOT trigger for a plain branch switch where the user has no WIP to protect.
---

# Cross-branch worktree fix

Use this skill when the user has work in their current branch (possibly with uncommitted WIP) and asks you to apply, amend, or push a change to a **different** branch.

## Why a worktree, not `git checkout`

`git checkout <other-branch>` either refuses with uncommitted changes or forces the user to stash. A `git worktree add` creates a separate working directory checked out on the target branch, leaving the current working tree completely untouched. Edits made inside the worktree don't propagate to the main checkout.

## Workflow

### 1. Confirm the target branch

If the user didn't name it explicitly, ask. Never guess from context — the cost of pushing to the wrong branch is high.

### 2. Create the worktree

Group worktrees in a `<repo-name>.worktrees/` sibling directory — same parent as the project root, so the CLAUDE.md hierarchy and parent-level tooling are preserved, and the parent directory stays uncluttered:

```bash
# Derive repo name and build the path
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
git worktree add "${REPO_ROOT}/../${REPO_NAME}.worktrees/<short-name>" <target-branch>
```

The `<short-name>` should be derived from the target branch (e.g. `fix-auth` from `fix/auth`). Always resolve the absolute path from `git rev-parse --show-toplevel` to avoid ambiguity.

If the target branch only exists on the remote, fetch first (`git fetch origin <target-branch>`).

### 3. Copy CLAUDE.local.md and install dependencies

**Copy `CLAUDE.local.md`** from the main working tree into the worktree root so personal instructions (API keys, preferences, conventions) are available:

```bash
cp <main-root>/CLAUDE.local.md <worktree-root>/CLAUDE.local.md
```

Skip silently if the file doesn't exist in the main working tree.

**Install dependencies** if a pre-commit hook needs them. Many JS projects have husky hooks that fail with `.husky/_/husky.sh: No such file or directory` if `node_modules` isn't installed in the worktree. Detect the package manager from the lockfile and run the install:

| Lockfile            | Command                     |
| ------------------- | --------------------------- |
| `yarn.lock`         | `yarn install`              |
| `pnpm-lock.yaml`    | `pnpm install`              |
| `package-lock.json` | `npm ci` (or `npm install`) |

For yarn workspaces install is ~30s — warn the user. **Do not skip the hook with `--no-verify`** to bypass this; fix the environment.

If the project isn't JS, skip this step.

### 4. Apply the edits inside the worktree

Three common shapes:

- **Same diff as current branch** — Copy file contents from the main working tree. `git show <ref>:<path>` from inside the worktree is the cleanest way.
- **Cherry-pick** — `git cherry-pick <sha>` if the change already exists as a commit somewhere.
- **Fresh edits** — the user describes the change, apply it with normal Edit/Write tools inside the worktree path.

### 5. Commit on the target branch

Two modes — ask if it's not explicit:

- **Amend the last commit** (when the change "belongs" to the existing top commit of the target branch):
    ```bash
    git commit --amend --no-edit         # keep message
    git commit --amend -m "<new msg>"    # rewrite message
    ```
- **New commit** otherwise:
    ```bash
    git commit -m "<msg>"
    ```

### 6. Push — only when explicitly asked

```bash
git push --force-with-lease origin <target-branch>   # if amended
git push origin <target-branch>                       # if new commit, fast-forward
```

**Hard rules:**

- Never `--force`. Always `--force-with-lease`.
- If the target branch is `main` / `master` / `develop` / `trunk` and the push is destructive, **stop and confirm** even if the user is being terse.
- If the user said "ne push pas" / "review en local" earlier in the conversation, the boundary stays active — commit but don't push.

### 7. Cleanup

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
git worktree remove "${REPO_ROOT}/../${REPO_NAME}.worktrees/<short-name>"
git worktree list                     # confirm the worktree is gone
git status                            # confirm the main working tree is unchanged
```

If `git worktree remove` refuses because of untracked files (e.g., `node_modules` from step 3), that's expected; use `--force` since the worktree is throwaway.

## Invariants

These must hold before, during, and after the operation:

1. The **main working tree's `git status`** must be identical at the end. Diff it if unsure.
2. The **main working tree's `HEAD`** must point to the same commit at the end.
3. No changes from the cross-branch operation should appear in the main working tree's staged or unstaged changes.

## Anti-patterns to refuse

- ❌ `git checkout <other-branch>` while the user has WIP — destroys context
- ❌ `git stash && git checkout ... && ... && git stash pop` — clunky, error-prone, breaks if there are conflicts on pop
- ❌ `--no-verify` to skip hooks — masks real environment problems
- ❌ `git push --force` — use `--force-with-lease`
- ❌ Amending and force-pushing without explicit user permission when the branch is shared

## Reporting back

When done, tell the user concisely:

- which target branch was updated (and the new commit SHA)
- whether you pushed or just committed locally
- confirm the main working tree is intact

Example: _"Push fait sur `refacto/use-antd-es-only` (commit `6836a3dc8`). Worktree nettoyé, branche locale `<current-branch>` inchangée."_
