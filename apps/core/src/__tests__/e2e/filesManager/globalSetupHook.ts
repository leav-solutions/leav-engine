// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable @typescript-eslint/no-var-requires */
import * as setupModule from './globalSetup';
require('ts-node').register({
    transpileOnly: true
});

export default async function () {
    await setupModule.setup();

    return null;
}
