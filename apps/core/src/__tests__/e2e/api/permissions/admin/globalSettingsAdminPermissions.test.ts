import {GLOBAL_SETTINGS_APP_NAME} from '../../constants';
import {e2eAdminUser, e2eGuestUser, makeGraphQlCall} from '../../e2eUtils';

describe('GlobalSettingsAdminPermissions', () => {
    describe('save global settings', () => {
        it('Should not be authorized to save global settings', async () => {
            const gqlMutation = `mutation {
                saveGlobalSettings(settings: {name: "${GLOBAL_SETTINGS_APP_NAME}"}) {
                    name
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eGuestUser()})).rejects.toThrow(/Action forbidden/);
        });

        it('Should be authorized to save global settings', async () => {
            const gqlMutation = `mutation {
                saveGlobalSettings(settings: {name: "${GLOBAL_SETTINGS_APP_NAME}"}) {
                    name
                }
            }`;

            await expect(makeGraphQlCall(gqlMutation, {user: e2eAdminUser()})).resolves.toBeDefined();
        });
    });
});
