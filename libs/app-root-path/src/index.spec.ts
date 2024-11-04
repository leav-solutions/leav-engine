// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {appRootPath} from '.';

jest.mock('app-root-path', () => ({
    path: 'path/from/deps'
}));

describe('appRootPath', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = {...OLD_ENV};
    });

    test('Return path from env variable', async () => {
        process.env.APP_ROOT_PATH = 'path/from/variable';
        expect(appRootPath()).toMatch(new RegExp(/path\/from\/variable$/));
    });

    test('Determine path from app location', async () => {
        expect(appRootPath()).toMatch(new RegExp(/path\/from\/deps$/));
    });

    test('Remove trailing slashes', async () => {
        process.env.APP_ROOT_PATH = 'path/from/variable/';
        expect(appRootPath()).toMatch(new RegExp(/path\/from\/variable$/));
    });
});
