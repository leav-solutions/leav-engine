import fs from 'fs';
import path from 'path';

export default async function () {
    return async function teardown() {
        fs.rmSync(path.join(__dirname, '_fixtures'), {recursive: true, force: true});
    };
}
