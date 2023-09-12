'use strict';
const {spawn} = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * This script will run test on changed projects.
 */
(async () => {
    try {

        const {stdout, stderr}  = await exec('npx jest --listTests --json');
        const listOfProject = ['libs/ui','apps/data-studio','apps/admin','apps/core'];
        const final = [];

        for(const filePath of stdout.trim(1).slice(0, -1).split(',')){
            for(const project of listOfProject){
                if(filePath.includes(project)){
                    if(!final[project]){
                        final[project] =[];
                    }
                    final[project].push(filePath.replaceAll('"',''));
                }
            }
        }
    return final;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
