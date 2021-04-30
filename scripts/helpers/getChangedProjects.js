'use strict';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * Return array of all modified projects
 *
 * @param {} params
 */
module.exports = async ({mustIncludeStagedFiles, mustIncludeRoot, mustReturnPackageName}) => {
    const packagesFolders = ['apps', 'libs'];
    const rootPath = `${__dirname}/../../`;
    const changedPackages = new Set();

    // Get changed files
    let gitCmd = 'git diff --diff-filter=ACMR --name-only';
    if (mustIncludeStagedFiles) {
        gitCmd += ' --staged';
    }

    const {stdout, stderr} = await exec(gitCmd);

    if (stderr) {
        throw new Error(stderr);
    }

    // Extract project name from each changed files
    for (const filepath of stdout.split('\n')) {
        if (!filepath || !filepath.match(`^(${packagesFolders.join('|')})`)) {
            if (mustIncludeRoot) {
                changedPackages.add('root');
            }

            continue;
        }

        const [rootFolder, projectFolder] = filepath.split('/');

        let projectName;
        if (mustReturnPackageName) {
            const packageJson = require(`${rootPath}/${rootFolder}/${projectFolder}/package.json`);
            projectName = packageJson.name;
        } else {
            projectName = projectFolder;
        }

        changedPackages.add(projectName);
    }

    return [...changedPackages];
};
