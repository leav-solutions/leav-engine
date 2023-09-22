'use strict';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {spawn} = require('child_process');

/**
 * This script will run test on changed projects.
 */
(async () => {
    try {
        const rootPath = `${__dirname}/..`;
        const packagesFolders = ['apps', 'libs'];
        // Get changed files
        const {stdout, stderr} = await exec('git diff HEAD --name-only');
        if (stderr) {
            process.exit(1);
        }
        const workspacesList = [];
        for(const filePath of stdout.split('\n')){
            const [rootFolder, projectFolder] = filePath.split('/');
            if(rootFolder && projectFolder && packagesFolders.includes(rootFolder)){
                const packageJson = require(`${rootPath}/${rootFolder}/${projectFolder}/package.json`);
                if(!workspacesList.includes(packageJson.name)){
                    workspacesList.push(packageJson.name);
                }
            }
        }
        //run tests related to change
        runRecursiveCommand(workspacesList);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

/**
 * Recursive function to run test from workspace
 *
 * @param {string[]} workspacesList
 */
const runRecursiveCommand = (workspacesList) => {
    if(workspacesList.length > 0){
        const workspace = workspacesList.shift();
        // eslint-disable-next-line no-restricted-syntax
        console.log('\n----------------  RUN TESTS RELATED TO CHANGE ON WORKSPACE ' + workspace.toUpperCase() + '  ----------------\n');
        const runProcess = spawn(
            'yarn',
            ['workspace', workspace, 'run', 'test:commit'],
            {
                stdio: 'inherit'
            }
        );
        runProcess.on('exit', code => {
            if(code === 0){
                runRecursiveCommand(workspacesList);
            } else {
                process.exit(code);
            }
        });
    }
};
