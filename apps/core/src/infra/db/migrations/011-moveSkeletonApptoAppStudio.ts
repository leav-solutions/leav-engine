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

    const appStudioApplication: MigrationApplicationToCreate = {
        _key: 'app-studio',
        system: true,
        type: ApplicationTypes.INTERNAL,
        module: 'app-studio',
        label: {fr: 'À changer', en: 'REPLACE ME'},
        description: {fr: 'À changer', en: 'REPLACE ME'},
        endpoint: 'app-studio'
    };

    const _renameApplication = async (
        {from, to}: {from: MigrationApplicationToCreate; to: MigrationApplicationToCreate},
        ctx: IQueryInfos
    ) => {
        // Check if from app already exists
        const existingApp = await dbService.execute({
            query: aql`
                FOR app IN core_applications
                    FILTER app._key == ${from._key}
                    RETURN app
            `,
            ctx
        });

        // If not, create to app
        if (!existingApp.length) {
            await dbService.execute({
                query: aql`
                    INSERT ${to} INTO core_applications
                `,
                ctx
            });
        } else {
            to.settings = existingApp[0].settings;
            await dbService.execute({
                query: aql`
                    INSERT ${to} INTO core_applications
                `,
                ctx
            });
            await dbService.execute({
                query: aql`
                    REMOVE ${existingApp[0]} INTO core_applications
                `,
                ctx
            });
        }
    };

    return {
        async run(ctx) {
            await _renameApplication({from: skeletonApplication, to: appStudioApplication}, ctx);
        }
    };
}
