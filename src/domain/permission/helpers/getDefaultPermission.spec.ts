// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import getDefaultPermission from './getDefaultPermission';

describe('getDefaultPermission', () => {
    test('Return default permissions', async () => {
        const config = {
            permissions: {
                default: false
            }
        };

        const perm = getDefaultPermission(config as IConfig);

        expect(perm).toBe(config.permissions.default);
    });

    test('Return true if no default permissions', async () => {
        const config = {
            permissions: {
                default: null
            }
        };

        const perm = getDefaultPermission(config as IConfig);

        expect(perm).toBe(true);
    });
});
