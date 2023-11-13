const fs = require('fs');

const {getArtifactList, downloadArtifact, initEnvVariables} = require("./utils");

initEnvVariables();

let artifact;

const gitArtifactBranch = process.env.GIT_ARTIFACT_BRANCH;

// if no branch provided, exit
if (!gitArtifactBranch) {
    console.error('GIT_ARTIFACT_BRANCH variable is not defined (see apps/core/.env file). Exiting...');
    process.exit(0);
}

(async () => {
    try {
        const { data: list} = await getArtifactList();
        // Find the artifact with the same commit sha1
        artifact = list.artifacts.find((artifact) => {
            // if artifact.name includes commit Sha1
            return artifact.name.includes(gitArtifactBranch);
        });

        if (!artifact) throw new Error(`No artifact found for branch: ${gitArtifactBranch}`);

        const fileName = `${artifact.name}.zip`;

        // before download remove file if exists
        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
        await downloadArtifact(fileName, artifact.archive_download_url);
        console.log(`Artifact ${fileName} downloaded successfully`);
    } catch (err) {
        console.log('error', err);
        process.exit(0);
    }
})()
