// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import {getConfig} from '../../../../config';
import {e2eNonAdminGroupId, e2eNonAdminUser, gqlCreateRecord, gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';

/**
 * Convert a JavaScript object to GraphQL object literal syntax (keys without quotes)
 */
const toGraphQLObject = (obj: unknown): string => {
    if (obj === null || obj === undefined) {
        return 'null';
    }
    if (typeof obj === 'string') {
        return `"${obj}"`;
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') {
        return String(obj);
    }
    if (Array.isArray(obj)) {
        return `[${obj.map(toGraphQLObject).join(', ')}]`;
    }
    if (typeof obj === 'object') {
        const entries = Object.entries(obj)
            .map(([key, value]) => `${key}: ${toGraphQLObject(value)}`)
            .join(', ');
        return `{${entries}}`;
    }
    return String(obj);
};

describe('Applications', () => {
    describe('Access application', () => {
        test('App index should have no-cache cache-control header', async () => {
            const conf = await getConfig();
            const urlLoginApp = `http://${conf.server.host}:${conf.server.port}/app/login`;

            const resLogin = await axios.get(urlLoginApp);

            expect(resLogin.status).toBe(200);
            expect(resLogin.headers['cache-control']).toBe('no-cache, max-age=0, must-revalidate');
            expect(resLogin.data).toContain('LEAV Engine - Login');
            expect(resLogin.data).toContain('window.__dynamic_base__ = `/app/login`');
            expect(resLogin.data).toContain('window.__global_base_url__ = ``');
        });

        test('App asset should have public cache-control header', async () => {
            const conf = await getConfig();
            const urlAsset = `http://${conf.server.host}:${conf.server.port}/app/login/index-hashed.js`;

            const resAsset = await axios.get(urlAsset);

            expect(resAsset.status).toBe(200);
            expect(resAsset.headers['cache-control']).toBe('public, max-age=0');
            expect(resAsset.data).toContain('This file is not a test file, it is a fixture for applications tests');
        });
    });
    test('Create application', async () => {
        const res = await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "test_app",
                    label: {en: "Test app"},
                    endpoint: "my-app",
                    module: "data-studio"
                }) {
                    id
                    label
                    endpoint
                    module
                    permissions {
                        access_application
                    }
                }
            }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.saveApplication.id).toBe('test_app');
        expect(res.data.data.saveApplication.module).toBe('data-studio');
        expect(res.data.data.saveApplication.permissions.access_application).toBeDefined();

        // Check if new app is in applications list
        const appsRes = await makeGraphQlCall(`{
            applications {
                list {
                    id
                    permissions {access_application}
                }
            }
        }`);

        expect(appsRes.status).toBe(200);
        expect(appsRes.data.errors).toBeUndefined();

        const testAppRes = appsRes.data.data.applications.list.find(app => app.id === 'test_app');
        expect(testAppRes).toBeDefined();
        expect(testAppRes.permissions.access_application).toBeDefined();
    });

    test('Get applications list', async () => {
        const res = await makeGraphQlCall('{ applications { list { id } } }');
        expect(res.status).toBe(200);
        expect(res.data.data.applications.list.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });

    test('Get application by ID', async () => {
        const res = await makeGraphQlCall('{applications(filters: {id: "test_app"}) { list { id } }}');

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.applications.list.length).toBe(1);
    });

    test('Delete an application', async () => {
        const res = await makeGraphQlCall('mutation {deleteApplication(id: "test_app") { id }}');

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.deleteApplication).toBeDefined();
        expect(res.data.data.deleteApplication.id).toBe('test_app');
    });

    describe('appStudioSettings workspaces permissions filtering', () => {
        const allowedLibId = 'test_app_studio_lib_allowed';
        const deniedLibId = 'test_app_studio_lib_denied';
        const appId = 'test_app_studio_workspaces';
        let allowedRecordId: string;
        let deniedRecordId: string;

        beforeAll(async () => {
            // Create libraries for workspaces
            await gqlSaveLibrary(allowedLibId, 'Allowed Library');
            await gqlSaveLibrary(deniedLibId, 'Denied Library');

            // Create records for record-type workspaces
            allowedRecordId = await gqlCreateRecord(allowedLibId);
            deniedRecordId = await gqlCreateRecord(deniedLibId);

            // Set library permissions: allow access to allowedLib, deny access to deniedLib
            await makeGraphQlCall(`mutation {
                allowedPerm: savePermission(
                    permission: {
                        type: library,
                        applyTo: "${allowedLibId}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        actions: [{name: access_library, allowed: true}]
                    }
                ) { type }
                deniedPerm: savePermission(
                    permission: {
                        type: library,
                        applyTo: "${deniedLibId}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        actions: [{name: access_library, allowed: false}]
                    }
                ) { type }
            }`);

            // Set record permissions for record-type workspaces
            await makeGraphQlCall(`mutation {
                allowedRecordPerm: savePermission(
                    permission: {
                        type: library,
                        applyTo: "${allowedLibId}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        actions: [{name: access_record, allowed: true}]
                    }
                ) { type }
                deniedRecordPerm: savePermission(
                    permission: {
                        type: library,
                        applyTo: "${deniedLibId}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        actions: [{name: access_record, allowed: false}]
                    }
                ) { type }
            }`);

            // Create application with workspaces
            const workspaces = [
                {id: 'ws-lib-allowed', type: 'library', libraryId: allowedLibId, title: {en: 'Allowed Lib'}},
                {id: 'ws-lib-denied', type: 'library', libraryId: deniedLibId, title: {en: 'Denied Lib'}},
                {
                    id: 'ws-record-allowed',
                    type: 'record',
                    libraryId: allowedLibId,
                    recordId: allowedRecordId,
                    title: {en: 'Allowed Record'},
                },
                {
                    id: 'ws-record-denied',
                    type: 'record',
                    libraryId: deniedLibId,
                    recordId: deniedRecordId,
                    title: {en: 'Denied Record'},
                },
            ];

            const settings = {application: {workspaces}};

            await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "${appId}",
                    label: {en: "Test App Studio Workspaces"},
                    endpoint: "test-app-studio-workspaces",
                    module: "data-studio",
                    settings: ${toGraphQLObject(settings)}
                }) { id }
            }`);
        });

        afterAll(async () => {
            // Cleanup
            await makeGraphQlCall(`mutation { deleteApplication(id: "${appId}") { id } }`);
        });

        test('Admin user should see all workspaces', async () => {
            const res = await makeGraphQlCall(`{
                applications(filters: {id: "${appId}"}) {
                    list {
                        id
                        appStudioSettings
                    }
                }
            }`);

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();

            const app = res.data.data.applications.list[0];
            expect(app.appStudioSettings.workspaces).toHaveLength(4);
        });

        test('Non-admin user should only see allowed library workspaces', async () => {
            const res = await makeGraphQlCall(
                `{
                    applications(filters: {id: "${appId}"}) {
                        list {
                            id
                            appStudioSettings
                        }
                    }
                }`,
                {user: e2eNonAdminUser()},
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();

            const app = res.data.data.applications.list[0];
            const workspaceIds = app.appStudioSettings.workspaces.map(ws => ws.id);

            // Should only contain allowed workspaces
            expect(workspaceIds).toContain('ws-lib-allowed');
            expect(workspaceIds).toContain('ws-record-allowed');
            expect(workspaceIds).not.toContain('ws-lib-denied');
            expect(workspaceIds).not.toContain('ws-record-denied');
            expect(app.appStudioSettings.workspaces).toHaveLength(2);
        });
    });
});
