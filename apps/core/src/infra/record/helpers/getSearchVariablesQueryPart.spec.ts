// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {type IAttributeTypeRepo, type IAttributeTypesRepo} from '../../attributeTypes/attributeTypesRepo';
import {AttributeCondition, type IRecordFilterOption, Operator, TreeCondition} from '../../../_types/record';
import {mockAttrAdv, mockAttrAdvLink, mockAttrSimple} from '../../../__tests__/mocks/attribute';
import {type IFilterTypesHelper} from './filterTypes';
import getSearchVariablesQueryPart from './getSearchVariablesQueryPart';

describe('getSearchVariablesQueryPart', () => {
    test('Return list of unique variables for filters', async () => {
        const mockAttributeTypeRepo: Mockify<IAttributeTypeRepo> = {
            filterValueQueryPart: vi.fn().mockReturnValue(aql``),
        };

        const mockAttributeTypesRepo: Mockify<IAttributeTypesRepo> = {
            getTypeRepo: vi.fn().mockReturnValue(mockAttributeTypeRepo),
        };

        const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
            isAttributeFilter: vi.fn().mockImplementation(filter => !!filter.attributes),
            isClassifyingFilter: vi.fn().mockImplementation(filter => !!filter.treeId),
        };

        const mockGetClassifyingFiltersVariableQueryPart = vi.fn().mockReturnValue(aql``);

        const mockGetSearchVariableName = vi
            .fn()
            .mockImplementation(filter => `${filter.attributes?.[0].id}_filterVariableName`);

        const filters: IRecordFilterOption[] = [
            {
                operator: Operator.OPEN_BRACKET,
            },
            {
                attributes: [
                    {
                        ...mockAttrSimple,
                        reverse_link: null,
                    },
                ],
                condition: AttributeCondition.EQUAL,
                value: 'foo',
            },
            {
                operator: Operator.OR,
            },
            {
                attributes: [
                    {
                        ...mockAttrSimple,
                        reverse_link: null,
                    },
                ],
                condition: AttributeCondition.EQUAL,
                value: 'bar',
            },
            {
                operator: Operator.CLOSE_BRACKET,
            },
            {
                operator: Operator.AND,
            },
            {
                operator: Operator.OPEN_BRACKET,
            },
            {
                attributes: [
                    {
                        ...mockAttrAdvLink,
                        reverse_link: null,
                    },
                    {
                        ...mockAttrAdv,
                        reverse_link: null,
                    },
                ],
                condition: AttributeCondition.EQUAL,
                value: 'bax',
            },
            {
                operator: Operator.OR,
            },
            {
                condition: TreeCondition.CLASSIFIED_IN,
                treeId: 'my_tree',
                value: '123456',
            },
            {
                operator: Operator.CLOSE_BRACKET,
            },
            {
                operator: Operator.CLOSE_BRACKET,
            },
        ];

        const func = getSearchVariablesQueryPart({
            'core.infra.attributeTypes': mockAttributeTypesRepo as IAttributeTypesRepo,
            'core.infra.record.helpers.getClassifyingFiltersVariableQueryPart':
                mockGetClassifyingFiltersVariableQueryPart,
            'core.infra.record.helpers.getSearchVariableName': mockGetSearchVariableName,
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
        });

        const variables = func(filters);

        expect(mockAttributeTypeRepo.filterValueQueryPart).toHaveBeenCalledTimes(2);
        expect(mockGetClassifyingFiltersVariableQueryPart).toHaveBeenCalledTimes(1);

        expect(variables).toHaveLength(3);
    });
});
