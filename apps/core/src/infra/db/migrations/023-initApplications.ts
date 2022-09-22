// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IApplicationService} from 'infra/application/applicationService';
import {IApplication} from '_types/application';
import {IDbService} from '../dbService';
import {IDbUtils} from '../dbUtils';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.db.dbUtils'?: IDbUtils;
    'core.infra.application.service'?: IApplicationService;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
    'core.infra.application.service': applicationService = null
}: IDeps = {}) {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists('core_applications'))) {
                await dbService.createCollection('core_applications');
            }

            const appsToInsert = [
                {
                    _key: 'admin',
                    system: true,
                    type: 'internal',
                    module: 'admin-app',
                    label: {fr: 'Administration', en: 'Administration'},
                    description: {fr: "Application d'administration", en: 'Administration app'},
                    endpoint: 'admin',
                    libraries: [],
                    trees: []
                },
                {
                    _key: 'explorer',
                    system: false,
                    type: 'internal',
                    module: 'explorer',
                    label: {fr: 'Explorateur', en: 'Explorer'},
                    description: {fr: 'Explorateur générique', en: 'Generic explorer'},
                    endpoint: 'explorer',
                    libraries: [],
                    trees: []
                },
                {
                    _key: 'login',
                    system: true,
                    type: 'internal',
                    module: 'login',
                    label: {fr: 'Login', en: 'Login'},
                    description: {fr: "Application d'authentification", en: 'Authentication app'},
                    endpoint: 'login',
                    libraries: [],
                    trees: []
                },
                {
                    _key: 'portal',
                    system: true,
                    type: 'internal',
                    module: 'portal',
                    label: {fr: 'Portail', en: 'Portal'},
                    description: {fr: "Portail d'accès à toutes les applications", en: 'All applications portal'},
                    endpoint: 'portal',
                    libraries: [],
                    trees: []
                }
            ];

            await Promise.all(
                appsToInsert.map(async app => {
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
                })
            );

            //Install Applications
            await applicationService.runInstallAll();
        }
    };
}
