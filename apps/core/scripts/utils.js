const https = require("https");
const fs = require("fs");
const path = require("path");

// get artifacts list
const getArtifactList = () => {
    const artifactListUrl = "https://api.github.com/repos/stevenfreville/leav-engine/actions/artifacts";
    console.log('process.env.GITHUB_TOKEN', process.env.GITHUB_TOKEN)
    const options = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
            "User-Agent": "leav-engine",
        }
    }

    return new Promise((resolve, reject) => {
        const req = https.request(artifactListUrl, options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                resolve(JSON.parse(data));
            });
        });
        req.on("error", (err) => {
            console.log("Error: ", err.message)
            reject(err);
        });
        req.end();
    });

}

const downloadArtifact = (fileName, url) => {
    const file = fs.createWriteStream(fileName);

    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                "Authorization": `bearer ${process.env.GITHUB_TOKEN}`,
                "User-Agent": "leav-engine",
                "Content-type": "application/zip",
            }
        }

        https.get(url, options, (res) => {
            if (res.statusCode === 302) {
                // if we got a redirect, recurse and call downloadArtifact again
                downloadArtifact(fileName, res.headers.location)
                    .then(resolve)
                    .catch(reject);
            } else if (res.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
            } else {
                res.pipe(file);
                // after download completed close filestream
                file.on("finish", () => {
                    console.log("Download Completed");
                    resolve(fileName);
                });
            }
        }).on('error', function (err) { // Handle errors
            fs.unlink(fileName); // Delete the file async. (But we don't check the result)
            reject(err.message)
        });
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
