// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IGlobalSettingsRepo} from 'infra/globalSettings/globalSettingsRepo';
import {IGlobalSettings} from '_types/globalSettings';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import {AdminPermissionsActions} from '../../_types/permissions';
import {DEFAULT_APPLICATION} from '../../_constants/globalSettings';
import {IUtils} from '../../utils/utils';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';

export interface IGlobalSettingsDomain {
    saveSettings({settings, ctx}: {settings: IGlobalSettings; ctx: IQueryInfos}): Promise<IGlobalSettings>;
    getSettings(ctx: IQueryInfos): Promise<IGlobalSettings>;
}

export interface IGlobalSettingsDomainDeps {
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.globalSettings': IGlobalSettingsRepo;
    'core.infra.cache.cacheService': ICachesService;
    'core.utils': IUtils;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.infra.globalSettings': globalSettingsRepo,
    'core.infra.cache.cacheService': cacheService,
    'core.utils': utils
}: IGlobalSettingsDomainDeps): IGlobalSettingsDomain {
    const _getSettings = async (ctx: IQueryInfos) => {
        const _exec = async () => {
            const settings = await globalSettingsRepo.getSettings(ctx);

            return {
                name: settings.name,
                icon: settings.icon,
                favicon: settings.favicon,
                defaultApp: settings.defaultApp ?? DEFAULT_APPLICATION,
                settings: settings.settings
            };
        };

        const cacheKey = utils.getGlobalSettingsCacheKey();
        return cacheService.memoize({key: cacheKey, func: _exec, storeNulls: false, ctx});
    };

    return {
        async saveSettings({settings, ctx}) {
            const canSave = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.EDIT_GLOBAL_SETTINGS,
                userId: ctx.userId,
                ctx
            });

            if (!canSave) {
                throw new PermissionError(AdminPermissionsActions.EDIT_GLOBAL_SETTINGS);
            }

            const settingsBefore = await _getSettings(ctx);

            // Save settings
            const savedSettings = await globalSettingsRepo.saveSettings({settings, ctx});

            const cacheKey = utils.getGlobalSettingsCacheKey();
            await cacheService.getCache(ECacheType.RAM).deleteData([cacheKey]);

            await eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.GLOBAL_SETTINGS_SAVE,
                    topic: null,
                    before: settingsBefore,
                    after: savedSettings
                },
                ctx
            );

            return savedSettings;
        },
        getSettings: _getSettings
    };
}
