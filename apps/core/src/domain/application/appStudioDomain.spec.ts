// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IPermissionDomain} from 'domain/permission/permissionDomain';
import {type IApplication} from '../../_types/application';
import {LibraryPermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../_types/permissions';
import {mockApplication} from '../../__tests__/mocks/application';
import {mockCtx} from '../../__tests__/mocks/shared';
import appStudioDomain, {type IAppStudioDomainDeps} from './appStudioDomain';

describe('appStudioDomain', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('getAppStudioSettings', () => {
        test('Should return appStudioSettings extracted from settings.application', async () => {
            const mockApplicationWithWorkspaces = {
                ...mockApplication,
                settings: {
                    application: {
                        workspaces: [
                            {id: 'workspace-1', type: 'library', libraryId: 'lib1'},
                            {id: 'workspace-2', type: 'library', libraryId: 'lib2'},
                        ],
                    },
                },
            };

            const mockPermissionDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true),
            };

            const domain = appStudioDomain({
                'core.domain.permission': mockPermissionDomain as IPermissionDomain,
            });

            const result = await domain.getAppStudioSettings({
                application: mockApplicationWithWorkspaces as IApplication,
                ctx: mockCtx,
            });

            expect(result).toBeDefined();
            expect(result.workspaces).toHaveLength(2);
        });

        test('Should return empty object when settings.application is undefined', async () => {
            const mockApplicationWithoutSettings = {
                ...mockApplication,
                settings: undefined,
            };

            const mockPermissionDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true),
            };

            const domain = appStudioDomain({
                'core.domain.permission': mockPermissionDomain as IPermissionDomain,
            });

            const result = await domain.getAppStudioSettings({
                application: mockApplicationWithoutSettings as IApplication,
                ctx: mockCtx,
            });

            expect(result).toEqual({});
        });

        test('Should filter library workspaces based on ACCESS_LIBRARY permission', async () => {
            const mockApplicationWithWorkspaces = {
                ...mockApplication,
                settings: {
                    application: {
                        workspaces: [
                            {id: 'workspace-allowed', type: 'library', libraryId: 'allowed-lib'},
                            {id: 'workspace-denied', type: 'library', libraryId: 'denied-lib'},
                        ],
                    },
                },
            };

            const mockPermissionDomain: Mockify<IPermissionDomain> = {
                isAllowed: jest.fn().mockImplementation(({type, applyTo}) => {
                    if (type === PermissionTypes.LIBRARY && applyTo === 'allowed-lib') {
                        return Promise.resolve(true);
                    }
                    return Promise.resolve(false);
                }),
            };

            const domain = appStudioDomain({
                'core.domain.permission': mockPermissionDomain,
            } as IAppStudioDomainDeps);

            const result = await domain.getAppStudioSettings({
                application: mockApplicationWithWorkspaces as IApplication,
                ctx: mockCtx,
            });

            expect(result.workspaces).toHaveLength(1);
            expect(result.workspaces[0].id).toBe('workspace-allowed');

            expect(mockPermissionDomain.isAllowed).toHaveBeenCalledWith({
                type: PermissionTypes.LIBRARY,
                action: LibraryPermissionsActions.ACCESS_LIBRARY,
                applyTo: 'allowed-lib',
                ctx: mockCtx,
            });
            expect(mockPermissionDomain.isAllowed).toHaveBeenCalledWith({
                type: PermissionTypes.LIBRARY,
                action: LibraryPermissionsActions.ACCESS_LIBRARY,
                applyTo: 'denied-lib',
                ctx: mockCtx,
            });
        });

        test('Should filter record workspaces based on ACCESS_RECORD permission', async () => {
            const mockApplicationWithWorkspaces = {
                ...mockApplication,
                settings: {
                    application: {
                        workspaces: [
                            {
                                id: 'workspace-allowed',
                                type: 'record',
                                libraryId: 'lib1',
                                recordId: 'allowed-record',
                            },
                            {id: 'workspace-denied', type: 'record', libraryId: 'lib1', recordId: 'denied-record'},
                        ],
                    },
                },
            };

            const mockPermissionDomain: Mockify<IPermissionDomain> = {
                isAllowed: jest.fn().mockImplementation(({type, target}) => {
                    if (type === PermissionTypes.RECORD && target?.recordId === 'allowed-record') {
                        return Promise.resolve(true);
                    }
                    return Promise.resolve(false);
                }),
            };

            const domain = appStudioDomain({
                'core.domain.permission': mockPermissionDomain,
            } as IAppStudioDomainDeps);

            const result = await domain.getAppStudioSettings({
                application: mockApplicationWithWorkspaces as IApplication,
                ctx: mockCtx,
            });

            expect(result.workspaces).toHaveLength(1);
            expect(result.workspaces[0].id).toBe('workspace-allowed');

            expect(mockPermissionDomain.isAllowed).toHaveBeenCalledWith({
                type: PermissionTypes.RECORD,
                action: RecordPermissionsActions.ACCESS_RECORD,
                applyTo: 'lib1',
                target: {recordId: 'allowed-record'},
                ctx: mockCtx,
            });
            expect(mockPermissionDomain.isAllowed).toHaveBeenCalledWith({
                type: PermissionTypes.RECORD,
                action: RecordPermissionsActions.ACCESS_RECORD,
                applyTo: 'lib1',
                target: {recordId: 'denied-record'},
                ctx: mockCtx,
            });
        });
    });
});
