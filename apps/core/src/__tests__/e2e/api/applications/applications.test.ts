// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import {getConfig} from '../../../../config';
import {e2eNonAdminGroupId, e2eNonAdminUser, gqlCreateRecord, gqlSaveLibrary, makeGraphQlCall} from '../e2eUtils';
import ms from 'ms';

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
            expect(resAsset.headers['cache-control']).toBe(
                `public, max-age=${ms(conf.applications.assetsMaxAge) / 1000}`,
            );
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

    describe('Delete application', () => {
        test('Delete an non-system application', async () => {
            const res = await makeGraphQlCall('mutation {deleteApplication(id: "test_app") { id }}');

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();

            expect(res.data.data.deleteApplication).toBeDefined();
            expect(res.data.data.deleteApplication.id).toBe('test_app');
        });

        test('Delete an application should delete library panels associated to the application', async () => {
            const appIdToDelete = 'test_app_to_delete';

            await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "${appIdToDelete}",
                    label: {en: "Test App Studio Libraries With Panels"},
                    endpoint: "test-app-studio-libraries-with-panels",
                    module: "app-studio",
                    settings: {}
                }) { id }
            }`);

            const libraryIdWithPanels = 'library_with_panels';

            await gqlSaveLibrary(
                libraryIdWithPanels,
                'Library with panels',
                [],
                toGraphQLObject({
                    applications: {
                        [appIdToDelete]: {
                            libraryPanels: [
                                {
                                    id: `${libraryIdWithPanels}_list`,
                                    type: 'explorer',
                                    actions: [
                                        {
                                            where: 'slider',
                                            what: 'record',
                                            icon: 'fa-pen',
                                            label: {
                                                en: 'Edit with custom label',
                                                fr: 'Éditer avec un label personnalisé',
                                            },
                                            onRowClick: true,
                                        },
                                    ],
                                },
                            ],
                            recordPanels: [
                                {
                                    id: `${libraryIdWithPanels}_edition`,
                                    type: 'editionForm',
                                    formId: 'editionFormIdOverride',
                                },
                                {
                                    id: `${libraryIdWithPanels}_creation`,
                                    type: 'creationForm',
                                    formId: 'creationFormIdOverride',
                                    isStandalone: true,
                                },
                            ],
                        },
                    },
                }),
            );

            // Delete application
            await makeGraphQlCall(`mutation {deleteApplication(id: "${appIdToDelete}") { id }}`);

            const libraryWithPanelsRes = await makeGraphQlCall(
                `{libraries(filters: {id: "${libraryIdWithPanels}"}) { list { id settings } }}`,
            );

            expect(libraryWithPanelsRes.status).toBe(200);
            expect(libraryWithPanelsRes.data.errors).toBeUndefined();
            expect(libraryWithPanelsRes.data.data.libraries.list[0].settings.applications).toBeUndefined();

            // Cleanup
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${libraryIdWithPanels}") { id } }`);
        });

        test('Cannot delete a system application', async () => {
            await expect(makeGraphQlCall('mutation {deleteApplication(id: "admin") { id }}')).rejects.toThrow(
                /Cannot delete system application/,
            );
        });
    });

    describe('appStudioSettings', () => {
        const filteredWorkspacesAppId = 'test_app_studio_filtered_workspaces';
        const workspacesTitlesAppId = 'test_app_studio_workspaces_titles';
        const workspacesWithoutLibraryIdAppId = 'test_app_studio_workspaces_no_library_id';
        const workspacesWithoutRecordIdAppId = 'test_app_studio_workspaces_no_record_id';
        const withoutLibraryPanelsAppId = 'test_app_studio_libraries_without_panels';
        const librariesPanelsAppId = 'test_app_studio_libraries_panels';

        const allowedLibId = 'test_app_studio_lib_allowed';
        const deniedLibId = 'test_app_studio_lib_denied';
        const noWorkspaceTitleLibId = 'test_app_studio_library_no_workspace_title';
        const withLibraryPanelsLibId = 'test_app_studio_library_with_panels';
        const withoutLibraryPanelsLibId = 'test_app_studio_library_without_panels';

        let allowedRecordId: string;
        let deniedRecordId: string;
        let noWorkspaceTitleRecordId: string;

        beforeAll(async () => {
            // Create libraries
            await gqlSaveLibrary(allowedLibId, 'Allowed Library');
            await gqlSaveLibrary(deniedLibId, 'Denied Library');
            await gqlSaveLibrary(noWorkspaceTitleLibId, 'No Workspace Title Library');
            await gqlSaveLibrary(
                withLibraryPanelsLibId,
                'Library with panels',
                [],
                toGraphQLObject({
                    applications: {
                        [librariesPanelsAppId]: {
                            libraryPanels: [
                                {
                                    id: `${withLibraryPanelsLibId}_list`,
                                    type: 'explorer',
                                    actions: [
                                        {
                                            where: 'slider',
                                            what: 'record',
                                            icon: 'fa-pen',
                                            label: {
                                                en: 'Edit with custom label',
                                                fr: 'Éditer avec un label personnalisé',
                                            },
                                            onRowClick: true,
                                        },
                                    ],
                                },
                            ],
                            recordPanels: [
                                {
                                    id: `${withLibraryPanelsLibId}_edition`,
                                    type: 'editionForm',
                                    formId: 'editionFormIdOverride',
                                },
                                {
                                    id: `${withLibraryPanelsLibId}_creation`,
                                    type: 'creationForm',
                                    formId: 'creationFormIdOverride',
                                    isStandalone: true,
                                },
                                {
                                    id: `${withLibraryPanelsLibId}_link_to_other_library`,
                                    type: 'explorer',
                                    libraryId: withoutLibraryPanelsLibId,
                                },
                            ],
                        },
                    },
                }),
            );
            await gqlSaveLibrary(withoutLibraryPanelsLibId, 'Library without panels');

            // Create records
            allowedRecordId = await gqlCreateRecord(allowedLibId);
            deniedRecordId = await gqlCreateRecord(deniedLibId);
            noWorkspaceTitleRecordId = await gqlCreateRecord(noWorkspaceTitleLibId);

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

            // Create applications
            const settingsFilteredWorkspacesApp = {
                application: {
                    workspaces: [
                        {
                            id: 'ws-lib-allowed',
                            type: 'library',
                            libraryId: allowedLibId,
                            title: {en: 'Allowed Lib'},
                        },
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
                        {id: 'ws-lib-allowed-no-title', type: 'library', libraryId: allowedLibId},
                        {
                            id: 'ws-record-allowed-no-title',
                            type: 'record',
                            libraryId: allowedLibId,
                            recordId: allowedRecordId,
                        },
                    ],
                },
            };
            await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "${filteredWorkspacesAppId}",
                    label: {en: "Test App Studio Workspaces"},
                    endpoint: "test-app-studio-workspaces",
                    module: "app-studio",
                    settings: ${toGraphQLObject(settingsFilteredWorkspacesApp)}
                }) { id }
            }`);

            const settingsWorkspacesWithoutTitles = {
                application: {
                    workspaces: [
                        {
                            id: 'ws-library-with-title',
                            type: 'library',
                            libraryId: noWorkspaceTitleLibId,
                            title: {en: 'Library title'},
                        },
                        {
                            id: 'ws-record-with-title',
                            type: 'record',
                            libraryId: noWorkspaceTitleLibId,
                            recordId: noWorkspaceTitleRecordId,
                            title: {en: 'Record title'},
                        },
                        {id: 'ws-library-no-title', type: 'library', libraryId: noWorkspaceTitleLibId},
                        {
                            id: 'ws-record-no-title',
                            type: 'record',
                            libraryId: noWorkspaceTitleLibId,
                            recordId: noWorkspaceTitleRecordId,
                        },
                    ],
                },
            };
            await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "${workspacesTitlesAppId}",
                    label: {en: "Test App Studio Workspaces"},
                    endpoint: "test-app-studio-workspaces",
                    module: "app-studio",
                    settings: ${toGraphQLObject(settingsWorkspacesWithoutTitles)}
                }) { id }
            }`);

            const settingsWorkspacesWithoutLibraryId = {
                application: {
                    workspaces: [
                        {
                            id: 'ws-lib-no-library-id',
                            type: 'library',
                        },
                    ],
                },
            };
            await makeGraphQlCall(`mutation {
                    saveApplication(application: {
                        id: "${workspacesWithoutLibraryIdAppId}",
                        label: {en: "Test App Studio Workspaces"},
                        endpoint: "test-app-studio-workspaces",
                        module: "app-studio",
                        settings: ${toGraphQLObject(settingsWorkspacesWithoutLibraryId)}
                    }) { id }
                }`);

            const settingsWorkspacesWithoutRecordId = {
                application: {
                    workspaces: [{id: 'ws-record-no-record-id', type: 'record', libraryId: allowedLibId}],
                },
            };
            await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "${workspacesWithoutRecordIdAppId}",
                    label: {en: "Test App Studio Workspaces"},
                    endpoint: "test-app-studio-workspaces",
                    module: "app-studio",
                    settings: ${toGraphQLObject(settingsWorkspacesWithoutRecordId)}
                }) { id }
            }`);

            const settingsLibrariesWithoutPanels = {
                application: {
                    workspaces: [
                        {
                            id: 'ws-lib-without-panels',
                            type: 'library',
                            libraryId: withoutLibraryPanelsLibId,
                        },
                        {
                            id: 'ws-allowed-lib',
                            type: 'library',
                            libraryId: allowedLibId,
                        },
                    ],
                },
            };
            await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "${withoutLibraryPanelsAppId}",
                    label: {en: "Test App Studio Libraries Without Panels"},
                    endpoint: "test-app-studio-libraries-without-panels",
                    module: "app-studio",
                    settings: ${toGraphQLObject(settingsLibrariesWithoutPanels)}
                }) { id }
            }`);

            const settingsLibrariesWithPanels = {
                application: {
                    workspaces: [
                        {
                            id: 'ws-lib-with-panels',
                            type: 'library',
                            libraryId: withLibraryPanelsLibId,
                        },
                    ],
                },
            };
            await makeGraphQlCall(`mutation {
                saveApplication(application: {
                    id: "${librariesPanelsAppId}",
                    label: {en: "Test App Studio Libraries With Panels"},
                    endpoint: "test-app-studio-libraries-with-panels",
                    module: "app-studio",
                    settings: ${toGraphQLObject(settingsLibrariesWithPanels)}
                }) { id }
            }`);
        });

        afterAll(async () => {
            // Cleanup records
            await makeGraphQlCall(
                `mutation { deleteRecord(library: "${allowedLibId}", id: "${allowedRecordId}") { id } }`,
            );
            await makeGraphQlCall(
                `mutation { deleteRecord(library: "${deniedLibId}", id: "${deniedRecordId}") { id } }`,
            );
            await makeGraphQlCall(
                `mutation { deleteRecord(library: "${noWorkspaceTitleLibId}", id: "${noWorkspaceTitleRecordId}") { id } }`,
            );

            // Cleanup libraries
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${allowedLibId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${deniedLibId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${noWorkspaceTitleLibId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${withLibraryPanelsLibId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteLibrary(id: "${withoutLibraryPanelsLibId}") { id } }`);

            // Cleanup applications
            await makeGraphQlCall(`mutation { deleteApplication(id: "${filteredWorkspacesAppId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteApplication(id: "${workspacesTitlesAppId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteApplication(id: "${workspacesWithoutLibraryIdAppId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteApplication(id: "${workspacesWithoutRecordIdAppId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteApplication(id: "${withoutLibraryPanelsAppId}") { id } }`);
            await makeGraphQlCall(`mutation { deleteApplication(id: "${librariesPanelsAppId}") { id } }`);
        });

        describe('workspaces permissions filtering', () => {
            test('Admin user should see all workspaces', async () => {
                const res = await makeGraphQlCall(`{
                applications(filters: {id: "${filteredWorkspacesAppId}"}) {
                    list {
                        id
                        appStudioSettings
                    }
                }
            }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();

                const app = res.data.data.applications.list[0];
                expect(app.appStudioSettings.workspaces).toHaveLength(6);
            });

            test('Non-admin user should only see allowed library workspaces', async () => {
                const res = await makeGraphQlCall(
                    `{
                    applications(filters: {id: "${filteredWorkspacesAppId}"}) {
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
                expect(workspaceIds).toContain('ws-lib-allowed-no-title');
                expect(workspaceIds).toContain('ws-record-allowed-no-title');
                expect(workspaceIds).not.toContain('ws-lib-denied');
                expect(workspaceIds).not.toContain('ws-record-denied');
                expect(app.appStudioSettings.workspaces).toHaveLength(4);
            });
        });

        describe('workspaces titles', () => {
            test('Should return workspace titles if provided', async () => {
                const res = await makeGraphQlCall(`{
                        applications(filters: {id: "${workspacesTitlesAppId}"}) {
                            list {
                                id
                                appStudioSettings
                            }
                        }
                    }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();

                const app = res.data.data.applications.list[0];
                expect(app.appStudioSettings.workspaces[0].title).toEqual({en: 'Library title'});
                expect(app.appStudioSettings.workspaces[1].title).toEqual({en: 'Record title'});
            });

            test('Should return workspace titles for both library and record if not provided', async () => {
                const res = await makeGraphQlCall(`{
                    applications(filters: {id: "${workspacesTitlesAppId}"}) {
                        list {
                            id
                            appStudioSettings
                        }
                    }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();

                const app = res.data.data.applications.list[0];
                expect(app.appStudioSettings.workspaces.find(ws => ws.id === 'ws-library-no-title')?.title).toEqual({
                    en: 'No Workspace Title Library',
                });
                expect(app.appStudioSettings.workspaces.find(ws => ws.id === 'ws-record-no-title')?.title).toEqual({
                    en: noWorkspaceTitleRecordId,
                    fr: noWorkspaceTitleRecordId,
                });
            });

            test('Should throw validation error if workspace library ID is undefined and title is not provided', async () => {
                await expect(
                    makeGraphQlCall(`{
                    applications(filters: {id: "${workspacesWithoutLibraryIdAppId}"}) {
                        list {
                            id
                            appStudioSettings
                        }
                    }
                }`),
                ).rejects.toThrow(/Library ID is required for workspace ws-lib-no-library-id/);
            });

            test('Should throw validation error if workspace record ID is undefined', async () => {
                // Should throw validation error when checking workspace permissions
                await expect(
                    makeGraphQlCall(`{
                        applications(filters: {id: "${workspacesWithoutRecordIdAppId}"}) {
                            list {
                                id
                                appStudioSettings
                            }
                        }
                    }`),
                ).rejects.toThrow(/Missing record ID/);
            });
        });

        describe('libraries panels', () => {
            test('Should return libraries system panels based on workspaces for a given application if panels are not overridden', async () => {
                const res = await makeGraphQlCall(`{
                    applications(filters: {id: "${withoutLibraryPanelsAppId}"}) {
                        list {
                            id
                            appStudioSettings
                        }
                    }
                }`);

                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();

                const app = res.data.data.applications.list[0];
                const libraries = app.appStudioSettings.libraries;

                for (const libraryId of [withoutLibraryPanelsLibId, allowedLibId]) {
                    expect(libraries[libraryId]).toMatchObject({
                        libraryPanels: [
                            {
                                id: `${libraryId}_list`,
                                type: 'explorer',
                                actions: [
                                    {
                                        where: 'popup',
                                        what: 'record',
                                        icon: 'fa-pen',
                                        label: {en: 'Edit', fr: 'Éditer'},
                                        onRowClick: true,
                                    },
                                ],
                            },
                        ],
                        recordPanels: [
                            {
                                id: `${libraryId}_edition`,
                                type: 'editionForm',
                                formId: 'edition',
                            },
                            {
                                id: `${libraryId}_creation`,
                                type: 'creationForm',
                                formId: 'creation',
                                isStandalone: true,
                            },
                        ],
                    });
                }
            });

            test('Should return libraries panels based on workspaces and library recordsPanels for a given application if panels are overridden', async () => {
                const res = await makeGraphQlCall(`{
                    applications(filters: {id: "${librariesPanelsAppId}"}) {
                        list {
                            id
                            appStudioSettings
                        }
                    }
                }`);
                expect(res.status).toBe(200);
                expect(res.data.errors).toBeUndefined();

                const app = res.data.data.applications.list[0];
                const libraries = app.appStudioSettings.libraries;

                expect(libraries[withLibraryPanelsLibId]).toMatchObject({
                    libraryPanels: [
                        {
                            id: `${withLibraryPanelsLibId}_list`,
                            type: 'explorer',
                            actions: [
                                {
                                    where: 'slider',
                                    what: 'record',
                                    icon: 'fa-pen',
                                    label: {en: 'Edit with custom label', fr: 'Éditer avec un label personnalisé'},
                                    onRowClick: true,
                                },
                            ],
                        },
                    ],
                    recordPanels: [
                        {
                            id: `${withLibraryPanelsLibId}_edition`,
                            type: 'editionForm',
                            formId: 'editionFormIdOverride',
                        },
                        {
                            id: `${withLibraryPanelsLibId}_creation`,
                            type: 'creationForm',
                            formId: 'creationFormIdOverride',
                            isStandalone: true,
                        },
                        {
                            id: `${withLibraryPanelsLibId}_link_to_other_library`,
                            type: 'explorer',
                            libraryId: withoutLibraryPanelsLibId,
                        },
                    ],
                });

                // Not defined in application workspace but defined in library (id: withLibraryPanelsLibId) system panels
                expect(libraries[withoutLibraryPanelsLibId]).toMatchObject({
                    libraryPanels: [
                        {
                            id: `${withoutLibraryPanelsLibId}_list`,
                            type: 'explorer',
                            actions: [
                                {
                                    where: 'popup',
                                    what: 'record',
                                    icon: 'fa-pen',
                                    label: {en: 'Edit', fr: 'Éditer'},
                                    onRowClick: true,
                                },
                            ],
                        },
                    ],
                    recordPanels: [
                        {
                            id: `${withoutLibraryPanelsLibId}_edition`,
                            type: 'editionForm',
                            formId: 'edition',
                        },
                        {
                            id: `${withoutLibraryPanelsLibId}_creation`,
                            type: 'creationForm',
                            formId: 'creation',
                            isStandalone: true,
                        },
                    ],
                });
            });
        });
    });
});
