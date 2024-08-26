// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {startConsume} from './amqp/startConsume';
import {getConfig} from './getConfig/getConfig';

(async function () {
    try {
        const config = await getConfig();

        // Ensure that the output directory exists
        if (!config.outputRootPath) {
            throw new Error('Output root path is not defined');
        }

        // Create the output directory if it doesn't exist
        if (!fs.existsSync(config.outputRootPath)) {
            fs.mkdirSync(config.outputRootPath);
        }

        await startConsume(config);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().catch(e => console.error(e));

process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
