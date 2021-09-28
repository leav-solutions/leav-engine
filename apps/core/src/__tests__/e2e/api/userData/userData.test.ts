// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {makeGraphQlCall} from '../e2eUtils';

describe('User Data', () => {
    test('save and get user data', async () => {
        const save = await makeGraphQlCall(`mutation {
            saveUserData(
               key: "test",
               value: "data",
               global: false
              ) {
                  global
                  data
              }
        }`);

        expect(save.status).toBe(200);
        expect(save.data.data.saveUserData.global).toBe(false);
        expect(save.data.data.saveUserData.data.test).toBe('data');
        expect(save.data.errors).toBeUndefined();

        const get = await makeGraphQlCall(`{
            userData(keys: ["test"]) { global data }
        }`);

        expect(get.status).toBe(200);
        expect(get.data.data.userData).toEqual({global: false, data: {test: 'data'}});
        expect(get.data.errors).toBeUndefined();
    });

    test('save and get global data with permission', async () => {
        const perm = await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                  type: app
                  actions: [{ name: app_manage_global_preferences, allowed: true }]
                }
              ) {
                type
                actions {
                    name
                    allowed
                }
              }
        }`);

        expect(perm.status).toBe(200);
        expect(perm.data.data.savePermission.type).toBe('app');
        expect(perm.data.errors).toBeUndefined();
        expect(perm.data.data.savePermission.actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'app_manage_global_preferences',
                    allowed: true
                })
            ])
        );

        const res = await makeGraphQlCall(`mutation {
            saveUserData(
               key: "test_global",
               value: "data_global",
               global: true
              ) {
                global
                data
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveUserData.global).toBe(true);
        expect(res.data.data.saveUserData.data.test_global).toBe('data_global');
        expect(res.data.errors).toBeUndefined();

        const get = await makeGraphQlCall(`{
            userData(
               keys: ["test_global"],
               global: true
              ) { global data }
        }`);

        expect(get.status).toBe(200);
        expect(get.data.data.userData).toEqual({global: true, data: {test_global: 'data_global'}});
        expect(get.data.errors).toBeUndefined();
    });

    test('save and get global data w/o permission', async () => {
        const perm = await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                  type: app
                  actions: [{ name: app_manage_global_preferences, allowed: false }]
                }
              ) {
                type
                actions {
                    name
                    allowed
                }
              }
        }`);

        expect(perm.status).toBe(200);
        expect(perm.data.data.savePermission.type).toBe('app');
        expect(perm.data.errors).toBeUndefined();
        expect(perm.data.data.savePermission.actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'app_manage_global_preferences',
                    allowed: false
                })
            ])
        );

        const res = await makeGraphQlCall(`mutation {
            saveUserData(
               key: "test",
               value: "data",
               global: true
              ) {
                global
                data
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeDefined();
        expect(res.data.errors[0].extensions.code).toBe('PERMISSION_ERROR');

        const get = await makeGraphQlCall(`{
            userData(
               keys: ["test_global"],
               global: true
              ) { global data }
        }`);

        expect(get.status).toBe(200);
        expect(get.data.errors).toBeDefined();
        expect(get.data.errors[0].extensions.code).toBe('PERMISSION_ERROR');
    });
});
