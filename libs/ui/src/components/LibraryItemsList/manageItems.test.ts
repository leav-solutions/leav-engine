// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {IField} from '_ui/types/search';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {IGetRecordsFromLibraryQueryElement} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {mockPreviews, mockRecord} from '_ui/__mocks__/common/record';
import {manageItems} from './manageItems';

export {};

describe('manageItems', () => {
    const mockItemBase: IGetRecordsFromLibraryQueryElement = {
        id: '123456',
        whoAmI: {
            ...mockRecord,
            id: '123456',
            label: 'record_label',
            library: {
                id: 'record_lib',
                label: {fr: 'Test Lib'}
            },
            preview: mockPreviews,
            color: '#123456'
        }
    };

    const mockField: IField = {
        id: 'myAttribute',
        library: 'test_lib',
        label: 'My field',
        type: AttributeType.simple,
        key: 'myAttribute'
    };

    test('Simple items with no fields', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [mockItemBase, mockItemBase];

        const res = manageItems({items: mockItems, fields: []});
        expect(res).toHaveLength(2);
        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {}
        });
        expect(res[1].index).toBe(2);
    });

    test('Simple field', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myAttribute: 'myValue'
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    type: AttributeType.simple
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myAttribute: 'myValue'
            }
        });
    });

    test('Field with multiple values', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myAttribute: ['myValue1', 'myValue2']
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    multipleValues: true,
                    type: AttributeType.simple
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myAttribute: ['myValue1', 'myValue2']
            }
        });
    });

    test('Simple field via link attribute', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myLinkAttribute: {
                    myAttribute: 'myValue'
                }
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    type: AttributeType.simple,
                    parentAttributeData: {
                        id: 'myLinkAttribute',
                        type: AttributeType.simple_link
                    }
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myAttribute: 'myValue'
            }
        });
    });

    test('Simple field via tree attribute', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myTreeAttribute: {
                    record: {
                        myAttribute: 'myValue'
                    }
                }
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    key: 'myTreeAttribute.test_lib.myAttribute',
                    type: AttributeType.simple,
                    parentAttributeData: {
                        id: 'myTreeAttribute',
                        type: AttributeType.tree
                    }
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                'myTreeAttribute.test_lib.myAttribute': 'myValue'
            }
        });
    });

    test('Advanced field with multiple values via link attribute', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myLinkAttribute: {
                    myAttribute: ['myValue1', 'myValue2']
                }
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    type: AttributeType.simple,
                    parentAttributeData: {
                        id: 'myLinkAttribute',
                        type: AttributeType.simple_link
                    }
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myAttribute: ['myValue1', 'myValue2']
            }
        });
    });

    test('Simple field via link attribute with multiple values', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myLinkAttribute: [
                    {
                        myAttribute: 'myValue1'
                    },
                    {
                        myAttribute: 'myValue2'
                    }
                ]
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    type: AttributeType.simple,
                    parentAttributeData: {
                        id: 'myLinkAttribute',
                        type: AttributeType.simple_link
                    }
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myAttribute: ['myValue1', 'myValue2']
            }
        });
    });

    test('Link attribute with no subfields', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myLinkAttribute: {
                    id: '1',
                    whoAmI: {...mockItemBase.whoAmI}
                }
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    id: 'myLinkAttribute',
                    key: 'myLinkAttribute',
                    type: AttributeType.simple_link
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myLinkAttribute: {id: '1', whoAmI: {...mockItemBase.whoAmI}}
            }
        });
    });

    test('Tree attribute with no subfields', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myTreeAttribute: {
                    id: '1',
                    whoAmI: {...mockItemBase.whoAmI}
                }
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    id: 'myTreeAttribute',
                    key: 'myTreeAttribute',
                    type: AttributeType.tree
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myTreeAttribute: {id: '1', whoAmI: {...mockItemBase.whoAmI}}
            }
        });
    });

    test('Extended attribute field', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myAttribute: '{"foo":"bar"}'
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    type: AttributeType.simple,
                    format: AttributeFormat.extended
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                myAttribute: '{"foo":"bar"}'
            }
        });
    });

    test('Extended attribute field, nested field', async () => {
        const mockItems: IGetRecordsFromLibraryQueryElement[] = [
            {
                ...mockItemBase,
                myAttribute: '{"foo":"bar"}'
            }
        ];

        const res = manageItems({
            items: mockItems,
            fields: [
                {
                    ...mockField,
                    key: 'myAttribute.foo',
                    type: AttributeType.simple,
                    format: AttributeFormat.extended
                }
            ]
        });

        expect(res[0]).toEqual({
            whoAmI: {...mockItemBase.whoAmI},
            index: 1,
            fields: {
                'myAttribute.foo': 'bar'
            }
        });
    });
});
