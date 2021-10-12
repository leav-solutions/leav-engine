// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {ViewSizes, ViewTypes} from '../../../_types/views';
import {VIEWS_COLLECTION_NAME} from '../../view/_types';
import {IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
}

export default function ({'core.infra.db.dbService': dbService = null}: IDeps) {
    return {
        async run(ctx) {
            const viewsCollec = dbService.db.collection(VIEWS_COLLECTION_NAME);

            await dbService.execute({
                query: aql`
                        FOR v IN ${viewsCollec}
                            UPDATE v WITH { 
                                type: null, 
                                display: v.display OR { type: ${ViewTypes.LIST}, size: ${ViewSizes.MEDIUM} } 
                            } IN ${viewsCollec} OPTIONS { keepNull: false }
                    `,
                ctx
            });
        }
    };
}
