// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeCondition, TreeCondition} from '../../../_types/record';
import {mockAttrAdv, mockAttrAdvLink, mockAttrSimple} from '../../../__tests__/mocks/attribute';
import {type IFilterTypesHelper} from './filterTypes';
import getSearchVariableName from './getSearchVariableName';

describe('getSearchVariableName', () => {
    const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
        isAttributeFilter: vi.fn().mockImplementation(filter => !!filter.attributes),
        isCountFilter: vi
            .fn()
            .mockImplementation(filter =>
                [
                    AttributeCondition.VALUES_COUNT_EQUAL,
                    AttributeCondition.VALUES_COUNT_GREATER_THAN,
                    AttributeCondition.VALUES_COUNT_LOWER_THAN,
                    AttributeCondition.IS_EMPTY,
                    AttributeCondition.IS_NOT_EMPTY,
                ].includes(filter.condition as AttributeCondition),
            ),
        isClassifyingFilter: vi.fn().mockImplementation(filter => !!filter.treeId),
    };

    test('Return variable for standard filter (simple or advanced attribute)', async () => {
        const filter = {
            attributes: [
                {
                    ...mockAttrSimple,
                    reverse_link: null,
                },
            ],
            condition: AttributeCondition.EQUAL,
            value: 'foo',
        };

        const func = getSearchVariableName({
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
        });

        const variableName = func(filter);

        expect(variableName).toBe('simpleAttribute_Value');
    });

    test('Return variable for link filter (link or tree)', async () => {
        const filter = {
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
        };

        const func = getSearchVariableName({
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
        });

        const variableName = func(filter);

        expect(variableName).toBe('advLinkAttribute_advancedAttribute_Value');
    });

    test('Return variable for count filter', async () => {
        const filter = {
            attributes: [
                {
                    ...mockAttrSimple,
                    reverse_link: null,
                },
            ],
            condition: AttributeCondition.IS_EMPTY,
            value: null,
        };

        const func = getSearchVariableName({
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
        });

        const variableName = func(filter);

        expect(variableName).toBe('simpleAttribute_Count');
    });

    test('Return variable for count filter with multiple attributes', async () => {
        const filter = {
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
            condition: AttributeCondition.VALUES_COUNT_GREATER_THAN,
            value: '10',
        };

        const func = getSearchVariableName({
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
        });

        const variableName = func(filter);

        expect(variableName).toBe('advLinkAttribute_advancedAttribute_Count');
    });

    test('Return variable for classifying filter', async () => {
        const filter = {
            condition: TreeCondition.CLASSIFIED_IN,
            treeId: 'my_tree',
            value: '123456',
        };

        const func = getSearchVariableName({
            'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
        });

        const variableName = func(filter);

        expect(variableName).toBe('classified_myTree_123456');
    });
});
