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
