import {GLOBAL_SETTINGS_APP_NAME} from '../constants';
import {makeGraphQlCall} from '../e2eUtils';

describe('globalSettings', () => {
    test('Save and get global settings', async () => {
        const saveResult = await makeGraphQlCall(`mutation {
            saveGlobalSettings(settings: {name: "${GLOBAL_SETTINGS_APP_NAME}"}) {
                name
            }
        }`);

        expect(saveResult.status).toBe(200);
        expect(saveResult.data.data.saveGlobalSettings.name).toBe(GLOBAL_SETTINGS_APP_NAME);

        const getResult = await makeGraphQlCall(`{
            globalSettings {
                name
                icon {
                    id
                }
            }
        }`);

        expect(getResult.status).toBe(200);
        expect(getResult.data.data.globalSettings.name).toBe(GLOBAL_SETTINGS_APP_NAME);
        expect(getResult.data.data.globalSettings.icon).toBe(null);
    });
});
