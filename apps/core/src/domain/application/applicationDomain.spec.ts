// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CONSULTED_APPS_KEY} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import {IUserDomain} from 'domain/user/userDomain';
import {IApplicationRepo} from 'infra/application/applicationRepo';
import {IApplicationService} from 'infra/application/applicationService';
import {IUtils} from 'utils/utils';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {mockApplication, mockApplicationExternal} from '../../__tests__/mocks/application';
import {mockCtx} from '../../__tests__/mocks/shared';
import applicationDomain, {MAX_CONSULTATION_HISTORY_SIZE} from './applicationDomain';

describe('applicationDomain', () => {
    beforeEach(() => jest.clearAllMocks());

    const mockAdminPermissionDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(true)
    };

    const mockAdminPermissionDomainNotAllowed: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(false)
    };

    const mockEventsManager: Mockify<IEventsManagerDomain> = {
        sendPubSubEvent: global.__mockPromise()
    };

    const mockTasksManager: Mockify<ITasksManagerDomain> = {
        createTask: global.__mockPromise()
    };

    describe('getApplicationProperties', () => {
        test('Retrieve an application properties from its ID', async () => {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [mockApplication], totalCount: 1})
            };

            const appDomain = applicationDomain({
                'core.infra.application': mockAppRepo as IApplicationRepo
            });
            const attr = await appDomain.getApplicationProperties({id: 'test_application', ctx: mockCtx});

            expect(mockAppRepo.getApplications.mock.calls.length).toBe(1);
            expect(mockAppRepo.getApplications).toBeCalledWith({
                params: {filters: {id: 'test_application'}, strictFilters: true},
                ctx: mockCtx
            });
            expect(attr).toMatchObject({id: 'test_application'});
        });

        test('Should throw if unknown application', async function () {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [], totalCount: 0})
            };

            const appDomain = applicationDomain({
                'core.infra.application': mockAppRepo as IApplicationRepo
            });

            await expect(appDomain.getApplicationProperties({id: 'test', ctx: mockCtx})).rejects.toThrow();
        });
    });

    describe('getApplications', () => {
        test('Retrieve all applications', async () => {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [mockApplication], totalCount: 1})
            };

            const appDomain = applicationDomain({
                'core.infra.application': mockAppRepo as IApplicationRepo
            });
            const attr = await appDomain.getApplications({ctx: mockCtx});

            expect(mockAppRepo.getApplications.mock.calls.length).toBe(1);
            expect(mockAppRepo.getApplications).toBeCalledWith({
                params: {sort: {field: 'id', order: SortOrder.ASC}},
                ctx: mockCtx
            });
            expect(attr).toMatchObject({list: [mockApplication]});
        });
    });

    describe('saveApplication', () => {
        const mockUtils: Mockify<IUtils> = {
            isIdValid: jest.fn().mockReturnValue(true),
            isEndpointValid: jest.fn().mockReturnValue(true)
        };

        describe('Creation', () => {
            test('Create a new application', async () => {
                const mockAppRepo: Mockify<IApplicationRepo> = {
                    getApplications: global.__mockPromise({list: [], totalCount: 0}),
                    createApplication: global.__mockPromise(mockApplication),
                    updateApplication: global.__mockPromise(mockApplication)
                };

                const appDomain = applicationDomain({
                    'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.application': mockAppRepo as IApplicationRepo,
                    'core.domain.tasksManager': mockTasksManager as ITasksManagerDomain,
                    'core.utils': mockUtils as IUtils
                });
                appDomain.runInstall = jest.fn();

                const createdApp = await appDomain.saveApplication({applicationData: mockApplication, ctx: mockCtx});

                expect(mockAppRepo.createApplication).toBeCalled();
                expect(mockAppRepo.updateApplication).not.toBeCalled();
                expect(appDomain.runInstall).toBeCalled();
                expect(createdApp).toEqual(mockApplication);
            });

            test('Throws if creation is not allowed', async () => {
                const mockAppRepo: Mockify<IApplicationRepo> = {
                    getApplications: global.__mockPromise({list: [], totalCount: 0}),
                    createApplication: global.__mockPromise(mockApplication),
                    updateApplication: global.__mockPromise(mockApplication)
                };

                const appDomain = applicationDomain({
                    'core.domain.permission.admin': mockAdminPermissionDomainNotAllowed as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.application': mockAppRepo as IApplicationRepo,
                    'core.utils': mockUtils as IUtils
                });

                await expect(
                    appDomain.saveApplication({
                        applicationData: {...mockApplication, endpoint: 'invalid_Endpoint'},
                        ctx: mockCtx
                    })
                ).rejects.toThrow(PermissionError);

                expect(mockAdminPermissionDomainNotAllowed.getAdminPermission.mock.calls[0][0].action).toBe(
                    AdminPermissionsActions.CREATE_APPLICATION
                );
            });
        });

        describe('Update', () => {
            test('Update an existing application', async () => {
                const mockAppRepo: Mockify<IApplicationRepo> = {
                    getApplications: global.__mockPromise({list: [mockApplication], totalCount: 1}),
                    createApplication: global.__mockPromise(mockApplication),
                    updateApplication: global.__mockPromise(mockApplication)
                };

                const appDomain = applicationDomain({
                    'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.application': mockAppRepo as IApplicationRepo,
                    'core.utils': mockUtils as IUtils
                });
                const createdApp = await appDomain.saveApplication({applicationData: mockApplication, ctx: mockCtx});

                expect(mockAppRepo.createApplication).not.toBeCalled();
                expect(mockAppRepo.updateApplication).toBeCalled();
                expect(createdApp).toEqual(mockApplication);
            });

            test('Throws if update is not allowed', async () => {
                const mockAppRepo: Mockify<IApplicationRepo> = {
                    getApplications: global.__mockPromise({list: [mockApplication], totalCount: 1}),
                    createApplication: global.__mockPromise(mockApplication),
                    updateApplication: global.__mockPromise(mockApplication)
                };

                const appDomain = applicationDomain({
                    'core.domain.permission.admin': mockAdminPermissionDomainNotAllowed as IAdminPermissionDomain,
                    'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                    'core.infra.application': mockAppRepo as IApplicationRepo,
                    'core.utils': mockUtils as IUtils
                });

                await expect(
                    appDomain.saveApplication({
                        applicationData: {...mockApplication, endpoint: 'invalid_Endpoint'},
                        ctx: mockCtx
                    })
                ).rejects.toThrow(PermissionError);

                expect(mockAdminPermissionDomainNotAllowed.getAdminPermission.mock.calls[0][0].action).toBe(
                    AdminPermissionsActions.EDIT_APPLICATION
                );
            });
        });

        describe('Settings validation', () => {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [], totalCount: 0}),
                createApplication: global.__mockPromise(mockApplication),
                updateApplication: global.__mockPromise(mockApplication)
            };

            test('Throws if ID is not valid', async () => {
                const mockUtilsInvalidID: Mockify<IUtils> = {
                    ...mockUtils,
                    isIdValid: jest.fn().mockReturnValue(false)
                };

                const appDomain = applicationDomain({
                    'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                    'core.infra.application': mockAppRepo as IApplicationRepo,
                    'core.utils': mockUtilsInvalidID as IUtils
                });

                await expect(
                    appDomain.saveApplication({
                        applicationData: {...mockApplication, id: 'invalid-id'},
                        ctx: mockCtx
                    })
                ).rejects.toThrow(ValidationError);
            });

            test('Throws if endpoint is not valid', async () => {
                const mockUtilsInvalidEndpoint: Mockify<IUtils> = {
                    ...mockUtils,
                    isEndpointValid: jest.fn().mockReturnValue(false)
                };
                const appDomain = applicationDomain({
                    'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                    'core.infra.application': mockAppRepo as IApplicationRepo,
                    'core.utils': mockUtilsInvalidEndpoint as IUtils
                });

                await expect(
                    appDomain.saveApplication({
                        applicationData: {...mockApplication, endpoint: 'invalid_Endpoint'},
                        ctx: mockCtx
                    })
                ).rejects.toThrow(ValidationError);
            });
        });
    });
    describe('deleteApplication', () => {
        test('Delete an application properties from its ID', async () => {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [mockApplication], totalCount: 1}),
                deleteApplication: global.__mockPromise(mockApplication)
            };

            const mockApplicationService: Mockify<IApplicationService> = {
                runUninstall: jest.fn()
            };

            const appDomain = applicationDomain({
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.application': mockAppRepo as IApplicationRepo,
                'core.infra.application.service': mockApplicationService as IApplicationService
            });
            const deletedApp = await appDomain.deleteApplication({id: mockApplication.id, ctx: mockCtx});

            expect(mockAppRepo.deleteApplication).toBeCalled();
            expect(mockApplicationService.runUninstall).toBeCalled();
            expect(deletedApp).toEqual(mockApplication);
        });

        test('Do not uninstall external application', async () => {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [mockApplicationExternal], totalCount: 1}),
                deleteApplication: global.__mockPromise(mockApplicationExternal)
            };

            const mockApplicationService: Mockify<IApplicationService> = {
                runUninstall: jest.fn()
            };

            const appDomain = applicationDomain({
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.application': mockAppRepo as IApplicationRepo,
                'core.infra.application.service': mockApplicationService as IApplicationService
            });
            await appDomain.deleteApplication({id: mockApplication.id, ctx: mockCtx});

            expect(mockAppRepo.deleteApplication).toBeCalled();
            expect(mockApplicationService.runUninstall).not.toBeCalled();
        });

        test("Throws if application doesn't exist", async () => {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [], totalCount: 0}),
                deleteApplication: global.__mockPromise(mockApplication)
            };

            const appDomain = applicationDomain({
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.application': mockAppRepo as IApplicationRepo
            });

            await expect(appDomain.deleteApplication({id: mockApplication.id, ctx: mockCtx})).rejects.toThrow(
                ValidationError
            );
        });

        test('Throws if deletion is not allowed', async () => {
            const mockAppRepo: Mockify<IApplicationRepo> = {
                getApplications: global.__mockPromise({list: [mockApplication], totalCount: 1}),
                deleteApplication: global.__mockPromise(mockApplication)
            };

            const appDomain = applicationDomain({
                'core.domain.permission.admin': mockAdminPermissionDomainNotAllowed as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.application': mockAppRepo as IApplicationRepo
            });

            await expect(appDomain.deleteApplication({id: mockApplication.id, ctx: mockCtx})).rejects.toThrow(
                PermissionError
            );

            expect(mockAdminPermissionDomainNotAllowed.getAdminPermission.mock.calls[0][0].action).toBe(
                AdminPermissionsActions.DELETE_APPLICATION
            );
        });
    });

    describe('updateConsulationHistory', () => {
        test('Save consulted app to history', async () => {
            const mockUserDomain: Mockify<IUserDomain> = {
                getUserData: global.__mockPromise({data: {[CONSULTED_APPS_KEY]: []}}),
                saveUserData: jest.fn()
            };

            const appDomain = applicationDomain({
                'core.domain.user': mockUserDomain as IUserDomain
            });

            await appDomain.updateConsultationHistory({
                applicationId: mockApplication.id,
                ctx: mockCtx
            });

            expect(mockUserDomain.saveUserData).toBeCalled();
            expect(mockUserDomain.saveUserData.mock.calls[0][0]).toMatchObject({
                key: CONSULTED_APPS_KEY,
                value: [mockApplication.id],
                global: false,
                isCoreData: true,
                ctx: mockCtx
            });
        });

        test('Dedup history', async () => {
            const mockUserDomain: Mockify<IUserDomain> = {
                getUserData: global.__mockPromise({
                    data: {
                        [CONSULTED_APPS_KEY]: ['some_app', 'another_app', mockApplication.id, 'last_app']
                    }
                }),
                saveUserData: jest.fn()
            };

            const appDomain = applicationDomain({
                'core.domain.user': mockUserDomain as IUserDomain
            });

            await appDomain.updateConsultationHistory({
                applicationId: mockApplication.id,
                ctx: mockCtx
            });

            expect(mockUserDomain.saveUserData).toBeCalled();
            expect(mockUserDomain.saveUserData.mock.calls[0][0]).toMatchObject({
                key: CONSULTED_APPS_KEY,
                value: [mockApplication.id, 'some_app', 'another_app', 'last_app'],
                global: false,
                isCoreData: true,
                ctx: mockCtx
            });
        });

        test('Limit history size', async () => {
            const mockUserDomain: Mockify<IUserDomain> = {
                getUserData: global.__mockPromise({
                    data: {
                        [CONSULTED_APPS_KEY]: new Array(MAX_CONSULTATION_HISTORY_SIZE).fill('').map((e, i) => i)
                    }
                }),
                saveUserData: jest.fn()
            };

            const appDomain = applicationDomain({
                'core.domain.user': mockUserDomain as IUserDomain
            });

            await appDomain.updateConsultationHistory({
                applicationId: mockApplication.id,
                ctx: mockCtx
            });

            expect(mockUserDomain.saveUserData).toBeCalled();
            expect(mockUserDomain.saveUserData.mock.calls[0][0].value[0]).toBe(mockApplication.id);
            expect(mockUserDomain.saveUserData.mock.calls[0][0].value).toHaveLength(MAX_CONSULTATION_HISTORY_SIZE);
        });
    });
});
