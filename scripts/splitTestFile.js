'use strict';
const {spawn} = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * This script will run test on changed projects.
 */
(async () => {
    try {
        const {stdout, stderr}  = await exec('yarn workspaces list --json');
        const workspacesArray = stdout.split('\n');
        workspacesArray.shift();
        workspacesArray.pop();
        let workspaceFilter;
        workspacesArray.forEach((workspace) => {
            workspace = JSON.parse(workspace);
            workspaceFilter.push(workspace.location);
        });
        return workspaceFilter;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
