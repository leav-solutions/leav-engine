import * as fs from 'fs';
import * as path from 'path';

export async function setup() {
    try {
        fs.mkdirSync(path.join(__dirname, '_fixtures'));
    } catch (e) {
        console.error(e);
    }
}
