const getChangedProjects = require('./helpers/getChangedProjects');

/**
 * This script generate a string for commit message, containing name of all modified projects.
 * This is echoed to console in order to be retrieved by a bash script (git hook)
 */
(async () => {
    const changedProjects = await getChangedProjects({
        isStagedFiles: true,
        mustIncludeRoot: true,
        mustReturnPackageName: false
    });

    console.log(`[${changedProjects.join(', ')}]`);
})().catch(console.error);
