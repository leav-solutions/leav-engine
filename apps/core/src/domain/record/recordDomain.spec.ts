// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {ILibraryPermissionDomain} from 'domain/permission/libraryPermissionDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IStandardValue, IValue} from '_types/value';
import PermissionError from '../../errors/PermissionError';
import {getPreviewUrl} from '../../utils/preview/preview';
import {ActionsListEvents} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import {AttributeCondition, IRecord} from '../../_types/record';
import {mockAttrAdvLink, mockAttrSimple, mockAttrSimpleLink, mockAttrTree} from '../../__tests__/mocks/attribute';
import {mockLibrary} from '../../__tests__/mocks/library';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockTree} from '../../__tests__/mocks/tree';
import {mockStandardValue} from '../../__tests__/mocks/value';
import {IRecordPermissionDomain} from '../permission/recordPermissionDomain';
import recordDomain from './recordDomain';

const eventsManagerMockConfig: Mockify<Config.IEventsManager> = {routingKeys: {events: 'test.database.event'}};

const mockConfig: Mockify<Config.IConfig> = {
    eventsManager: eventsManagerMockConfig as Config.IEventsManager
};

describe('RecordDomain', () => {
    const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
        getRecordPermission: global.__mockPromise(true)
    };
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordDomainTest'
    };

    const mockUtils: Mockify<IUtils> = {
        isStandardAttribute: jest.fn().mockReturnValue(true),
        isLinkAttribute: jest.fn().mockReturnValue(false)
    };

    const mockUtilsLinkAttribute: Mockify<IUtils> = {
        isStandardAttribute: jest.fn().mockReturnValue(false),
        isLinkAttribute: jest.fn().mockReturnValue(true)
    };

    describe('createRecord', () => {
        test('Should create a new record', async function () {
            const createdRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 1519303348
            };
            const recRepo: Mockify<IRecordRepo> = {createRecord: global.__mockPromise(createdRecordData)};

            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getLibraryFullTextAttributes: global.__mockPromise([])
            };

            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };

            const recDomain = recordDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain
            });

            const createdRecord = await recDomain.createRecord('test', ctx);
            expect(recRepo.createRecord.mock.calls.length).toBe(1);
            expect(typeof recRepo.createRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][0].recordData.created_at)).toBe(true);
            expect(Number.isInteger(recRepo.createRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);
            expect(recRepo.createRecord.mock.calls[0][0].recordData.created_by).toBe('1');
            expect(recRepo.createRecord.mock.calls[0][0].recordData.modified_by).toBe('1');

            expect(createdRecord).toMatchObject(createdRecordData);
        });
    });

    describe('updateRecord', () => {
        test('Should update a record', async function () {
            const updatedRecordData = {
                id: '222435651',
                library: 'test',
                created_at: 1519303348,
                modified_at: 987654321
            };
            const recRepo: Mockify<IRecordRepo> = {updateRecord: global.__mockPromise(updatedRecordData)};

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain
            });

            const updatedRecord = await recDomain.updateRecord({
                library: 'test',
                recordData: {id: '222435651', modified_at: 987654321},
                ctx
            });

            expect(recRepo.updateRecord.mock.calls.length).toBe(1);
            expect(typeof recRepo.updateRecord.mock.calls[0][0]).toBe('object');
            expect(Number.isInteger(recRepo.updateRecord.mock.calls[0][0].recordData.modified_at)).toBe(true);

            expect(updatedRecord).toMatchObject(updatedRecordData);
        });
    });

    describe('deleteRecord', () => {
        const recordData = {id: '222435651', library: 'test', created_at: 1519303348, modified_at: 1519303348};

        test('Should delete an record and return deleted record', async function () {
            const recRepo: Mockify<IRecordRepo> = {
                deleteRecord: global.__mockPromise(recordData)
            };
            const recordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };
            const libRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test', system: false}], totalCount: 1})
                // getLibraryFullTextAttributes: global.__mockPromise([])
            };
            const mockEventsManager: Mockify<IEventsManagerDomain> = {
                send: global.__mockPromise()
            };

            const attrDomain: Mockify<IAttributeDomain> = {
                getAttributes: global.__mockPromise({totalCount: 0, list: []})
            };

            const recDomain = recordDomain({
                config: mockConfig as Config.IConfig,
                'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.infra.library': libRepo as ILibraryRepo,
                'core.domain.attribute': attrDomain as IAttributeDomain,
                'core.domain.permission.record': recordPermDomain as IRecordPermissionDomain
            });

            await recDomain.deleteRecord({library: 'test', id: recordData.id, ctx});

            expect(recRepo.deleteRecord.mock.calls.length).toBe(1);
        });

        // TODO: handle unknown record?
        // test('Should throw if unknown record', async function() {
        //     const mockLibRepo = {deleteRecord: global.__mockPromise(recordData)};
        //     const recDomain = recordDomain(mockLibRepo);

        //     await expect(recDomain.deleteRecord(recordData.id)).rejects.toThrow();
        // });
    });

    describe('find', () => {
        const mockRes = {
            totalCount: 1,
            list: [
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ]
        };

        const mockLibraryPermissionDomain: Mockify<ILibraryPermissionDomain> = {
            getLibraryPermission: global.__mockPromise(true)
        };

        test('Should find records', async function () {
            const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
            });

            const findRes = await recDomain.find({params: {library: 'test_lib'}, ctx});

            expect(recRepo.find.mock.calls.length).toBe(1);
            expect(findRes.list).toEqual([
                {
                    id: '222536515',
                    created_at: 1520931648,
                    modified_at: 1520931648,
                    ean: '9876543219999999'
                }
            ]);
        });

        test('Find with a filter via extended attribute', async () => {
            const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};
            const mockAttributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    ...mockAttrSimple,
                    id: 'extended_attribute',
                    format: AttributeFormats.EXTENDED
                })
            };

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
            });

            await recDomain.find({
                params: {
                    library: 'test_lib',
                    filters: [
                        {
                            field: 'extended_attribute.sub_field.other_sub_field',
                            condition: AttributeCondition.CONTAINS,
                            value: 'some_filter'
                        }
                    ]
                },
                ctx
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
                    format: AttributeFormats.EXTENDED
                })
            };

            const mockLibraryPermissionDomainForbidden: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(false)
            };

            const recDomain = recordDomain({
                'core.infra.record': recRepo as IRecordRepo,
                'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                'core.domain.permission.library': mockLibraryPermissionDomainForbidden as ILibraryPermissionDomain
            });

            await expect(recDomain.find({params: {library: 'test_lib'}, ctx})).rejects.toThrow(PermissionError);
        });

        describe('Link attribute', () => {
            test('Find with a filter via link attribute', async () => {
                const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute.sub_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('sub_attribute');
            });

            test('If child attribute is not specified, search on linked library label', async () => {
                const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'library_label'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'library_label'
                        }
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'library_label'
                                    }
                                }
                            ]
                        }
                    ])
                };

                const recDomain = recordDomain({
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('link_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('library_label');
            });

            test('If child attribute is a link, search on label', async () => {
                const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrSimpleLink,
                            id: 'link_attribute'
                        },
                        {
                            ...mockAttrAdvLink,
                            id: 'child_link_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'child_library_label'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'child_link_attribute'
                        }
                    ])
                };

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'child_link_attribute'
                                    }
                                }
                            ]
                        },
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'child_library_label'
                                    }
                                }
                            ]
                        }
                    ])
                };

                const recDomain = recordDomain({
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'link_attribute.child_link_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
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
                const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};
                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute.some_lib.sub_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);
                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('sub_attribute');
            });

            test('If child attribute is not specified, search on library label', async () => {
                const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: global.__mockPromiseMultiple([
                        {
                            list: [
                                {
                                    ...mockLibrary,
                                    id: 'lib1',
                                    recordIdentityConf: {
                                        label: 'first_label_attribute'
                                    }
                                }
                            ]
                        }
                    ])
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'first_label_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute.lib1',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
                });

                expect(recRepo.find.mock.calls.length).toBe(1);

                const {filters: recRepoFilters} = recRepo.find.mock.calls[0][0];
                expect(recRepoFilters[0].attributes.length).toBe(2);
                expect(recRepoFilters[0].attributes[0].id).toBe('tree_attribute');
                expect(recRepoFilters[0].attributes[1].id).toBe('first_label_attribute');
            });

            test('If library is not specified, search on label of each tree libraries', async () => {
                const recRepo: Mockify<IRecordRepo> = {find: global.__mockPromise(mockRes)};

                const mockLibraryRepo: Mockify<ILibraryRepo> = {
                    getLibraries: jest.fn().mockImplementation(({params}) => {
                        return Promise.resolve(
                            params.filters.id === 'lib1'
                                ? {
                                      list: [
                                          {
                                              ...mockLibrary,
                                              id: 'lib1',
                                              recordIdentityConf: {
                                                  label: 'first_label_attribute'
                                              }
                                          }
                                      ]
                                  }
                                : {
                                      list: [
                                          {
                                              ...mockLibrary,
                                              id: 'lib2',
                                              recordIdentityConf: {
                                                  label: 'second_label_attribute'
                                              }
                                          }
                                      ]
                                  }
                        );
                    })
                };

                const mockTreeRepo: Mockify<ITreeRepo> = {
                    getTrees: global.__mockPromise({
                        list: [
                            {
                                ...mockTree,
                                id: 'my_tree'
                            }
                        ]
                    })
                };

                const mockAttributeDomain: Mockify<IAttributeDomain> = {
                    getAttributeProperties: global.__mockPromiseMultiple([
                        {
                            ...mockAttrTree,
                            id: 'tree_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'first_label_attribute'
                        },
                        {
                            ...mockAttrSimple,
                            id: 'second_label_attribute'
                        }
                    ]),
                    getLibraryAttributes: global.__mockPromise([
                        {
                            ...mockAttrSimple,
                            id: 'sub_attribute'
                        }
                    ])
                };

                const recDomain = recordDomain({
                    'core.infra.record': recRepo as IRecordRepo,
                    'core.infra.library': mockLibraryRepo as ILibraryRepo,
                    'core.infra.tree': mockTreeRepo as ITreeRepo,
                    'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
                    'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
                });

                await recDomain.find({
                    params: {
                        library: 'test_lib',
                        filters: [
                            {
                                field: 'tree_attribute',
                                condition: AttributeCondition.CONTAINS,
                                value: 'some_filter'
                            }
                        ]
                    },
                    ctx
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
                        library: 'test_lib'
                    }
                ]
            };

            const recRepo: Mockify<IRecordRepo> = {
                find: global.__mockPromise(mockSearchRes),
                search: global.__mockPromise(mockSearchRes)
            };

            const libRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({list: [{id: 'test_lib', system: false}], totalCount: 1})
            };

            const attributeDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'id',
                    type: AttributeTypes.SIMPLE,
                    format: AttributeFormats.TEXT
                })
            };

            const recDomain = recordDomain({
                'core.domain.attribute': attributeDomain as IAttributeDomain,
                'core.infra.record': recRepo as IRecordRepo,
                'core.infra.library': libRepo as ILibraryRepo,
                'core.domain.permission.library': mockLibraryPermissionDomain as ILibraryPermissionDomain
            });

            const findRes = await recDomain.find({
                params: {
                    library: 'test_lib',
                    searchQuery: 'text'
                },
                ctx
            });

            expect(recRepo.search.mock.calls.length).toBe(1);
            expect(findRes).toEqual({
                totalCount: 1,
                list: [
                    {
                        id: 1,
                        library: 'test_lib'
                    }
                ]
            });
        });
    });

    describe('getRecordIdentity', () => {
        test('Return record identity', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const libData = {
                id: 'test_lib',
                recordIdentityConf: {
                    label: 'label_attr',
                    color: 'color_attr',
                    preview: 'preview_attr'
                }
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({totalCount: 1, list: [libData]})
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromiseMultiple([
                    [
                        {
                            value: 'Label Value'
                        }
                    ],
                    [
                        {
                            value: '#123456'
                        }
                    ],
                    [
                        {
                            value: {
                                small: 'small_fake-image',
                                medium: 'medium_fake-image',
                                big: 'big_fake-image'
                            }
                        }
                    ]
                ])
            };

            const recDomain = recordDomain({
                'core.domain.value': mockValDomain as IValueDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo
            });
            recDomain.getRecordFieldValue = jest.fn().mockImplementation(({attributeId}) =>
                Promise.resolve([
                    attributeId === 'previews'
                        ? {
                              raw_value: {
                                  small: 'small_fake-image',
                                  medium: 'medium_fake-image',
                                  big: 'big_fake-image'
                              }
                          }
                        : {
                              ...mockStandardValue,
                              value: {
                                  ...mockRecord,
                                  previews: {
                                      small: 'small_fake-image',
                                      medium: 'medium_fake-image',
                                      big: 'big_fake-image'
                                  }
                              }
                          }
                ])
            );

            const res = await recDomain.getRecordIdentity(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe('Label Value');
            expect(res.color).toBe('#123456');
            expect(res.preview).toEqual({
                big: getPreviewUrl() + 'big_fake-image',
                small: getPreviewUrl() + 'small_fake-image',
                medium: getPreviewUrl() + 'medium_fake-image',
                file: {
                    active: true,
                    created_at: 1234567890,
                    created_by: '1',
                    id: '123456',
                    library: 'my_lib',
                    modified_at: 1234567890,
                    modified_by: '1',
                    previews: {
                        big: 'big_fake-image',
                        medium: 'medium_fake-image',
                        small: 'small_fake-image'
                    }
                }
            });
        });

        test('Return minimum identity if no config', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                ean: '9876543219999999',
                visual_simple: '222713677'
            };

            const libData = {
                id: 'test_lib'
            };

            const mockLibRepo: Mockify<ILibraryRepo> = {
                getLibraries: global.__mockPromise({totalCount: 1, list: [libData]})
            };

            const mockValDomain: Mockify<IValueDomain> = {
                getValues: jest.fn()
            };

            const recDomain = recordDomain({
                'core.domain.value': mockValDomain as IValueDomain,
                'core.infra.library': mockLibRepo as ILibraryRepo
            });

            const res = await recDomain.getRecordIdentity(record, ctx);

            expect(res.id).toBe('222536283');
            expect(res.library).toMatchObject(libData);
            expect(res.label).toBe(null);
            expect(res.color).toBe(null);
            expect(res.preview).toBe(null);
        });
    });

    describe('getRecordFieldValue', () => {
        const mockRecordWithValues: IRecord = {
            ...mockRecord,
            id: '12345',
            library: 'test_lib',
            created_at: 2119477320,
            created_by: '42'
        };

        const mockValueDomainFormatValue: Mockify<IValueDomain> = {
            formatValue: jest.fn(({value, library}) => Promise.resolve(value))
        };

        test('Return a value present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false
                })
            };
            const recDomain = recordDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValue as IValueDomain,
                'core.utils': mockUtils as IUtils
            });

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                ctx
            });

            expect(Array.isArray(value)).toBe(false);
            expect((value as IValue).value).toBe(mockRecordWithValues.created_at);
        });

        test('Return a value not present on record', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'label',
                    type: AttributeTypes.ADVANCED,
                    multiple_values: true
                })
            };

            const mockValDomain: Mockify<IValueDomain> = {
                ...mockValueDomainFormatValue,
                getValues: global.__mockPromise([
                    {
                        id_value: 12345,
                        value: 'MyLabel'
                    }
                ])
            };
            const recDomain = recordDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValDomain as IValueDomain,
                'core.utils': mockUtils as IUtils
            });

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'label',
                ctx
            });

            expect(Array.isArray(value)).toBe(true);
            expect(value[0].value).toBe('MyLabel');
        });

        test('Return a formatted value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false,
                    actions_list: {
                        [ActionsListEvents.GET_VALUE]: [{name: 'formatDate', params: [{format: 'D/M/YY HH:mm'}]}]
                    }
                })
            };

            const mockALDomain: Mockify<IActionsListDomain> = {
                runActionsList: global.__mockPromise({value: '1/3/37 00:42'})
            };

            const mockValueDomainFormatValueDate: Mockify<IValueDomain> = {
                formatValue: jest.fn(({value}) =>
                    Promise.resolve({...value, raw_value: value.value, value: '1/3/37 00:42'})
                )
            };

            const recDomain = recordDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.actionsList': mockALDomain as IActionsListDomain,
                'core.domain.value': mockValueDomainFormatValueDate as IValueDomain,
                'core.utils': mockUtils as IUtils
            });

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                ctx
            });

            expect((value as IValue).value).toBe('1/3/37 00:42');
            expect((value as IStandardValue).raw_value).toBe(2119477320);
        });

        test('Return a link value', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_by',
                    type: AttributeTypes.SIMPLE_LINK,
                    linked_library: 'users',
                    multiple_values: false
                })
            };

            const mockValueDomainFormatValueLink: Mockify<IValueDomain> = {
                formatValue: jest.fn(({value, library}) =>
                    Promise.resolve({value: {...mockRecord, id: mockRecord.created_by, library: 'users'}})
                )
            };

            const recDomain = recordDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValueLink as IValueDomain,
                'core.utils': mockUtilsLinkAttribute as IUtils
            });

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_by',
                ctx
            });

            expect((value as IValue).value.id).toBe('42');
            expect((value as IValue).value.library).toBe('users');
        });

        test('If force array, return an array', async () => {
            const mockAttrDomain: Mockify<IAttributeDomain> = {
                getAttributeProperties: global.__mockPromise({
                    id: 'created_at',
                    type: AttributeTypes.SIMPLE,
                    multiple_values: false
                })
            };
            const recDomain = recordDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.value': mockValueDomainFormatValue as IValueDomain,
                'core.utils': mockUtils as IUtils
            });

            const value = await recDomain.getRecordFieldValue({
                library: 'test_lib',
                record: mockRecordWithValues,
                attributeId: 'created_at',
                options: {forceArray: true},
                ctx
            });

            expect(Array.isArray(value)).toBe(true);
            expect((value as IValue)[0].value).toBe(2119477320);
        });
    });

    describe('Deactivate record', () => {
        test('Set active to false on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: true
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: false})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(false);
            expect(recordAfter.active).toBe(false);
        });
    });

    describe('Activate record', () => {
        test('Set active to true on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: false
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: true})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, ctx);

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(typeof mockValueDomain.saveValue.mock.calls[0][0]).toBe('object');
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(true);

            expect(recordAfter.active).toBe(true);
        });
    });

    describe('Deactivate record', () => {
        test('Set active to false on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: true
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: false})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.deactivateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(false);
            expect(recordAfter.active).toBe(false);
        });
    });

    describe('Activate record', () => {
        test('Set active to true on record', async () => {
            const record = {
                id: '222536283',
                library: 'test_lib',
                created_at: 1520931427,
                modified_at: 1520931427,
                active: false
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: global.__mockPromise({value: true})
            };

            const recDomain = recordDomain({'core.domain.value': mockValueDomain as IValueDomain});

            const recordAfter = await recDomain.activateRecord(record, {userId: '1'});

            expect(mockValueDomain.saveValue).toBeCalled();
            expect(mockValueDomain.saveValue.mock.calls[0][0].attribute).toBe('active');
            expect(mockValueDomain.saveValue.mock.calls[0][0].value.value).toBe(true);
            expect(recordAfter.active).toBe(true);
        });
    });
});
