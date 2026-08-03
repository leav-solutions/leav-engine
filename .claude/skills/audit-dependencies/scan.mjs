#!/usr/bin/env node
/*
 * Dependency auditor for the LEAV monorepo — zero runtime dependency, Node built-ins only.
 *
 * Cross-references what each workspace *declares* in its package.json with what it actually
 * *references* in its sources, and reports three categories (see printReport).
 *
 * This is a REPORTING tool, never a gate: it always exits 0 and writes nothing. Every finding
 * must be triaged by hand against the checklist in SKILL.md — a package can be load-bearing
 * without ever appearing in an `import` (plugin name passed as a string, tsconfig `types`,
 * NODE_OPTIONS preload, peerDependency satisfaction…).
 *
 * Usage:
 *   node .claude/skills/audit-dependencies/scan.mjs apps/core libs/ui
 *   node .claude/skills/audit-dependencies/scan.mjs --all
 */
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, relative, sep} from 'node:path';

const SKIP_DIRS = new Set([
    'node_modules',
    'dist',
    'dist-spec',
    'dist-publish',
    'build',
    'coverage',
    '.turbo',
    '.git',
    // Prebuilt front bundles that some apps keep checked out; they are minified output, not sources.
    'applications',
    // Plugins are separate packages with their own package.json (git sparse-checkout).
    'plugins',
]);
const SCANNED_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|less|scss|html)$/;
const PKG_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * Every way this repo references a package. The bare-import form matters more than it looks:
 * `import 'fomantic-ui-less/semantic.less'` has no `from`, so a naive `from '…'` regex misses it
 * and reports the package as unused.
 */
