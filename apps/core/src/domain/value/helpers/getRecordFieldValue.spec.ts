// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogger} from '@leav/logger';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IRecordAttributePermissionDomain} from '../../permission/recordAttributePermissionDomain';
import {type GetValuesHelper} from './getValues';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ToAny} from '../../../utils/utils';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IValue} from '../../../_types/value';
import {mockAttrAdv, mockAttrSimple, mockAttrSimpleLink} from '../../../__tests__/mocks/attribute';
import {mockRecord} from '../../../__tests__/mocks/record';
import getRecordFieldValueFactory from './getRecordFieldValue';
import {type RunActionsListHelper} from './runActionsList';
import {type FormatValueHelper} from './formatValue';

const ctx: IQueryInfos = {
    userId: '1',
    queryId: 'getRecordFieldValueTest',
    lang: 'fr',
};

const mockRecordWithValues = {
    ...mockRecord,
    id: '12345',
    library: 'test_lib',
    created_at: 2119477320,
    created_by: '42',
};

const mockLibraryAttributes = [
    {...mockAttrSimple, id: 'simple_attr'},
    {...mockAttrAdv, id: 'advanced_attr'},
    {...mockAttrSimpleLink, id: 'link_attr', linked_library: 'users'},
];

const mockAttributeDomain: Mockify<IAttributeDomain> = {
    getLibraryAttributes: global.__mockPromise(mockLibraryAttributes),
    getAttributeProperties: global.__mockPromise({...mockAttrSimple, id: 'simple_attr'}),
};

const mockRecordAttributePermissionDomain: Mockify<IRecordAttributePermissionDomain> = {
    getRecordAttributePermission: global.__mockPromise(true),
};

const mockGetValuesHelper: Mockify<GetValuesHelper> = global.__mockPromise([]);

const mockRunActionsListHelper: RunActionsListHelper = jest.fn(async ({values}) => values);

const mockFormatValueHelper: FormatValueHelper = jest.fn(async ({attribute, value}) => ({
    ...value,
    attribute: attribute.id,
    payload:
        typeof value.payload === 'object' && value.payload !== null
            ? {...value.payload, library: value.payload.library ?? attribute.linked_library}
            : value.payload,
}));

const mockRecordRepo: Mockify<IRecordRepo> = {
    getRecord: global.__mockPromise(mockRecord),
};

const mockLogger: Mockify<ILogger> = {
    warn: jest.fn(),
    error: jest.fn(),
};

beforeEach(() => {
    jest.clearAllMocks();
});

const makeHelper = (overrides: Partial<ToAny<Parameters<typeof getRecordFieldValueFactory>[0]>> = {}) =>
    getRecordFieldValueFactory({
        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
        'core.domain.permission.recordAttribute':
            mockRecordAttributePermissionDomain as IRecordAttributePermissionDomain,
        'core.domain.value.helpers.getValues': mockGetValuesHelper as unknown as GetValuesHelper,
        'core.domain.value.helpers.runActionsList': mockRunActionsListHelper,
        'core.domain.value.helpers.formatValue': mockFormatValueHelper,
        'core.infra.record': mockRecordRepo as IRecordRepo,
        'core.utils.logger': mockLogger as ILogger,
        ...overrides,
    });

