// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type IDbService} from '../dbService';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {ApplicationTypes, type IApplication} from '../../../_types/application';
import {APPLICATIONS_COLLECTION_NAME} from 'infra/application/applicationRepo';

type MigrationApplicationToCreate = IApplication & {
    _key: string;
};

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    const explorerStudioApplication: MigrationApplicationToCreate = {
        _key: 'explorer_studio',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'app-studio',
        label: {fr: 'Explorateur Studio', en: 'Explorer Studio'},
        description: {
            fr: 'Application générique pour gérer et explorer vos données',
            en: 'Generic app to manage and explore your data',
        },
        endpoint: 'explorer-studio',
        settings: {
            application: {
                workspaces: [],
            },
        },
    };

    const _createApplication = async (app: MigrationApplicationToCreate, ctx: IQueryInfos) => {
        const applicationsCol = dbService.db.collection(APPLICATIONS_COLLECTION_NAME);

        // Check if app already exists
        const existingApp = await dbService.execute({
            query: aql`
                    FOR app IN ${applicationsCol}
                        FILTER app._key == ${app._key}
                        RETURN app
                `,
            ctx,
        });

        // If not, create it
        if (!existingApp.length) {
            await dbService.execute({
                query: aql`INSERT ${app} INTO ${applicationsCol} RETURN NEW`,
                ctx,
            });
        }
    };

    return {
        async run(ctx) {
            await _createApplication(explorerStudioApplication, ctx);
        },
    };
}
