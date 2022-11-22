// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function({'core.infra.db.dbService': dbService = null}: IDeps): IMigration {
    return {
        async run(ctx) {
            // Change module for all apps based on explorer
            await dbService.execute({
                query: `
                FOR app IN core_applications
                    FILTER app.module == 'explorer'
                    UPDATE app WITH {module: 'data-studio'} IN core_applications
            `,
                ctx
            });

            // Rename explorer app
            await dbService.execute({
                query: `
                FOR app IN core_applications
                    FILTER app._key == 'explorer'
                    LET dataStudioApp = MERGE(app, {
                        _key: 'data-studio',
                        label: {fr: 'Data Studio', en: 'Data Studio'},
                        description: {
                            fr: 'Application générique pour gérer et explorer vos données',
                            en: 'Generic app to manage and explore your data'
                        },
                        endpoint: 'data-studio'
                    })
                    UPSERT {_key: 'data-studio'} INSERT dataStudioApp UPDATE dataStudioApp IN core_applications
            `,
                ctx
            });

            // Delete old explorer app
            await dbService.execute({
                query: `
                FOR app IN core_applications
                    FILTER app._key == 'explorer'
                    REMOVE app IN core_applications
                    RETURN OLD
            `,
                ctx
            });
        }
    };
}
