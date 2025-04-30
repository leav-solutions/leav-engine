// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IGlobalSettingsRepo} from 'infra/globalSettings/globalSettingsRepo';
import PermissionError from '../../errors/PermissionError';
import {mockGlobalSettings} from '../../__tests__/mocks/globalSettings';
import {mockCtx} from '../../__tests__/mocks/shared';
import {default as globalSettingsDomain, IGlobalSettingsDomainDeps} from './globalSettingsDomain';
import {ToAny} from 'utils/utils';
import {Mockify} from '@leav/utils';
import {ICachesService} from '../../infra/cache/cacheService';
import {IAttributeDomainDeps} from '../attribute/attributeDomain';
import {mockCachesService, mockCacheService} from '../../__tests__/mocks/cache';
import {IUtils} from '../../utils/utils';

const mockUtils: Mockify<IUtils> = {
    getGlobalSettingsCacheKey: jest.fn(() => 'globalSettingsCacheKey')
};

const depsBase: ToAny<IGlobalSettingsDomainDeps> = {
    'core.domain.permission.admin': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.globalSettings': jest.fn(),
    'core.infra.cache.cacheService': mockCachesService,
    'core.utils': mockUtils
};

describe('getSettingsRepo', () => {
    describe('saveSettings', () => {
        const mockGlobalSettingsRepo = {
            saveSettings: global.__mockPromise(mockGlobalSettings),
            getSettings: global.__mockPromise(mockGlobalSettings)
        } satisfies Mockify<IGlobalSettingsRepo>;

        const mockEventsManager: Mockify<IEventsManagerDomain> = {
            sendDatabaseEvent: global.__mockPromise()
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Should save settings', async () => {
            const mockAdminPermissionDomain: Mockify<IAdminPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const domain = globalSettingsDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager,
                'core.infra.globalSettings': mockGlobalSettingsRepo
            } as ToAny<IGlobalSettingsDomainDeps>);

            const savedSettings = await domain.saveSettings({settings: mockGlobalSettings, ctx: mockCtx});

            expect(mockGlobalSettingsRepo.saveSettings.mock.calls.length).toBe(1);
            expect(savedSettings).toMatchObject(mockGlobalSettings);
            expect(mockCacheService.deleteData).toHaveBeenCalled();
        });

        test('Should throw if no permission', async () => {
            const mockAdminPermissionDomain: Mockify<IAdminPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false)
            };

            const domain = globalSettingsDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.globalSettings': mockGlobalSettingsRepo as IGlobalSettingsRepo
            });

            expect(() => domain.saveSettings({settings: mockGlobalSettings, ctx: mockCtx})).rejects.toThrow(
                PermissionError
            );
        });
    });

    describe('getSettings', () => {
        const mockGlobalSettingsRepo = {
            getSettings: global.__mockPromise(mockGlobalSettings)
        } satisfies Mockify<IGlobalSettingsRepo>;

        test('Should return settings', async () => {
            const domain = globalSettingsDomain({
                ...depsBase,
                'core.infra.globalSettings': mockGlobalSettingsRepo as IGlobalSettingsRepo
            });

            const settings = await domain.getSettings(mockCtx);

            expect(mockGlobalSettingsRepo.getSettings.mock.calls.length).toBe(1);
            expect(settings).toMatchObject(mockGlobalSettings);
            expect(mockCachesService.memoize).toHaveBeenCalled();
        });
    });
});
