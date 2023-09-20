'use strict';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {spawn} = require('child_process');
const getSortListOfFiles = require('./helpers/getSortListOfFiles');

/**
 * This script will run test on changed projects.
 */
(async () => {
    try {
        // Get changed files
        const {stdout, stderr} = await exec('git diff --diff-filter=ACMR --name-only --staged');
        if (stderr) {
            process.exit(1);
        }
        const [workspaceList,sortListFilePath] = await getSortListOfFiles(stdout.split('\n'));
        //run tests related to change
        runCommand(sortListFilePath,workspaceList);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

/**
 * Recursive function to run test from workspace
 *
 * @param {object[]} listFilePath
 * @param {string[]} workspaceList
 */
const runCommand = (listFilePath,workspaceList) => {
    if(workspaceList.length > 0){
        const projectName = workspaceList.shift();
        const file =  listFilePath[projectName];
        const runProcess = spawn(
            'yarn',
            ['workspace', projectName, 'run', 'test:commit', file],
            {
                stdio: 'inherit'
            }
        );
        runProcess.on('exit', code => {
            runCommand(listFilePath,workspaceList);
        });
    }
};
