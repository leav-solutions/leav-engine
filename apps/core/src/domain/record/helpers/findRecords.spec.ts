import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IValidateHelper} from '../../helpers/validate';
import {type ILibraryPermissionDomain} from '../../permission/libraryPermissionDomain';
import {type ILibraryRepo} from '../../../infra/library/libraryRepo';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type IUtils, type ToAny} from '../../../utils/utils';
import {type IQueryInfos} from '../../../_types/queryInfos';
import PermissionError from '../../../errors/PermissionError';
import {AttributeFormats, AttributeTypes} from '../../../_types/attribute';
import {LibraryBehavior} from '../../../_types/library';
import {AttributeCondition} from '../../../_types/record';
import {mockAttrAdvLink, mockAttrSimple, mockAttrSimpleLink, mockAttrTree} from '../../../__tests__/mocks/attribute';
import {mockLibrary} from '../../../__tests__/mocks/library';
import {mockTree} from '../../../__tests__/mocks/tree';
import findRecordsHelper, {type IFindRecordsHelperDeps} from './findRecords';

const depsBase: ToAny<IFindRecordsHelperDeps> = {
    'core.infra.record': vi.fn(),
    'core.domain.attribute': vi.fn(),
    'core.domain.permission.library': vi.fn(),
    'core.domain.permission.helpers.defaultPermission': vi.fn(),
    'core.domain.helpers.getCoreEntityById': vi.fn(),
    'core.infra.library': vi.fn(),
    'core.infra.tree': vi.fn(),
    'core.domain.tree.helpers.elementAncestors': vi.fn(),
    'core.utils': vi.fn(),
    'core.infra.permission': vi.fn(),
    'core.domain.helpers.validate': vi.fn(),
};

