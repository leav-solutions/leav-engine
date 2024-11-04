// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {IGlobalSettings} from '_types/globalSettings';
import {IQueryInfos} from '_types/queryInfos';

export interface IGlobalSettingsRepo {
    saveSettings({settings, ctx}: {settings: IGlobalSettings; ctx: IQueryInfos}): Promise<IGlobalSettings>;
    getSettings(ctx: IQueryInfos): Promise<IGlobalSettings>;
}

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

const GLOBAL_SETTINGS_COLLECTION = 'core_global_settings';

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IGlobalSettingsRepo {
    const settingsKey = '1';
    return {
        async saveSettings({settings, ctx}) {
            const collec = dbService.db.collection(GLOBAL_SETTINGS_COLLECTION);
            const settingsToSave = {_key: settingsKey, ...settings};

            const savedSettings = await dbService.execute<IGlobalSettings[]>({
                query: aql`UPSERT {_key: ${settingsKey}}
                    INSERT ${settingsToSave}
                    UPDATE ${settingsToSave}
                    IN ${collec}
                    RETURN NEW
                `,
                ctx
            });

            return {
                name: savedSettings?.[0]?.name ?? null,
                icon: savedSettings?.[0]?.icon ?? null,
                favicon: savedSettings?.[0]?.favicon ?? null
            };
        },
        async getSettings(ctx) {
            const collec = dbService.db.collection(GLOBAL_SETTINGS_COLLECTION);

            const settings = await dbService.execute<IGlobalSettings[]>({
                query: aql`
                    FOR s IN ${collec}
                        FILTER s._key == ${settingsKey}
                        RETURN s
                `,
                ctx
            });

            return {
                name: settings?.[0]?.name ?? null,
                icon: settings?.[0]?.icon ?? null,
                favicon: settings?.[0]?.favicon ?? null
            };
        }
    };
}