const REFERENCE_PATTERNS = [
    /(?:from|require\(|import\(|vi\.mock\(|jest\.mock\()\s*['"]([^'"\n]{1,120})['"]/g,
    /(?:^|[;{}\n])\s*import\s+['"]([^'"\n]{1,120})['"]/gm,
    /@import\s+(?:\([\w\s,]+\)\s*)?['"]~?([^'"\n]{1,120})['"]/g,
];

/** Tolerant JSON: tsconfigs may carry comments and trailing commas. */
const parseJsonc = raw => {
    const stripped = raw
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(stripped);
};

/**
 * Drop comments so vestigial imports in commented-out code are not mistaken for real ones.
 * `apps/admin` carries ~109 fully commented-out test files; without this, they surface `enzyme`,
 * `react-router-dom-v5` and `react-sortable-tree` as missing dependencies.
 *
 * Heuristic on purpose: a block-comment marker inside a string literal can over-strip. Prefer a
 * false "unused" (caught during manual triage) over a false "missing".
 */
const stripComments = src =>
    src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter(line => !/^\s*\/\//.test(line))
        .join('\n');

/** `@scope/pkg/sub/path` -> `@scope/pkg` ; `pkg/sub` -> `pkg` */
const toPackageName = specifier => {
    const s = specifier.replace(/^node:/, '').replace(/^~/, '');
    return s.startsWith('@') ? s.split('/').slice(0, 2).join('/') : s.split('/')[0];
};

const isRelative = s => s.startsWith('.') || s.startsWith('/') || s.startsWith('data:') || s.startsWith('http');

/**
 * Build the "is this file dev-only?" predicate, splitting runtime code from test/tooling code.
 *
 * For a published lib the distinction is what makes findings actionable: something imported by
 * runtime code but declared only in devDependencies is missing for npm consumers. Note the label
 * describes the *file*, not the package — a private app has runtime files too, nothing "published".
 * We derive the boundary from tsconfig.build.json `exclude` when present (libs/ui excludes `**\/*.test.*` and
 * `**\/_tests`), and fall back to the usual test/dev conventions otherwise.
 */
const makeIsDevFile = pkgDir => {
    const tsconfigPath = join(pkgDir, 'tsconfig.build.json');
    let excluded = [];
    if (existsSync(tsconfigPath)) {
        try {
            excluded = parseJsonc(readFileSync(tsconfigPath, 'utf8')).exclude ?? [];
        } catch {
            excluded = [];
        }
    }
    const excludeRegexes = excluded.map(
        glob =>
            new RegExp(
                '^' +
                    glob
                        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
                        .replace(/\*\*\//g, '(?:.*/)?')
                        .replace(/\*/g, '[^/]*') +
                    '$',
            ),
    );
    const CONVENTIONAL_DEV = [
        // `tests` covers apps/app-studio, whose vitest setupFiles lives in tests/setupTests.ts.
        /(^|\/)(__tests__|__mocks__|_tests|tests|benchmarks)(\/|$)/,
        /\.(test|spec|stories)\.[tj]sx?$/,
        /^scripts\//,
        // Root-level tooling config: vite.config.js, vitest.unit.config.ts, codegen.ts, tsconfig…
        /^[^/]*\.config\.[tj]s$/,
        /^(codegen|tsconfig)/,
    ];
    return relPath => {
        const posix = relPath.split(sep).join('/');
        return excludeRegexes.some(re => re.test(posix)) || CONVENTIONAL_DEV.some(re => re.test(posix));
    };
};

const collectReferences = pkgDir => {
    const isDevFile = makeIsDevFile(pkgDir);
    /** @type {Map<string, {runtime: Set<string>, dev: Set<string>}>} */
    const refs = new Map();

    const record = (name, relPath) => {
        if (!refs.has(name)) {
            refs.set(name, {runtime: new Set(), dev: new Set()});
        }
        const bucket = refs.get(name)[isDevFile(relPath) ? 'dev' : 'runtime'];
        if (bucket.size < 3) {
            bucket.add(relPath);
        }
    };

    const scanFile = (absPath, relPath) => {
        const src = stripComments(readFileSync(absPath, 'utf8'));
        for (const pattern of REFERENCE_PATTERNS) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(src)) !== null) {
                if (isRelative(match[1])) {
                    continue;
                }
                const name = toPackageName(match[1]);
                if (PKG_NAME.test(name) && !isBuiltin(name)) {
                    record(name, relPath);
                }
            }
        }
    };

    const walk = dir => {
        if (!existsSync(dir)) {
            return;
        }
        for (const entry of readdirSync(dir, {withFileTypes: true})) {
            const abs = join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!SKIP_DIRS.has(entry.name)) {
                    walk(abs);
                }
            } else if (SCANNED_EXT.test(entry.name)) {
                scanFile(abs, relative(pkgDir, abs));
            }
        }
    };

    for (const sub of ['src', 'scripts', 'config', 'tests', 'public']) {
        walk(join(pkgDir, sub));
    }
    // Root-level config files (codegen.ts, vite.config.js, vitest.config.ts, index.html…)
    for (const entry of readdirSync(pkgDir, {withFileTypes: true})) {
        if (entry.isFile() && SCANNED_EXT.test(entry.name)) {
            scanFile(join(pkgDir, entry.name), entry.name);
        }
    }
    return refs;
};

const BUILTINS = new Set((await import('node:module')).builtinModules.flatMap(m => [m, `node:${m}`]));
function isBuiltin(name) {
    return BUILTINS.has(name);
}

const auditPackage = pkgDir => {
    const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
    const deps = Object.keys(pkg.dependencies ?? {});
    const peers = Object.keys(pkg.peerDependencies ?? {});
    const devs = Object.keys(pkg.devDependencies ?? {});
    const declared = new Set([...deps, ...peers, ...devs]);
    const blockOf = name =>
        [deps.includes(name) && 'dep', peers.includes(name) && 'peer', devs.includes(name) && 'dev']
            .filter(Boolean)
            .join('+') || 'none';

    const refs = collectReferences(pkgDir);
    /** A declared `@types/x` is considered used when `x` itself is referenced. */
    const isReferenced = name => refs.has(name) || refs.has(name.replace(/^@types\//, ''));

    /*
     * "Published" means shipped to npm, which is what makes category C actionable. Most apps in
     * this repo omit `private`, so that flag alone is not enough: require a publishing signal
     * (`files`, `publishConfig` or a `publish` script) — that is what the libs/* carry.
     */
    const isPublished = pkg.private !== true && Boolean(pkg.files ?? pkg.publishConfig ?? pkg.scripts?.publish);

    return {
        name: pkg.name ?? pkgDir,
        isPublished,
        unused: {
            dependencies: deps.filter(d => !isReferenced(d)),
            peerDependencies: peers.filter(d => !isReferenced(d)),
            devDependencies: devs.filter(d => !isReferenced(d)),
        },
        undeclared: [...refs.entries()]
            .filter(([name]) => !declared.has(name))
            .map(([name, hits]) => ({
                name,
                scope: hits.runtime.size ? 'runtime' : 'dev',
                files: [...hits.runtime, ...hits.dev].slice(0, 3),
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        devOnlyButPublished: [...refs.entries()]
            .filter(
                ([name, hits]) =>
                    hits.runtime.size && devs.includes(name) && !deps.includes(name) && !peers.includes(name),
            )
            .map(([name, hits]) => ({name, files: [...hits.runtime]}))
            .sort((a, b) => a.name.localeCompare(b.name)),
        blockOf,
    };
};

const printReport = (pkgDir, report) => {
    console.log(`\n${'='.repeat(78)}\n${report.name}  (${pkgDir})\n${'='.repeat(78)}`);

    console.log('\nA. Declared but never referenced — candidates for removal');
    let anyUnused = false;
    for (const [block, list] of Object.entries(report.unused)) {
        if (list.length) {
            anyUnused = true;
            console.log(`   ${block}: ${list.join(', ')}`);
        }
    }
    if (!anyUnused) {
        console.log('   (none)');
    }
    console.log('   -> before removing, walk the "invisible usage" checklist in SKILL.md');

    console.log('\nB. Referenced but declared nowhere — phantom dependencies (resolved by hoisting)');
    if (!report.undeclared.length) {
        console.log('   (none)');
    }
    for (const {name, scope, files} of report.undeclared) {
        console.log(`   ${name.padEnd(36)} [${scope}] ${files.join(', ')}`);
    }

    if (report.isPublished) {
        console.log('\nC. Imported by runtime code but declared only in devDependencies');
        console.log('   (this package is published: such a dependency is missing for npm consumers)');
        if (!report.devOnlyButPublished.length) {
            console.log('   (none)');
        }
        for (const {name, files} of report.devOnlyButPublished) {
            console.log(`   ${name.padEnd(36)} ${files.join(', ')}`);
        }
    }
};

const discoverWorkspaces = () =>
    ['apps', 'libs', 'test-apps'].filter(existsSync).flatMap(root =>
        readdirSync(root, {withFileTypes: true})
            .filter(e => e.isDirectory() && existsSync(join(root, e.name, 'package.json')))
            .map(e => join(root, e.name)),
    );

const args = process.argv.slice(2);
const targets = args.includes('--all') ? discoverWorkspaces() : args;

if (!targets.length) {
    console.error(
        'usage: node .claude/skills/audit-dependencies/scan.mjs <workspace-path>... | --all\n' +
            '   ex: node .claude/skills/audit-dependencies/scan.mjs apps/core libs/ui',
    );
    process.exit(2);
}

for (const target of targets) {
    if (!existsSync(join(target, 'package.json'))) {
        console.error(`\n!! ${target}: no package.json, skipped`);
        continue;
    }
    printReport(target, auditPackage(target));
}

console.log('\nReport only — nothing was modified. Triage every finding against SKILL.md.');