describe('findRecordsHelper', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordDomainTest',
        lang: 'fr',
    };

    const mockValidateHelper: Mockify<IValidateHelper> = {
        validateLibrary: vi.fn().mockImplementation(libraryId => ({
            ...mockLibrary,
            behavior: libraryId === 'files' ? LibraryBehavior.FILES : LibraryBehavior.STANDARD,
            recordIdentityConf: {
                label: 'library_label',
                color: 'library_color',
                preview: 'library_preview',
                subLabel: 'library_subLabel',
            },
        })),
    };

    const mockUtils: Mockify<IUtils> = {
        translateError: vi.fn().mockReturnValue('mock error'),
        getRecordsCacheKey: vi.fn().mockReturnValue('cache_key'),
        getCoreEntityCacheKey: vi.fn().mockReturnValue('cache_key'),
        getPreviewsAttributeName: vi.fn().mockReturnValue('previews'),
        getPreviewUrl: vi.fn().mockImplementation(url => `/preview/${url}`),
        isLinkAttribute: vi.fn().mockReturnValue(false),
        isTreeAttribute: vi.fn().mockReturnValue(false),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('find', () => {
        const mockRes = {
            totalCount: 1,
            list: [
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999',
                },
            ],
        };

        const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
            getLibraryPermission: global.__mockPromise(true),
        };

        test('Should find records', async function () {
            const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;

            const findRecords = findRecordsHelper({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            });

            const findRes = await findRecords({params: {library: 'test_lib'}, ctx});

            expect(recRepo.find.mock.calls.length).toBe(1);
            expect(findRes.list).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999',
                },
            ]);
        });

        test('Find with a filter via extended attribute', async () => {
            const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    ...mockAttrSimple,
                    id: 'extended_attribute',
                    format: AttributeFormats.EXTENDED,
                }),
            };

            const findRecords = findRecordsHelper({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                'core.utils': mockUtils as IUtils,
            });

            await findRecords({
                params: {
                    library: 'test_lib',
                    filters: [
                        {
                            field: 'extended_attribute.sub_field.other_sub_field',
                            condition: AttributeCondition.CONTAINS,
                            value: 'some_filter',
                        },
                    ],
                },
                ctx,
            });

            expect(recRepo.find.mock.calls.length).toBe(1);
            const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
            expect(recRepoFilters[0].attributes.length).toBe(3);
            expect(recRepoFilters[0].attributes[0].id).toBe('extended_attribute');
            expect(recRepoFilters[0].attributes[1].id).toBe('sub_field');
            expect(recRepoFilters[0].attributes[2].id).toBe('other_sub_field');
        });

        test('If user cannot access library, return permission error', async () => {
            const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};
            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    ...mockAttrSimple,
                    id: 'extended_attribute',
                    format: AttributeFormats.EXTENDED,
                }),
            };

            const mockLibraryPermissionDomainForbidden: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(false),
            };

            const findRecords = findRecordsHelper({
                ...depsBase,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermissionDomainForbidden as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            });

            await expect(findRecords({params: {library: 'test_lib'}, ctx})).rejects.toThrow(PermissionError);
        });

        describe('Link attribute', () => {
            test('Find with a filter via link attribute', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute',
                        },
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute',
                        },
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute',
                        },
                    ]),
                };

                const findRecords = findRecordsHelper({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtils as IUtils,
                });

                await findRecords({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute.sub_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter',
                            },
                        ],
                    },
                    ctx,
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('sub_attribute');
            });

            test('If child attribute is not specified, search on linked library label', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute',
                        },
                        {
                            ...mockAttrSimple,
                            id: 'library_label',
                        },
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'library_label',
                        },
                    ]),
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'library_label',
                                    },
                                },
                            ],
                        },
                    ]),
                };

                const findRecords = findRecordsHelper({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtils as IUtils,
                });

                await findRecords({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter',
                            },
                        ],
                    },
                    ctx,
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('library_label');
            });

            test('If child attribute is a link, search on label', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute',
                        },
                        {
                            ...mockAttrAdvLink,
                            id: 'child_link_attribute',
                        },
                        {
                            ...mockAttrSimple,
                            id: 'child_library_label',
                        },
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'child_link_attribute',
                        },
                    ]),
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'child_link_attribute',
                                    },
                                },
                            ],
                        },
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'child_library_label',
                                    },
                                },
                            ],
                        },
                    ]),
                };

                const findRecords = findRecordsHelper({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtils as IUtils,
                });

                await findRecords({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute.child_link_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter',
                            },
                        ],
                    },
                    ctx,
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(3);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('child_link_attribute');
                expect(recRepoFilters[0].attributes[2].id).toBe('child_library_label');
            });
        });

        describe('Tree attribute', () => {
            test('Find with a filter via tree attribute', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute',
                        },
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute',
                        },
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute',
                        },
                    ]),
                };

                const findRecords = findRecordsHelper({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtils as IUtils,
                });

                await findRecords({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute.some_lib.sub_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter',
                            },
                        ],
                    },
                    ctx,
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('sub_attribute');
            });

            test('If child attribute is not specified, search on library label', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'first_label_attribute',
                                    },
                                },
                            ],
                        },
                    ]),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute',
                        },
                        {
                            ...mockAttrSimple,
                            id: 'first_label_attribute',
                        },
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute',
                        },
                    ]),
                };

                const findRecords = findRecordsHelper({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtils as IUtils,
                });

                await findRecords({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute.lib1',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter',
                            },
                        ],
                    },
                    ctx,
                });

                expect(recRepo.find.mock.calls.length).toBe(1);

                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('first_label_attribute');
            });

            test('If library is not specified, search on label of each tree libraries', async () => {
                const recRepo = {find: global.__mockPromise(mockRes)} satisfies Mockify<IRecordRepo>;

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: vi.fn().mockImplementation(({params}) =>
                        Promise.resolve(
                            params.filters.id === 'lib1'
                                ? {
                                      list: [
                                          {
                                              ...mockLibrary,
                                              id: 'lib1',
                                              recordIdentityConf: {
                                                  label: 'first_label_attribute',
                                              },
                                          },
                                      ],
                                  }
                                : {
                                      list: [
                                          {
                                              ...mockLibrary,
                                              id: 'lib2',
                                              recordIdentityConf: {
                                                  label: 'second_label_attribute',
                                              },
                                          },
                                      ],
                                  },
                        ),
                    ),
                };

                const mockTreeRepo: Mockify<ITreeRepo> = {
                    getTrees: global.__mockPromise({
                        list: [
                            {
                                ...mockTree,
                                id: 'my_tree',
                            },
                        ],
                    }),
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute',
                        },
                        {
                            ...mockAttrSimple,
                            id: 'first_label_attribute',
                        },
                        {
                            ...mockAttrSimple,
                            id: 'second_label_attribute',
                        },
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute',
                        },
                    ]),
                };

                const findRecords = findRecordsHelper({
                    ...depsBase,
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                    'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
                    'core.utils': mockUtils as IUtils,
                });

                await findRecords({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter',
                            },
                        ],
                    },
                    ctx,
                });

                expect(recRepo.find.mock.calls.length).toBe(1);

                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(3);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('first_label_attribute');
                expect(recRepoFilters[0].attributes[2].id).toBe('second_label_attribute');
            });
        });

        test('Should search records', async function () {
            const mockSearchRes = {
                totalCount: 1,
                list: [
                    {
                        id: 1,
                        library: 'test_lib',
                    },
                ],
            };

            const recRepo: Mockify<IRecordRepo> = {
                find: global.__mockPromise(mockSearchRes),
            };

            const libRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib', system: false}], totalCount: 1}),
            };

            const attributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'id',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT,
                }),
                getLibraryFullTextAttributes: global.__mockPromise(['id']),
            };

            const findRecords = findRecordsHelper({
                ...depsBase,
                'core.domain.attribute': attributeDomain as IAttributeDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.infra.library': libRepo as ILibraryRepo,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain,
                'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            });

            const findRes = await findRecords({
                params: {
                    library: 'test_lib',
                    fulltextSearch: 'text',
                },
                ctx,
            });

            expect(findRes).toEqual({
                totalCount: 1,
                list: [
                    {
                        id: 1,
                        library: 'test_lib',
                    },
                ],
            });
        });
    });
});
