// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type IDbService} from '../dbService';
import {type IMigration} from '../../../_types/migration';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {ApplicationTypes, IApplication} from '../../../_types/application';

type MigrationApplicationToCreate = IApplication & {
    _key: string;
};

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    const skeletonApplication: MigrationApplicationToCreate = {
        _key: 'skeleton-app',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'skeleton-app',
        label: {fr: 'Mon application', en: 'My app'},
        description: {fr: 'Application métier', en: 'Business app'},
        endpoint: 'skeleton-app'
    };

    const _createApplication = async (app: MigrationApplicationToCreate, ctx: IQueryInfos) => {
        // Check if app already exists
        const existingApp = await dbService.execute({
            query: aql`
                    FOR app IN core_applications
                        FILTER app._key == ${app._key}
                        RETURN app
                `,
            ctx
        });

        // If not, create it
        if (!existingApp.length) {
            await dbService.execute({
                query: aql`INSERT ${app} INTO core_applications RETURN NEW`,
                ctx
            });
        }
    };

    return {
        async run(ctx) {
            await _createApplication(skeletonApplication, ctx);
        }
    };
}
