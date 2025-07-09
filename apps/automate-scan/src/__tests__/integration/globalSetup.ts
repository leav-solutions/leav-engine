// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as fs from 'fs';
import * as path from 'path';

export async function setup() {
    try {
        fs.mkdirSync(path.join(__dirname, '_fixtures'));
    } catch (e) {
        console.error(e);
    }
}
