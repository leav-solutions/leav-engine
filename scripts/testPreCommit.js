'use strict';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {spawn} = require('child_process');

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
        const listFileChanged = stdout.split('\n');
        const index = 0;
        //run tests related to change
        runCommand(listFileChanged,index);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();

const runCommand = (listFilePath,index) => {
    const filePath = listFilePath[index];
    const rootPath = `${__dirname}/..`;
    const extensionList = ['ts','js','tsx','jsx'];

    const [rootFolder, projectFolder] = filePath.split('/');
    const [fileName, ...fileExtension] = filePath.split('.');
    let checkRelatedFiles = false;

    for(const extension of extensionList){
        if(fileExtension.includes(extension)){
            checkRelatedFiles = true;
            break;
        }
    }

    if(rootFolder && projectFolder && checkRelatedFiles){
        const packageJson = require(`${rootPath}/${rootFolder}/${projectFolder}/package.json`);
        const projectName = packageJson.name;
        const workspaceName = rootFolder + '/' + projectFolder + '/';
        const file = filePath.replace(workspaceName,'');
        const runProcess = spawn(
            'yarn',
            ['workspace', projectName, 'run', 'test:commit', file],
            {
                stdio: 'inherit'
            }
        );
        runProcess.on('exit', code => {
            index = index + 1;
            runCommand(listFilePath,index);
        });
    }
};
