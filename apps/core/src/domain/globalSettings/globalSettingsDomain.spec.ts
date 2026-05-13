import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import {type IGlobalSettingsRepo} from '../../infra/globalSettings/globalSettingsRepo';
import PermissionError from '../../errors/PermissionError';
import {mockGlobalSettings} from '../../__tests__/mocks/globalSettings';
import {mockCtx} from '../../__tests__/mocks/shared';
import {default as globalSettingsDomain, type IGlobalSettingsDomainDeps} from './globalSettingsDomain';
import {type ToAny, type IUtils} from '../../utils/utils';
import {mockCachesService, mockCacheService} from '../../__tests__/mocks/cache';

const mockUtils: Mockify<IUtils> = {
    getGlobalSettingsCacheKey: vi.fn(() => 'globalSettingsCacheKey'),
};

const depsBase: ToAny<IGlobalSettingsDomainDeps> = {
    'core.domain.permission.admin': vi.fn(),
    'core.domain.eventsManager': vi.fn(),
    'core.infra.globalSettings': vi.fn(),
    'core.infra.cache.cacheService': mockCachesService,
    'core.utils': mockUtils,
};

describe('getSettingsRepo', () => {
    describe('saveSettings', () => {
        const mockGlobalSettingsRepo = {
            saveSettings: global.__mockPromise(mockGlobalSettings),
            getSettings: global.__mockPromise(mockGlobalSettings),
        } satisfies Mockify<IGlobalSettingsRepo>;

        const mockEventsManager: Mockify<IEventsManagerDomain> = {
            sendDatabaseEvent: global.__mockPromise(),
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('Should save settings', async () => {
            const mockAdminPermissionDomain: Mockify<IAdminPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true),
            };

            const domain = globalSettingsDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager,
                'core.infra.globalSettings': mockGlobalSettingsRepo,
            } as ToAny<IGlobalSettingsDomainDeps>);

            const savedSettings = await domain.saveSettings({settings: mockGlobalSettings, ctx: mockCtx});

            expect(mockGlobalSettingsRepo.saveSettings.mock.calls.length).toBe(1);
            expect(savedSettings).toMatchObject(mockGlobalSettings);
            expect(mockCacheService.deleteData).toHaveBeenCalled();
        });

        test('Should throw if no permission', async () => {
            const mockAdminPermissionDomain: Mockify<IAdminPermissionDomain> = {
                getAdminPermission: global.__mockPromise(false),
            };

            const domain = globalSettingsDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.globalSettings': mockGlobalSettingsRepo as IGlobalSettingsRepo,
            });

            expect(() => domain.saveSettings({settings: mockGlobalSettings, ctx: mockCtx})).rejects.toThrow(
                PermissionError,
            );
        });
    });

    describe('getSettings', () => {
        const mockGlobalSettingsRepo = {
            getSettings: global.__mockPromise(mockGlobalSettings),
        } satisfies Mockify<IGlobalSettingsRepo>;

        test('Should return settings', async () => {
            const domain = globalSettingsDomain({
                ...depsBase,
                'core.infra.globalSettings': mockGlobalSettingsRepo as IGlobalSettingsRepo,
            });

            const settings = await domain.getSettings(mockCtx);

            expect(mockGlobalSettingsRepo.getSettings.mock.calls.length).toBe(1);
            expect(settings).toMatchObject(mockGlobalSettings);
            expect(mockCachesService.memoize).toHaveBeenCalled();
        });
    });
});
