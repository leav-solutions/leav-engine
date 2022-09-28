// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IMigration} from '_types/migration';
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps): IMigration {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists('core_version_profiles'))) {
                await dbService.createCollection('core_version_profiles');
            }

            await dbService.execute({
                query: aql`
                    FOR a IN core_attributes
                        FILTER a.versions_conf != null
                        UPDATE a WITH {
                            versions_conf: {
                                mode: a.versions_conf.mode,
                                versionable: a.versions_conf.versionable,
                                trees: null,
                                profile: a.versions_conf.profile
                            }
                        } IN core_attributes
                        OPTIONS {keepNull: false}
                `,
                ctx
            });
        }
    };
}
