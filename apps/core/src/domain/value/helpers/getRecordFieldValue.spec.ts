import {type ILogger} from '@leav/logger';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IRecordAttributePermissionDomain} from '../../permission/recordAttributePermissionDomain';
import {type GetValuesHelper} from './getValues';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ToAny} from '../../../utils/utils';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IStandardValue, type IValueVersion, type IValue} from '../../../_types/value';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
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

const mockRunActionsListHelper: RunActionsListHelper = vi.fn(async ({values}) => values);

const mockFormatValueHelper: FormatValueHelper = vi.fn(async ({attribute, value}) => ({
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
    warn: vi.fn(),
    error: vi.fn(),
};

beforeEach(() => {
    vi.clearAllMocks();
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
                attributePath: 'unknown_attr',
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
            attributePath: 'simple_attr',
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
            attributePath: 'simple_attr',
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
            attributePath: 'advanced_attr',
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
            attributePath: 'advanced_attr',
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

        const mockLinkFormatValue: FormatValueHelper = vi.fn(async ({attribute, value}) => ({
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
            attributePath: 'link_attr',
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
            attributePath: 'link_attr',
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

        const mockRunActionsListWithResult: RunActionsListHelper = vi
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
            attributePath: 'simple_attr',
            ctx,
        });

        expect(mockRunActionsListWithResult).toHaveBeenCalled();
        expect(values[0].payload).toBe('formatted_value');
    });

    describe('deep attributePath', () => {
        const linkAttr = {...mockAttrSimpleLink, id: 'link_attr', linked_library: 'users'};
        const loginAttr = {...mockAttrSimple, id: 'login'};

        const makeDeepAttrDomain = (): IAttributeDomain =>
            ({
                getLibraryAttributes: vi.fn(async (library: string) =>
                    library === 'users' ? [loginAttr] : mockLibraryAttributes,
                ),
                getAttributeProperties: vi.fn(async ({id}: {id: string}) => {
                    if (id === 'link_attr') {
                        return linkAttr;
                    }
                    if (id === 'login') {
                        return loginAttr;
                    }
                    return {...mockAttrSimple, id};
                }),
            }) as unknown as IAttributeDomain;

        test('Should traverse a SIMPLE_LINK path and return the terminal attribute values', async () => {
            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': makeDeepAttrDomain(),
                'core.domain.value.helpers.getValues': global.__mockPromise([
                    {payload: 'john'},
                ]) as unknown as GetValuesHelper,
            });

            const record = {...mockRecordWithValues, link_attr: '42'};
            const values = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'link_attr.login',
                ctx,
            });

            expect(values).toHaveLength(1);
            expect(values[0].payload).toBe('john');
        });

        test('Should flatten values across a multivalued link', async () => {
            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': makeDeepAttrDomain(),
                'core.domain.value.helpers.getValues': vi.fn(async ({attribute, recordId}) => {
                    if (attribute === 'link_attr') {
                        return [{payload: {id: '42'}}, {payload: {id: '43'}}];
                    }
                    if (attribute === 'login') {
                        return [{payload: `login_${recordId}`}];
                    }
                    return [];
                }) as unknown as GetValuesHelper,
            });

            const values = await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributePath: 'link_attr.login',
                ctx,
            });

            expect(values.map(v => v.payload)).toEqual(['login_42', 'login_43']);
        });

        test('Should return empty array when permission is denied on an intermediate hop', async () => {
            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': makeDeepAttrDomain(),
                'core.domain.permission.recordAttribute': {
                    getRecordAttributePermission: vi.fn(async (_action, attributeId) => attributeId !== 'login'),
                } as unknown as IRecordAttributePermissionDomain,
                'core.domain.value.helpers.getValues': global.__mockPromise([
                    {payload: 'john'},
                ]) as unknown as GetValuesHelper,
            });

            const record = {...mockRecordWithValues, link_attr: '42'};
            const values = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'link_attr.login',
                ctx,
            });

            expect(values).toEqual([]);
        });

        test('Should throw when traversing into a non-link, non-extended attribute', async () => {
            const getRecordFieldValue = makeHelper();

            const record = {...mockRecordWithValues, simple_attr: 'my_value'};
            await expect(
                getRecordFieldValue({
                    library: 'test_lib',
                    record,
                    attributePath: 'simple_attr.sub',
                    ctx,
                }),
            ).rejects.toThrow();
        });

        test('Should navigate sub-fields of an EXTENDED attribute', async () => {
            const extAttr = {...mockAttrSimple, id: 'ext_attr', format: AttributeFormats.EXTENDED};

            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': {
                    getLibraryAttributes: global.__mockPromise([extAttr]),
                    getAttributeProperties: global.__mockPromise(extAttr),
                } as unknown as IAttributeDomain,
            });

            const record = {...mockRecordWithValues, ext_attr: '{"a":{"b":"deep"}}'};
            const values = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'ext_attr.a.b',
                ctx,
            });

            expect(values).toHaveLength(1);
            expect(values[0].payload).toBe('deep');
        });

        test('Should navigate "from" / "to" sub-fields of a DATE_RANGE attribute', async () => {
            const dateRangeAttr = {...mockAttrSimple, id: 'date_range_attr', format: AttributeFormats.DATE_RANGE};

            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': {
                    getLibraryAttributes: global.__mockPromise([dateRangeAttr]),
                    getAttributeProperties: global.__mockPromise(dateRangeAttr),
                } as unknown as IAttributeDomain,
            });

            const record = {...mockRecordWithValues, date_range_attr: {from: 'F', to: 'T'}};

            const fromValues = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'date_range_attr.from',
                ctx,
            });
            expect(fromValues).toHaveLength(1);
            expect(fromValues[0].payload).toBe('F');

            const toValues = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'date_range_attr.to',
                ctx,
            });
            expect(toValues[0].payload).toBe('T');
        });

        test('Should navigate raw_payload of an EXTENDED attribute, even when payload is a JSON string', async () => {
            const extAttr = {...mockAttrSimple, id: 'ext_attr', format: AttributeFormats.EXTENDED};

            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': {
                    getLibraryAttributes: global.__mockPromise([extAttr]),
                    getAttributeProperties: global.__mockPromise(extAttr),
                } as unknown as IAttributeDomain,
                // Mimic the real GET_VALUE pipeline of an extended attribute: raw_payload keeps the
                // object, `toJSON` turns payload into a JSON string. Both must be navigated.
                'core.domain.value.helpers.runActionsList': (async ({values}) =>
                    values.map(value => ({
                        ...value,
                        raw_payload: value.payload,
                        payload: JSON.stringify(value.payload),
                    }))) as RunActionsListHelper,
            });

            const record = {...mockRecordWithValues, ext_attr: {a: {b: 'deep'}}};
            const values = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'ext_attr.a.b',
                ctx,
            });

            expect(values).toHaveLength(1);
            expect(values[0].payload).toBe('deep');
            expect((values[0] as IStandardValue).raw_payload).toBe('deep');
        });

        test('Should navigate raw_payload of a DATE_RANGE attribute', async () => {
            const dateRangeAttr = {...mockAttrSimple, id: 'date_range_attr', format: AttributeFormats.DATE_RANGE};

            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': {
                    getLibraryAttributes: global.__mockPromise([dateRangeAttr]),
                    getAttributeProperties: global.__mockPromise(dateRangeAttr),
                } as unknown as IAttributeDomain,
                'core.domain.value.helpers.runActionsList': (async ({values}) =>
                    values.map(value => ({...value, raw_payload: value.payload}))) as RunActionsListHelper,
            });

            const record = {...mockRecordWithValues, date_range_attr: {from: 1000, to: 2000}};
            const values = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'date_range_attr.from',
                ctx,
            });

            expect(values).toHaveLength(1);
            expect(values[0].payload).toBe(1000);
            expect((values[0] as IStandardValue).raw_payload).toBe(1000);
        });

        test('Should leave raw_payload absent when the value carries none', async () => {
            const dateRangeAttr = {...mockAttrSimple, id: 'date_range_attr', format: AttributeFormats.DATE_RANGE};

            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': {
                    getLibraryAttributes: global.__mockPromise([dateRangeAttr]),
                    getAttributeProperties: global.__mockPromise(dateRangeAttr),
                } as unknown as IAttributeDomain,
            });

            const record = {...mockRecordWithValues, date_range_attr: {from: 1000, to: 2000}};
            const values = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'date_range_attr.to',
                ctx,
            });

            expect(values[0].payload).toBe(2000);
            expect(values[0]).not.toHaveProperty('raw_payload');
        });

        test('Should return an empty array when the requested sub-field does not exist', async () => {
            const dateRangeAttr = {...mockAttrSimple, id: 'date_range_attr', format: AttributeFormats.DATE_RANGE};

            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': {
                    getLibraryAttributes: global.__mockPromise([dateRangeAttr]),
                    getAttributeProperties: global.__mockPromise(dateRangeAttr),
                } as unknown as IAttributeDomain,
            });

            const record = {...mockRecordWithValues, date_range_attr: {from: 1000, to: 2000}};
            const values = await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'date_range_attr.unknown_sub_field',
                ctx,
            });

            expect(values).toEqual([]);
        });

        test('Should propagate options (version) through each hop', async () => {
            const version: IValueVersion = {some_tree: 'node1'};
            const mockGetValues = vi.fn(async () => [{payload: 'john'}]);

            const getRecordFieldValue = makeHelper({
                'core.domain.attribute': makeDeepAttrDomain(),
                'core.domain.value.helpers.getValues': mockGetValues as unknown as GetValuesHelper,
            });

            const record = {...mockRecordWithValues, link_attr: '42'};
            await getRecordFieldValue({
                library: 'test_lib',
                record,
                attributePath: 'link_attr.login',
                options: {version},
                ctx,
            });

            expect(mockGetValues).toHaveBeenCalledWith(expect.objectContaining({options: {version}}));
        });

        const treeAttr = {...mockAttrSimple, id: 'tree_attr', type: AttributeTypes.TREE, linked_tree: 'some_tree'};
        const labelAttr = {...mockAttrSimple, id: 'label'};

        const makeTreeHelper = (treeValues: IValue[], libraryAttributesByLib: Record<string, unknown[]>) =>
            makeHelper({
                'core.domain.attribute': {
                    getLibraryAttributes: vi.fn(async (library: string) => libraryAttributesByLib[library] ?? []),
                    getAttributeProperties: vi.fn(async ({id}: {id: string}) =>
                        id === 'tree_attr' ? treeAttr : labelAttr,
                    ),
                } as unknown as IAttributeDomain,
                'core.domain.value.helpers.getValues': vi.fn(async ({attribute}) => {
                    if (attribute === 'tree_attr') {
                        return treeValues;
                    }
                    if (attribute === 'label') {
                        return [{payload: 'tree label'}];
                    }
                    return [];
                }) as unknown as GetValuesHelper,
            });

        test("Should traverse a TREE path reading the attribute on the node's linked record", async () => {
            const getRecordFieldValue = makeTreeHelper(
                [{payload: {id: 'node1', record: {id: 'r1', library: 'tree_lib'}}}],
                {
                    test_lib: [treeAttr],
                    tree_lib: [labelAttr],
                },
            );

            const values = await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributePath: 'tree_attr.label',
                ctx,
            });

            expect(values).toHaveLength(1);
            expect(values[0].payload).toBe('tree label');
        });

        test('Should return empty array when the node record library does not have the attribute', async () => {
            const getRecordFieldValue = makeTreeHelper(
                [{payload: {id: 'node1', record: {id: 'r1', library: 'tree_lib'}}}],
                {
                    test_lib: [treeAttr],
                    tree_lib: [], // library has no 'label' attribute → recursion throws, caught → []
                },
            );

            const values = await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributePath: 'tree_attr.label',
                ctx,
            });

            expect(values).toEqual([]);
        });

        test('Should flatten only readable values across a multivalued tree (mixed libraries)', async () => {
            const getRecordFieldValue = makeTreeHelper(
                [
                    {payload: {id: 'node1', record: {id: 'r1', library: 'tree_lib'}}},
                    {payload: {id: 'node2', record: {id: 'r2', library: 'other_lib'}}},
                ],
                {
                    test_lib: [treeAttr],
                    tree_lib: [labelAttr],
                    other_lib: [], // no 'label' attribute → skipped
                },
            );

            const values = await getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributePath: 'tree_attr.label',
                ctx,
            });

            expect(values.map(v => v.payload)).toEqual(['tree label']);
        });
    });
});
