#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Regenerates the `dependencies` field of `@leav/core-publish`'s package.json from the
 * runtime dependencies of `apps/core` and its transitive internal workspaces.
 *
 * `@leav/core-publish` is published to the public npm registry and consumed by external
 * core-plugin repos (see libs/core-publish/CLAUDE.md). Its `dependencies` must therefore
 * reflect everything the bundled code needs at runtime on the consumer side.
 *
 * Source of truth: the `workspaceDependencies` declared by Yarn, retrieved via
 * `yarn workspaces list --json --verbose`. No hardcoded list — adding a lib consumed
 * (directly or transitively) by `apps/core` is automatic.
 *
 * Triggered by `yarn sync-deps`, and indirectly by `yarn generate` during the CI
 * publish build.
 */

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const root = path.resolve(__dirname, '../../..');
const ENTRY = 'apps/core';

const workspacesRaw = execSync('yarn workspaces list --json --verbose', {cwd: root, encoding: 'utf8'});
const workspaces = new Map(
    workspacesRaw
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line))
        .map(ws => [ws.location, ws]),
);

if (!workspaces.has(ENTRY)) {
    console.error(`Could not find workspace "${ENTRY}" in yarn workspaces output`);
    process.exit(1);
}

// DFS from apps/core through workspaceDependencies. Order matters: apps/core first,
// then its deps in declaration order. Internal @leav/* packages are resolved via TS
// path aliases at compile time and must not appear as runtime dependencies, so the
// names of all visited workspaces form the exclusion set.
const visited = [];
const seen = new Set();
const walk = location => {
    if (seen.has(location)) {
        return;
    }
    seen.add(location);
    const ws = workspaces.get(location);
    if (!ws) {
        return;
    }
    visited.push(ws);
    for (const dep of ws.workspaceDependencies) {
        walk(dep);
    }
};
walk(ENTRY);

const exclude = new Set(visited.map(ws => ws.name));

const merged = {};
for (const ws of visited) {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, ws.location, 'package.json'), 'utf8'));
    for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
        if (exclude.has(name)) {
            continue;
        }
        if (!(name in merged)) {
            merged[name] = version;
        }
    }
}

const targetPath = path.join(__dirname, '..', 'package.json');
const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
target.dependencies = merged;
fs.writeFileSync(targetPath, JSON.stringify(target, null, 4) + '\n');
console.log(`Synced ${Object.keys(merged).length} dependencies into libs/core-publish/package.json`);
