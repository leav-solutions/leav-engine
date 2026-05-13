import {Database} from 'arangojs';
import {type IDbService} from '../../db/dbService';
import {TreeCondition} from '../../../_types/record';
import {type IFilterTypesHelper} from './filterTypes';
import getClassifyingFiltersVariableQueryPart from './getClassifyingFiltersVariableQueryPart';

describe('getClassifyingFiltersVariableQueryPart', () => {
    test('Return variable query part for classifying filters', async () => {
        const mockDbService: Mockify<IDbService> = {
            db: new Database(),
        };

        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isClassifyingFilter: vi.fn().mockReturnValue(true),
        };

        const func = getClassifyingFiltersVariableQueryPart({
            'core.infra.db.dbService': mockDbService as IDbService,
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
        });

        const queryPart = func({
            condition: TreeCondition.CLASSIFIED_IN,
            treeId: 'my_tree',
            value: '123456',
        });

        expect(queryPart).toMatchSnapshot();
        expect(queryPart.query).toMatch('OUTBOUND');
    });
});
