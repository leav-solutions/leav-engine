// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('globalSettings', () => {
    test('Save and get global settings', async () => {
        const saveResult = await makeGraphQlCall(`mutation {
            saveGlobalSettings(settings: {name: "My App"}) {
                name
            }
        }`);

        expect(saveResult.status).toBe(200);
        expect(saveResult.data.data.saveGlobalSettings.name).toBe('My App');

        const getResult = await makeGraphQlCall(`{
            globalSettings {
                name
                icon {
                    id
                }
            }
        }`);

        expect(getResult.status).toBe(200);
        expect(getResult.data.data.globalSettings.name).toBe('My App');
        expect(getResult.data.data.globalSettings.icon).toBe(null);
    });
});
