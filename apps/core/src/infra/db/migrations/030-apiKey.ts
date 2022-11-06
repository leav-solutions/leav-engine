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
            if (!(await dbService.collectionExists('core_api_keys'))) {
                await dbService.createCollection('core_api_keys');
            }
        }
    };
}
