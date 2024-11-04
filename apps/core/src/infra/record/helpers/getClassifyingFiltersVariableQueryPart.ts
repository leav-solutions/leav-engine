// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {GeneratedAqlQuery, literal} from 'arangojs/aql';
import {IDbService} from 'infra/db/dbService';
import {IRecordFilterOption} from '_types/record';
import {getEdgesCollectionName, getFullNodeId, getRootId} from '../../../infra/tree/helpers/utils';
import {MAX_TREE_DEPTH} from '../../../infra/tree/treeRepo';
import {NODE_LIBRARY_ID_FIELD, NODE_RECORD_ID_FIELD} from '../../../infra/tree/_types';
import {IFilterTypesHelper} from './filterTypes';

interface IDeps {
    'core.infra.db.dbService'?: IDbService;
    'core.infra.record.helpers.filterTypes'?: IFilterTypesHelper;
}

export type GetClassifyingFiltersVariableQueryPart = (filter: IRecordFilterOption) => GeneratedAqlQuery;

export default function ({
    'core.infra.record.helpers.filterTypes': filterTypesHelper = null,
    'core.infra.db.dbService': dbService = null
}: IDeps): GetClassifyingFiltersVariableQueryPart {
    return filter => {
        if (!filterTypesHelper.isClassifyingFilter(filter)) {
            return null;
        }

        const collec = dbService.db.collection(getEdgesCollectionName(filter.treeId));

        const startingNode = filter.value
            ? getFullNodeId(String(filter.value), filter.treeId)
            : getRootId(filter.treeId);

        const queryPart = aql`
            FOR v, e IN 1..${MAX_TREE_DEPTH} OUTBOUND ${startingNode}
                ${collec}
                LET record = DOCUMENT(
                    v.${literal(NODE_LIBRARY_ID_FIELD)},
                    v.${literal(NODE_RECORD_ID_FIELD)}
                )
                RETURN record._id
        `;

        return queryPart;
    };
}
