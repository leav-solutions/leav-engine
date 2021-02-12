'use strict';
const util = require('util');
const {spawn} = require('child_process');
const exec = util.promisify(require('child_process').exec);

const packagesFolders = ['apps', 'libs'];

// This script will run test on changed projects.
(async () => {
    const rootPath = `${__dirname}/../`;
    const isStagedFiles = process.argv[2] === '--staged';
    try {
        // Get changed files
        let gitCmd = 'git diff --diff-filter=ACMR --name-only';
        if (isStagedFiles) {
            gitCmd += ' --staged';
        }

        const {stdout, stderr} = await exec(gitCmd);

        if (stderr) {
            throw new Error(stderr);
        }

        // Extract project name from each changed files
        const changedPackages = new Set();
        for (const filepath of stdout.split('\n')) {
            if (!filepath || !filepath.match(`^(${packagesFolders.join('|')})`)) {
                continue;
            }

            const [rootFolder, projectFolder] = filepath.split('/');

            const packageJson = require(`${rootPath}/${rootFolder}/${projectFolder}/package.json`);
            const packageName = packageJson.name;

            changedPackages.add(packageName);
        }

        const includeCmd = [];
        for (const changedPackage of changedPackages) {
            includeCmd.push('--include');
            includeCmd.push(changedPackage);
        }

        // Run tests
        const testRunProcess = spawn('yarn', ['workspaces', 'foreach', '-v', ...includeCmd, 'run', 'test'], {
            stdio: 'inherit'
        });

        testRunProcess.on('exit', code => {
            process.exit(code);
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
