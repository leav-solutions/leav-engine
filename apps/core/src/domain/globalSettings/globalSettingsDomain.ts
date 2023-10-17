// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {IGlobalSettingsRepo} from 'infra/globalSettings/globalSettingsRepo';
import {IGlobalSettings} from '_types/globalSettings';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import {EventAction} from '../../_types/event';
import {AdminPermissionsActions} from '../../_types/permissions';

export interface IGlobalSettingsDomain {
    saveSettings({settings, ctx}: {settings: IGlobalSettings; ctx: IQueryInfos}): Promise<IGlobalSettings>;
    getSettings(ctx: IQueryInfos): Promise<IGlobalSettings>;
}

interface IDeps {
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.infra.globalSettings'?: IGlobalSettingsRepo;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.infra.globalSettings': globalSettingsRepo = null
}: IDeps = {}): IGlobalSettingsDomain {
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

            const settingsBefore = await globalSettingsRepo.getSettings(ctx);

            // Save settings
            const savedSettings = await globalSettingsRepo.saveSettings({settings, ctx});

            eventsManagerDomain.sendDatabaseEvent(
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
        async getSettings(ctx) {
            const settings = await globalSettingsRepo.getSettings(ctx);

            return {
                name: settings.name,
                icon: settings.icon
            };
        }
    };
}
