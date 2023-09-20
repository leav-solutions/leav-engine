'use strict';

/**
 * Return array of all modified projects
 *
 * @param {string[]} listOfFiles
 */
module.exports = async (listOfFiles) => {
    const rootPath = `${__dirname}/../..`;
    const extensionList = ['ts','js','tsx','jsx'];
    const rootList = ['apps','libs'];
    const workspaces = [];
    const list = [];
    for(const filePath of listOfFiles){
        const [rootFolder, projectFolder] = filePath.split('/');
        const [fileName, ...fileExtension] = filePath.split('.');
        let checkRelatedFiles = false;

        for(const extension of extensionList){
            if(fileExtension.includes(extension)){
                checkRelatedFiles = true;
                break;
            }
        }

        if(rootFolder && projectFolder && checkRelatedFiles && rootList.includes(rootFolder)){
            const packageJson = require(`${rootPath}/${rootFolder}/${projectFolder}/package.json`);
            const projectName = packageJson.name;
            const workspaceName = rootFolder + '/' + projectFolder + '/';
            const file = filePath.replace(workspaceName,'');

            if(!list[projectName]){
                list[projectName] = [];
                workspaces.push(projectName);
            }
            list[projectName].push(file);
        }
    }
    return [workspaces,list];
};
