// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDbService} from '../dbService';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}) {
    return {
        async run() {
            if (!(await dbService.collectionExists('core_forms'))) {
                await dbService.createCollection('core_forms');
            }
        }
    };
}
