// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Database} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {TreeCondition} from '../../../_types/record';
import {IFilterTypesHelper} from './filterTypes';
import getClassifyingFiltersVariableQueryPart from './getClassifyingFiltersVariableQueryPart';

describe('getClassifyingFiltersVariableQueryPart', () => {
    test('Return variable query part for classifying filters', async () => {
        const mockDbService: Mockify<IDbService> = {
            db: new Database()
        };

        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isClassifyingFilter: jest.fn().mockReturnValue(true)
        };

        const func = getClassifyingFiltersVariableQueryPart({
            'core.infra.db.dbService': mockDbService as IDbService,
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper
        });

        const queryPart = func({
            condition: TreeCondition.CLASSIFIED_IN,
            treeId: 'my_tree',
            value: '123456'
        });

        expect(queryPart).toMatchSnapshot();
        expect(queryPart.query).toMatch('OUTBOUND');
    });
});
