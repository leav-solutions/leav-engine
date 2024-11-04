// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IAttributeTypeRepo, IAttributeTypesRepo} from 'infra/attributeTypes/attributeTypesRepo';
import {AttributeCondition, IRecordFilterOption, Operator, TreeCondition} from '../../../_types/record';
import {mockAttrAdv, mockAttrAdvLink, mockAttrSimple} from '../../../__tests__/mocks/attribute';
import {IFilterTypesHelper} from './filterTypes';
import getSearchVariablesQueryPart from './getSearchVariablesQueryPart';

describe('getSearchVariablesQueryPart', () => {
    test('Return list of unique variables for filters', async () => {
        const mockAttributeTypeRepo: Mockify<IAttributeTypeRepo> = {
            filterValueQueryPart: jest.fn().mockReturnValue(aql``)
        };

        const mockAttributeTypesRepo: Mockify<IAttributeTypesRepo> = {
            getTypeRepo: jest.fn().mockReturnValue(mockAttributeTypeRepo)
        };

        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isAttributeFilter: jest.fn().mockImplementation(filter => !!filter.attributes),
            isClassifyingFilter: jest.fn().mockImplementation(filter => !!filter.treeId)
        };

        const mockGetClassifyingFiltersVariableQueryPart = jest.fn().mockReturnValue(aql``);

        const mockGetSearchVariableName = jest
            .fn()
            .mockImplementation(filter => `${filter.attributes?.[0].id}_filterVariableName`);

        const filters: IRecordFilterOption[] = [
            {
                operator: Operator.OPEN_BRACKET
            },
            {
                attributes: [
                    {
                        ...mockAttrSimple,
                        reverse_link: null
                    }
                ],
                condition: AttributeCondition.EQUAL,
                value: 'foo'
            },
            {
                operator: Operator.OR
            },
            {
                attributes: [
                    {
                        ...mockAttrSimple,
                        reverse_link: null
                    }
                ],
                condition: AttributeCondition.EQUAL,
                value: 'bar'
            },
            {
                operator: Operator.CLOSE_BRACKET
            },
            {
                operator: Operator.AND
            },
            {
                operator: Operator.OPEN_BRACKET
            },
            {
                attributes: [
                    {
                        ...mockAttrAdvLink,
                        reverse_link: null
                    },
                    {
                        ...mockAttrAdv,
                        reverse_link: null
                    }
                ],
                condition: AttributeCondition.EQUAL,
                value: 'bax'
            },
            {
                operator: Operator.OR
            },
            {
                condition: TreeCondition.CLASSIFIED_IN,
                treeId: 'my_tree',
                value: '123456'
            },
            {
                operator: Operator.CLOSE_BRACKET
            },
            {
                operator: Operator.CLOSE_BRACKET
            }
        ];

        const func = getSearchVariablesQueryPart({
            'core.infra.attributeTypes': mockAttributeTypesRepo as IAttributeTypesRepo,
            'core.infra.record.helpers.getClassifyingFiltersVariableQueryPart':
                mockGetClassifyingFiltersVariableQueryPart,
            'core.infra.record.helpers.getSearchVariableName': mockGetSearchVariableName,
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper
        });

        const variables = func(filters);

        expect(mockAttributeTypeRepo.filterValueQueryPart).toHaveBeenCalledTimes(2);
        expect(mockGetClassifyingFiltersVariableQueryPart).toHaveBeenCalledTimes(1);

        expect(variables).toHaveLength(3);
    });
});
