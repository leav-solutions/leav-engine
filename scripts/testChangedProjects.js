'use strict';
const {spawn} = require('child_process');
const getChangedProjects = require('./helpers/getChangedProjects');

/**
 * This script will run test on changed projects.
 */
(async () => {
    const mustIncludeStagedFiles = process.argv[2] === '--staged';
    const mustIncludeAllProjects = process.argv[2] === '--all';
    try {
        const changedPackages = mustIncludeAllProjects
            ? []
            : await getChangedProjects({
                  mustIncludeStagedFiles,
                  mustIncludeRoot: false,
                  mustReturnPackageName: true
              });

        if (!changedPackages.length && !mustIncludeAllProjects) {
            process.exit(0);
        }

        const includeCmd = [];
        for (const changedPackage of changedPackages) {
            includeCmd.push('--include');
            includeCmd.push(changedPackage);
        }

        // Run tests
        const testRunProcess = spawn(
            'yarn',
            ['workspaces', 'foreach', '-v', ...includeCmd, '--exclude', 'leav-monorepo', 'run', 'test', '--debug', '--maxWorkers=2'],
            {
                stdio: 'inherit'
            }
        );

        testRunProcess.on('exit', code => {
            process.exit(code);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
