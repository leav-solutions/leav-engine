// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import defaultPermission from './defaultPermission';

describe('getDefaultPermission', () => {
    test('Return default permissions', async () => {
        const config = {
            permissions: {
                default: false
            }
        };

        const defaultPermHelper = defaultPermission({config: config as IConfig});

        const perm = defaultPermHelper.getDefaultPermission();

        expect(perm).toBe(config.permissions.default);
    });

    test('Return true if no default permissions', async () => {
        const config = {
            permissions: {
                default: null
            }
        };

        const defaultPermHelper = defaultPermission({config: config as IConfig});

        const perm = defaultPermHelper.getDefaultPermission();

        expect(perm).toBe(true);
    });
});
