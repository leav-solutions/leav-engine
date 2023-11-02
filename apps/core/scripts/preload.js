// Read .env file with fs without using dotenv
const childProcess = require('child_process')
const fs = require('fs');

const {getArtifactList, downloadArtifact, initEnvVariables} = require("./utils");

initEnvVariables();

// Get commit sha1 from git
const commitSha1 = childProcess.execSync("git symbolic-ref HEAD --short").toString().trim();
let artifact;

getArtifactList()
    .then((list) => {
        // Find the artifact with the same commit sha1
        artifact = list.artifacts.find((artifact) => {
            // if artifact.name includes commit Sha1
            return artifact.name.includes(commitSha1);
        })

        if (!artifact) throw new Error(`No artifact found for this commit ${commitSha1}`);

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




