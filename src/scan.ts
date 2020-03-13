import walk from 'walk';
import fs from 'fs';
import crypto from 'crypto';
import {env} from './env';
import config from './config';

const createHashFromFile = filePath =>
    new Promise(resolve => {
        const hash = crypto.createHash('md5');
        fs.createReadStream(filePath)
            .on('data', data => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')));
    });

export default async () => {
    const conf = await config;

    const options = {
        followLinks: false
    };

    const walker = walk.walk(conf.filesystem.absolutePath, options);

    walker.on('directories', function(root, dirStatsArray, next) {
        console.log(root);
        console.log(dirStatsArray);
        next();
    });

    walker.on('file', async function(root, fileStats, next) {
        fileStats.md5 = await createHashFromFile(root + '/' + fileStats.name);
        console.log(fileStats);
        next();
    });

    walker.on('errors', function(root, nodeStatsArray, next) {
        next();
    });

    walker.on('end', function() {
        console.log('all done');
    });
};
