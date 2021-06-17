// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, Database} from 'arangojs';
import {IDbService} from 'infra/db/dbService';
import {IDbUtils} from 'infra/db/dbUtils';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';
import {IValue} from '../../_types/value';
import attributeAdvancedLinkRepo from './attributeAdvancedLinkRepo';

describe('AttributeAdvancedLinkRepo', () => {
    const mockAttribute = {
        id: 'test_adv_link_attr',
        type: AttributeTypes.ADVANCED_LINK,
        linked_library: 'test_linked_lib',
        multiple_values: true
    };

    const savedEdgeData = {
        _id: 'core_edge_values_links/222435651',
        _rev: '_WSywvyC--_',
        _from: 'test_lib/12345',
        _to: 'test_linked_lib/987654',
        _key: '978654321',
        attribute: 'test_adv_link_attr',
        modified_at: 400999999,
        created_at: 400999999,
        modified_by: '0',
        created_by: '0',
        metadata: {my_attribute: 'metadata value'},
        version: {
            my_tree: {
                id: '1',
                library: 'test_lib'
            }
        }
    };

    const valueData: IValue = {
        id_value: '978654321',
        value: 987654,
        attribute: 'test_adv_link_attr',
        modified_at: 400999999,
        created_at: 400999999,
        modified_by: '0',
        created_by: '0'
    };

    const mockDbUtils: Mockify<IDbUtils> = {
        convertValueVersionToDb: jest.fn().mockReturnValue({my_tree: 'test_lib/1'}),
        convertValueVersionFromDb: jest.fn().mockReturnValue({
            my_tree: {
                id: '1',
                library: 'test_lib'
            }
        })
    };

    const mockUtils: Mockify<IUtils> = {
        decomposeValueEdgeDestination: jest.fn().mockReturnValue({library: 'test_linked_lib', id: '987654'})
    };

    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'AttributeAdvancedLinkRepoTest'
    };

    describe('createValue', () => {
        test('Should create a new advanced link value', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([savedEdgeData])
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.utils': mockUtils as IUtils
            });

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    value: 987654,
                    modified_at: 400999999,
                    created_at: 400999999,
                    metadata: {my_attribute: 'metadata value'},
                    version: {
                        my_tree: {
                            id: '1',
                            library: 'test_lib'
                        }
                    }
                },
                ctx
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject({
                id_value: '978654321',
                value: {
                    library: 'test_linked_lib',
                    id: '987654'
                },
                attribute: 'test_adv_link_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'},
                version: {
                    my_tree: {
                        id: '1',
                        library: 'test_lib'
                    }
                }
            });
        });
    });

    describe('updateValue', () => {
        test('Should update a advanced link value', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([savedEdgeData])
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtils as IDbUtils,
                'core.utils': mockUtils as IUtils
            });

            const savedVal = await attrRepo.updateValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '987654',
                    value: 987654,
                    modified_at: 400999999,
                    metadata: {my_attribute: 'metadata value'},
                    version: {
                        my_tree: {
                            id: '1',
                            library: 'test_lib'
                        }
                    }
                },
                ctx
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(savedVal).toMatchObject({
                ...valueData,
                value: {
                    library: 'test_linked_lib',
                    id: '987654'
                },
                metadata: {my_attribute: 'metadata value'},
                version: {
                    my_tree: {
                        id: '1',
                        library: 'test_lib'
                    }
                }
            });
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function () {
            const deletedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'test_linked_lib/987654',
                _key: '445566'
            };

            const mockDbServ: Mockify<IDbService> = {
                db: new Database(),
                execute: global.__mockPromise([deletedEdgeData])
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.utils': mockUtils as IUtils
            });

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '445566',
                    value: 987654,
                    modified_at: 400999999,
                    created_at: 400999999
                },
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/REMOVE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(deletedVal).toMatchObject({
                id_value: '445566',
                value: {
                    id: '987654',
                    library: 'test_linked_lib'
                }
            });
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function () {
            const traversalRes = [
                {
                    linkedRecord: {
                        _key: '123456',
                        _id: 'images/123456',
                        _rev: '_WgJhrXO--_',
                        created_at: 88888,
                        modified_at: 88888
                    },
                    edge: {
                        _key: '112233',
                        _id: 'core_edge_values_links/112233',
                        _from: 'ubs/222536283',
                        _to: 'images/123456',
                        _rev: '_WgJilsW--_',
                        attribute: 'test_adv_link_attr',
                        modified_at: 99999,
                        created_at: 99999,
                        modified_by: '0',
                        created_by: '0',
                        metadata: {my_attribute: 'metadata value'}
                    }
                }
            ];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest.fn().mockReturnValueOnce({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const value = await attrRepo.getValueById({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '112233',
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();
            expect(value).toMatchObject({
                id_value: '112233',
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                attribute: 'test_adv_link_attr',
                metadata: {my_attribute: 'metadata value'}
            });
        });

        test("Should return null if value doesn't exists", async function () {
            const traversalRes = [];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedLinkRepo({'core.infra.db.dbService': mockDbServ});

            const value = await attrRepo.getValueById({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '112233',
                ctx
            });

            expect(value).toBeNull();
        });
    });
    describe('getValues', () => {
        const traversalRes = [
            {
                linkedRecord: {
                    _key: '123456',
                    _id: 'images/123456',
                    _rev: '_WgJhrXO--_',
                    created_at: 88888,
                    modified_at: 88888
                },
                edge: {
                    _key: '112233',
                    _id: 'core_edge_values_links/112233',
                    _from: 'ubs/222536283',
                    _to: 'images/123456',
                    _rev: '_WgJilsW--_',
                    attribute: 'test_adv_link_attr',
                    modified_at: 99999,
                    created_at: 99999,
                    modified_by: '0',
                    created_by: '0',
                    metadata: {my_attribute: 'metadata value'}
                }
            },
            {
                linkedRecord: {
                    _key: '123457',
                    _id: 'images/123457',
                    _rev: '_WgJhrXO--_',
                    created_at: 77777,
                    modified_at: 77777
                },
                edge: {
                    _key: '112234',
                    _id: 'core_edge_values_links/112234',
                    _from: 'ubs/222536283',
                    _to: 'images/123457',
                    _rev: '_WgJilsW--_',
                    attribute: 'test_adv_link_attr',
                    modified_at: 66666,
                    created_at: 66666,
                    modified_by: '0',
                    created_by: '0',
                    metadata: {my_attribute: 'metadata value'}
                }
            }
        ];

        test('Should return values for advanced link attribute', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 77777,
                    modified_at: 77777
                });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttribute,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values.length).toBe(2);
            expect(values[0]).toMatchObject({
                id_value: '112233',
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                attribute: 'test_adv_link_attr',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'}
            });

            expect(values[1]).toMatchObject({
                id_value: '112234',
                value: {
                    id: 123457,
                    created_at: 77777,
                    modified_at: 77777
                },
                attribute: 'test_adv_link_attr',
                modified_at: 66666,
                created_at: 66666,
                modified_by: '0',
                created_by: '0'
            });
        });

        test('Should return values filtered by version', async function () {
            const traversalResWithVers = [
                {
                    linkedRecord: {
                        _key: '123457',
                        _id: 'images/123457',
                        _rev: '_WgJhrXO--_',
                        created_at: 77777,
                        modified_at: 77777
                    },
                    edge: {
                        _key: '112233',
                        _id: 'core_edge_values_links/112234',
                        _from: 'ubs/222536283',
                        _to: 'images/123457',
                        _rev: '_WgJilsW--_',
                        attribute: 'test_adv_link_attr',
                        modified_at: 66666,
                        created_at: 66666,
                        modified_by: '0',
                        created_by: '0',
                        version: {
                            my_tree: 'my_lib/1345'
                        }
                    }
                }
            ];
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalResWithVers)
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttribute,
                forceGetAllValues: false,
                options: {
                    version: {
                        my_tree: {library: 'my_lib', id: '1345'}
                    }
                },
                ctx
            });

            expect(values.length).toBe(1);
            expect(values[0].id_value).toBe('112233');
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('FILTER edge.version');
        });

        test('Should return only first value if not multiple attribute', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise([traversalRes[0]])
            };

            const mockCleanupRes = jest.fn().mockReturnValue({
                id: 123456,
                created_at: 88888,
                modified_at: 88888
            });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const mockAttributeNotMultiVal = {
                ...mockAttribute,
                multiple_values: false
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttributeNotMultiVal,
                ctx
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch('LIMIT 1');
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(values.length).toBe(1);
            expect(values[0]).toMatchObject({
                id_value: '112233',
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                attribute: 'test_adv_link_attr',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0'
            });
        });

        test('Should return all values if forced', async function () {
            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const mockCleanupRes = jest
                .fn()
                .mockReturnValueOnce({
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                })
                .mockReturnValueOnce({
                    id: 123457,
                    created_at: 77777,
                    modified_at: 77777
                });

            const mockDbUtilsWithCleanup = {
                ...mockDbUtils,
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo({
                'core.infra.db.dbService': mockDbServ,
                'core.infra.db.dbUtils': mockDbUtilsWithCleanup as IDbUtils
            });

            const mockAttrNotMultival = {
                ...mockAttribute,
                multiple_values: false
            };

            const values = await attrRepo.getValues({
                library: 'test_lib',
                recordId: '123456',
                attribute: mockAttrNotMultival,
                forceGetAllValues: true,
                ctx
            });

            expect(values.length).toBe(2);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
        });
    });
    describe('filterQueryPart', () => {
        test('Should return advanced link filter', () => {
            const mockDbServ = {
                db: new Database()
            };
            const attrRepo = attributeAdvancedLinkRepo({'core.infra.db.dbService': mockDbServ});
            const filter = attrRepo.filterQueryPart(
                [
                    {id: 'label', type: AttributeTypes.ADVANCED_LINK},
                    {id: 'linked', type: AttributeTypes.SIMPLE}
                ],
                aql`== ${'MyLabel'}`,
                0
            );

            expect(filter.query).toMatch(/^FILTER/);
            expect(filter).toMatchSnapshot();
        });
    });
    describe('sortQueryPart', () => {
        test('Should return advanced link sort', () => {
            const mockDbServ = {
                db: new Database()
            };
            const attrRepo = attributeAdvancedLinkRepo({'core.infra.db.dbService': mockDbServ});
            const filter = attrRepo.sortQueryPart({
                attributes: [
                    {id: 'label', type: AttributeTypes.ADVANCED_LINK},
                    {id: 'linked', type: AttributeTypes.SIMPLE}
                ],
                order: 'ASC'
            });

            expect(filter.query).toMatch(/^SORT/);
            expect(filter).toMatchSnapshot();
        });
    });
});
