// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type ToAny} from 'utils/utils';
import {type IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../../_types/attribute';
import {type IRecord} from '../../../_types/record';
import {mockAttrSimple, mockAttrSimpleLink} from '../../../__tests__/mocks/attribute';
import getRecordFieldValueHelper, {type IGetRecordFieldValueHelperDeps} from './getRecordFieldValue';
import {mockRecord} from '../../../__tests__/mocks/record';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type IStandardValue, type IValue} from '../../../_types/value';
import {ActionsListEvents} from '../../../_types/actionsList';
import {type IRecordAttributePermissionDomain} from '../../permission/recordAttributePermissionDomain';

const depsBase: ToAny<IGetRecordFieldValueHelperDeps> = {
    'core.domain.attribute': jest.fn(),
    'core.domain.value': jest.fn(),
    'core.domain.permission.recordAttribute': jest.fn(),
};

describe('getRecordFieldValueHelper', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordDomainTest',
        lang: 'fr',
    };

    const mockRecordAttributePermissionDomain: Mockify<IRecordAttributePermissionDomain> = {
        getRecordAttributePermission: global.__mockPromise(true),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getRecordFieldValueHelper', () => {
        const mockRecordWithValues: IRecord = {
            ...mockRecord,
            id: '12345',
            library: 'test_lib',
            created_at: 2119477320,
            created_by: '42',
        };

        const mockValueDomainFormatValue: Mockify<IValueDomain> = {
            formatValue: jest.fn(({value}) => Promise.resolve(value)),
            runActionsList: jest.fn(() => Promise.resolve([{payload: 2119477320}])),
        };

        const mockAttributeDomainCommon: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([
                {
                    ...mockAttrSimpleLink,
                    id: 'created_at',
                },
                {
                    ...mockAttrSimple,
                    id: 'label',
                },
                {
                    ...mockAttrSimpleLink,
                    id: 'created_by',
                },
            ]),
        };

        test('Return a value present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false,
                }),
            };

            const getRecordFieldValue = getRecordFieldValueHelper({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValue as IValueDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
            });

            const values = (await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                ctx,
            })) as IValue[];

            expect(Array.isArray(values)).toBe(true);
            expect(values[0].payload).toBe(mockRecordWithValues.created_at);
        });

        test('Return a value not present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'label',
                    type: AttributeTypes.ADVANCED,
                    multiple_values: true,
                }),
            };

            const mockValDomain: Mockify<IValueDomain> = {
                ...mockValueDomainFormatValue,
                getValues: global.__mockPromise([
                    {
                        id_value: 12345,
                        payload: 'MyLabel',
                    },
                ]),
            };
            const getRecordFieldValue = getRecordFieldValueHelper({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValDomain as IValueDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
            });

            const values = await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'label',
                ctx,
            });

            expect(Array.isArray(values)).toBe(true);
            expect(values[0].payload).toBe('MyLabel');
        });

        test('Return a formatted value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false,
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [{name: 'formatDate', params: [{format: 'D/M/YY HH:mm'}]}],
                    },
                }),
            };

            const mockValueDomainFormatValueDate: Mockify<IValueDomain> = {
                formatValue: jest.fn(({value}) =>
                    Promise.resolve({...value, raw_payload: 2119477320, payload: '1/3/37 00:42'}),
                ),
                runActionsList: jest.fn(() => Promise.resolve([{payload: '1/3/37 00:42', raw_payload: 2119477320}])),
            };

            const getRecordFieldValue = getRecordFieldValueHelper({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValueDate as IValueDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
            });

            const values = (await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                ctx,
            })) as IStandardValue[];

            expect(values[0].payload).toBe('1/3/37 00:42');
            expect(values[0].raw_payload).toBe(2119477320);
        });

        test('Return a link value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_by',
                    type: AttributeTypes.SIMPLE_LINK,
                    linked_library: 'users',
                    multiple_values: false,
                }),
            };

            const mockValueDomainFormatValueLink: Mockify<IValueDomain> = {
                formatValue: jest.fn(() =>
                    Promise.resolve({payload: {...mockRecord, id: mockRecordWithValues.created_by, library: 'users'}}),
                ),
                runActionsList: jest.fn((_, value) => Promise.resolve([value])),
            };

            const getRecordFieldValue = getRecordFieldValueHelper({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValueLink as IValueDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
            });

            const values = (await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_by',
                ctx,
            })) as IValue[];

            expect(values[0].payload.id).toBe('42');
            expect(values[0].payload.library).toBe('users');
        });

        test('If force array, return an array', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false,
                }),
            };
            const getRecordFieldValue = getRecordFieldValueHelper({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValue as IValueDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
            });

            const values = (await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                options: {forceArray: true},
                ctx,
            })) as IValue[];

            expect(Array.isArray(values)).toBe(true);
            expect(values[0].payload).toBe(2119477320);
        });

        test('If no permission on record for attribute, return an empty array', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                ...mockAttributeDomainCommon,
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false,
                }),
            };

            const mockRecordAttributeNoPermissionDomain: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: global.__mockPromise(false),
            };

            const getRecordFieldValue = getRecordFieldValueHelper({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValue as IValueDomain,
                'core.domain.permission.recordAttribute':
                    mockRecordAttributeNoPermissionDomain as IRecordAttributePermissionDomain,
            });

            const values = (await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                ctx,
            })) as IValue[];

            expect(Array.isArray(values)).toBe(true);
            expect(values.length).toBe(0);
        });
    });
});
