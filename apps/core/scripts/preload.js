// Read .env file with fs without using dotenv
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

getArtifactList()
    .then((list) => {
        // Find the artifact with the same commit sha1
        artifact = list.artifacts.find((artifact) => {
            // if artifact.name includes commit Sha1
            return artifact.name.includes(gitArtifactBranch);
        })

        if (!artifact) throw new Error(`No artifact found for on branch: ${gitArtifactBranch}`);

        const fileName = `${artifact.name}.zip`;
        // before download remove file if exists
        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }

        return downloadArtifact(fileName, artifact.archive_download_url)
    })
    .then((res) => {
        console.log('file downloaded', res);
        process.exit(0);
    })
    .catch((err) => {
        console.log('error', err);
        process.exit(0);
    });




