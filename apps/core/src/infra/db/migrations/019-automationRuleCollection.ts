// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type IMigration} from '../../../_types/migration';
import {CollectionType} from 'arangojs/collection';
import {type IDbService} from '../dbService';
import {AUTOMATION_RULES_COLLECTION_NAME} from '../../automation/automationRuleRepo';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            if (!(await dbService.collectionExists(AUTOMATION_RULES_COLLECTION_NAME))) {
                await dbService.createCollection(AUTOMATION_RULES_COLLECTION_NAME, CollectionType.DOCUMENT_COLLECTION);
            }
        },
    };
}
