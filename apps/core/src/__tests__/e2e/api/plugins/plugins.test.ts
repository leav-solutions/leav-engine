// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('Plugins', () => {
    /**
     * /!\ fake-plugin install is managed in globalSetup.js
     */
    describe('Get plugins list', () => {
        test('Return plugins list', async () => {
            const resPlugins = await makeGraphQlCall(`{
                plugins {
                    name
                    description
                    version
                    author
                }
            }`);

            expect(resPlugins.status).toBe(200);

            const fakePluginData = resPlugins.data.data.plugins.find(p => p.name === 'fakeplugin');

            expect(fakePluginData).toBeDefined();
        });
    });

    describe('Register graphql schema', () => {
        test('Plugins graphql schema should be loaded', async () => {
            const resSchema = await makeGraphQlCall(`{
                __schema {
                    queryType {
                        fields {
                            name
                        }
                    }
                }
            }`);

            expect(resSchema.data.data.__schema.queryType.fields.find(f => f.name === 'fakePluginQuery')).toBeDefined();
        });
    });

    describe('Register translation', () => {
        test('Plugins should be able to use their own translation', async () => {
            const resTranslation = await makeGraphQlCall(`{
                fakePluginTranslation
            }`);

            expect(resTranslation.data.data.fakePluginTranslation).toBe('Test translation FR');
        });
    });

    describe('Register permissions', () => {
        test('Plugins should be able to load their own permissions', async () => {
            const resPermissions = await makeGraphQlCall(`{
                permissionsActionsByType(type: library) {
                    name
                    label
                }
            }`);

            expect(
                resPermissions.data.data.permissionsActionsByType.find(p => p.name === 'fake_plugin_permission')
            ).toBeDefined();
        });
    });
});