describe('getRecordFieldValue', () => {
    test('Should throw ValidationError if attribute does not belong to library', async () => {
        const getRecordFieldValue = makeHelper();

        await expect(
            getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'unknown_attr',
                ctx,
            }),
        ).rejects.toThrow();
    });

    test('Should return empty array if user has no permission on attribute', async () => {
        const mockNoPermissionDomain: Mockify<IRecordAttributePermissionDomain> = {
            getRecordAttributePermission: global.__mockPromise(false),
        };

        const getRecordFieldValue = makeHelper({
            'core.domain.permission.recordAttribute': mockNoPermissionDomain as IRecordAttributePermissionDomain,
        });

        const values = await getRecordFieldValue({
            library: 'test_lib',
            record: mockRecordWithValues,
            attributeId: 'simple_attr',
            ctx,
        });

        expect(values).toEqual([]);
    });

    test('Should return value present directly on record (SIMPLE attribute)', async () => {
        const getRecordFieldValue = makeHelper();

        const record = {...mockRecordWithValues, simple_attr: 'my_value'};
        const values = await getRecordFieldValue({
            library: 'test_lib',
            record,
            attributeId: 'simple_attr',
            ctx,
        });

        expect(Array.isArray(values)).toBe(true);
        expect(values[0].payload).toBe('my_value');
    });

    test('Should fetch value from DB when not present on record (ADVANCED attribute)', async () => {
        const mockAdvAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise(mockLibraryAttributes),
            getAttributeProperties: global.__mockPromise({...mockAttrAdv, id: 'advanced_attr'}),
        };

        const mockAdvGetValuesHelper = global.__mockPromise([{payload: 'db_value', id_value: '999'}]);

        const getRecordFieldValue = makeHelper({
            'core.domain.attribute': mockAdvAttrDomain as IAttributeDomain,
            'core.domain.value.helpers.getValues': mockAdvGetValuesHelper as unknown as GetValuesHelper,
        });

        const values = await getRecordFieldValue({
            library: 'test_lib',
            record: mockRecordWithValues,
            attributeId: 'advanced_attr',
            ctx,
        });

        expect(Array.isArray(values)).toBe(true);
        expect(values[0].payload).toBe('db_value');
    });

    test('Should return empty array when DB returns no values', async () => {
        const mockAdvAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise(mockLibraryAttributes),
            getAttributeProperties: global.__mockPromise({...mockAttrAdv, id: 'advanced_attr'}),
        };

        const getRecordFieldValue = makeHelper({
            'core.domain.attribute': mockAdvAttrDomain as IAttributeDomain,
        });

        const values = await getRecordFieldValue({
            library: 'test_lib',
            record: mockRecordWithValues,
            attributeId: 'advanced_attr',
            ctx,
        });

        expect(values).toEqual([]);
    });

    test('Should resolve SIMPLE_LINK attribute value from record', async () => {
        const linkedRecord = {...mockRecord, id: '42', library: 'users'};

        const mockLinkAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise(mockLibraryAttributes),
            getAttributeProperties: global.__mockPromise({
                ...mockAttrSimpleLink,
                id: 'link_attr',
                linked_library: 'users',
            }),
        };

        const mockLinkRecordRepo: Mockify<IRecordRepo> = {
            getRecord: global.__mockPromise(linkedRecord),
        };

        const mockLinkFormatValue: FormatValueHelper = jest.fn(async ({attribute, value}) => ({
            ...value,
            attribute: attribute.id,
            payload: {...(value.payload as object), library: attribute.linked_library},
        }));

        const getRecordFieldValue = makeHelper({
            'core.domain.attribute': mockLinkAttrDomain as IAttributeDomain,
            'core.infra.record': mockLinkRecordRepo as IRecordRepo,
            'core.domain.value.helpers.formatValue': mockLinkFormatValue,
        });

        const record = {...mockRecordWithValues, link_attr: '42'};
        const values = (await getRecordFieldValue({
            library: 'test_lib',
            record,
            attributeId: 'link_attr',
            ctx,
        })) as IValue[];

        expect(Array.isArray(values)).toBe(true);
        expect(values[0].payload.library).toBe('users');
    });

    test('Should return empty array when linked record is not found', async () => {
        const mockLinkAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise(mockLibraryAttributes),
            getAttributeProperties: global.__mockPromise({
                ...mockAttrSimpleLink,
                id: 'link_attr',
                linked_library: 'users',
            }),
        };

        const mockNotFoundRecordRepo: Mockify<IRecordRepo> = {
            getRecord: global.__mockPromise(null),
        };

        const getRecordFieldValue = makeHelper({
            'core.domain.attribute': mockLinkAttrDomain as IAttributeDomain,
            'core.infra.record': mockNotFoundRecordRepo as IRecordRepo,
        });

        const record = {...mockRecordWithValues, link_attr: '99999'};
        const values = await getRecordFieldValue({
            library: 'test_lib',
            record,
            attributeId: 'link_attr',
            ctx,
        });

        expect(values).toEqual([]);
        expect(mockLogger.warn).toHaveBeenCalled();
    });

    test('Should apply actions_list GET_VALUE on value', async () => {
        const mockAttrWithActions: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise(mockLibraryAttributes),
            getAttributeProperties: global.__mockPromise({
                ...mockAttrSimple,
                id: 'simple_attr',
                actions_list: {getValue: [{name: 'someAction'}]},
            }),
        };

        const mockRunActionsListWithResult: RunActionsListHelper = jest
            .fn()
            .mockResolvedValue([{payload: 'formatted_value', raw_payload: 'raw'}]);

        const getRecordFieldValue = makeHelper({
            'core.domain.attribute': mockAttrWithActions as IAttributeDomain,
            'core.domain.value.helpers.runActionsList': mockRunActionsListWithResult,
        });

        const record = {...mockRecordWithValues, simple_attr: 'raw'};
        const values = await getRecordFieldValue({
            library: 'test_lib',
            record,
            attributeId: 'simple_attr',
            ctx,
        });

        expect(mockRunActionsListWithResult).toHaveBeenCalled();
        expect(values[0].payload).toBe('formatted_value');
    });
});
