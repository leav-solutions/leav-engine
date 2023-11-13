const axios = require('axios');
const fs = require("fs");
const path = require("path");

// get artifacts list
const getArtifactList = () => {
    const artifactListUrl = `${process.env.GITHUB_REPOSITORY}/actions/artifacts`;
    const options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "leav-engine",
        }
    }
    return axios.get(artifactListUrl, options);
}

const downloadArtifact = async (fileName, url) => {
    const file = fs.createWriteStream(fileName);

    // download file with axios
    const res= await axios.get(url, {
        responseType: 'stream',
        headers: {
            "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "leav-engine",
            "Content-type": "application/zip",
        }
    })
    // pipe the result stream into a file on disc
    res.data.pipe(file)
    return new Promise((resolve, reject) => {
        file.on('finish',() => resolve(fileName))
        file.on('error',(err) => reject(err))
    });
}

const initEnvVariables = () => {
    const envPath = path.resolve(__dirname, "../.env");
    const envFile = fs.readFileSync(envPath, "utf8");

    process.env = envFile.split("\n").reduce((acc, curr) => {
        if (!curr) return acc;
        const [key, value] = curr.split("=");
        acc[key] = value;
        return acc;
    }, {});
}
module.exports = {
    getArtifactList,
    downloadArtifact,
    initEnvVariables
}
