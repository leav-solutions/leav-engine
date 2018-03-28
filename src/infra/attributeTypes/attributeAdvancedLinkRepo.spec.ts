import attributeAdvancedLinkRepo from './attributeAdvancedLinkRepo';
import {AttributeTypes} from '../../_types/attribute';
import {Database} from 'arangojs';

describe('AttributeAdvancedLinkRepo', () => {
    const mockAttribute = {
        id: 'test_adv_link_attr',
        type: AttributeTypes.ADVANCED_LINK,
        linked_library: 'test_linked_lib'
    };

    const savedEdgeData = {
        _id: 'core_edge_values_links/222435651',
        _rev: '_WSywvyC--_',
        _from: 'test_lib/12345',
        _to: 'test_linked_lib/987654',
        _key: 978654321,
        attribute: 'test_adv_link_attr',
        modified_at: 400999999,
        created_at: 400999999
    };

    const valueData = {
        id: 978654321,
        value: 987654,
        attribute: 'test_adv_link_attr',
        modified_at: 400999999,
        created_at: 400999999
    };

    describe('createValue', () => {
        test('Should create a new advanced link value', async function() {
            const mockDbEdgeCollec = {
                save: global.__mockPromise(savedEdgeData),
                firstExample: global.__mockPromise(savedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, null);

            const createdVal = await attrRepo.createValue('test_lib', 12345, mockAttribute, {
                value: 987654,
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(mockDbEdgeCollec.save.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.save).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'test_linked_lib/987654',
                attribute: 'test_adv_link_attr',
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(createdVal).toMatchObject({
                id: 978654321,
                value: 987654,
                attribute: 'test_adv_link_attr',
                modified_at: 400999999,
                created_at: 400999999
            });
        });
    });

    describe('updateValue', () => {
        test('Should update a advanced link value', async function() {
            const mockDbEdgeCollec = {
                updateByExample: global.__mockPromise(),
                firstExample: global.__mockPromise(savedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, null);

            const savedVal = await attrRepo.updateValue('test_lib', 12345, mockAttribute, {
                id: 987654,
                value: 987654,
                modified_at: 400999999
            });

            expect(mockDbEdgeCollec.updateByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.updateByExample).toBeCalledWith(
                {
                    _key: 987654
                },
                {
                    _from: 'test_lib/12345',
                    _to: 'test_linked_lib/987654',
                    attribute: 'test_adv_link_attr',
                    modified_at: 400999999
                }
            );

            expect(savedVal).toMatchObject(valueData);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function() {
            const deletedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'test_linked_lib/987654',
                _key: 978654321
            };

            const mockDbEdgeCollec = {
                removeByExample: global.__mockPromise(deletedEdgeData)
            };

            const mockDb = {
                edgeCollection: jest.fn().mockReturnValue(mockDbEdgeCollec)
            };

            const mockDbServ = {db: mockDb};

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, null);

            const deletedVal = await attrRepo.deleteValue('test_lib', 12345, mockAttribute, {
                id: 445566,
                value: 987654,
                modified_at: 400999999,
                created_at: 400999999
            });

            expect(mockDbEdgeCollec.removeByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.removeByExample).toBeCalledWith({_key: 445566});

            expect(deletedVal).toMatchObject({id: 445566});
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function() {
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
                        created_at: 99999
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

            const mockDbUtils = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtils);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id: 112233,
                value: 123456
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();
            expect(value).toMatchObject({
                id: 112233,
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                modified_at: 99999,
                created_at: 99999,
                attribute: 'test_adv_link_attr'
            });
        });

        test("Should return null if value doesn't exists", async function() {
            const traversalRes = [];

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromise(traversalRes)
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, null);

            const value = await attrRepo.getValueById('test_lib', 987654, mockAttribute, {
                id: 112233,
                value: 123456
            });

            expect(value).toBeNull();
        });
    });
    describe('getValues', () => {
        test('Should return values for advanced link attribute', async function() {
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
                        created_at: 99999
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
                        created_at: 66666
                    }
                }
            ];

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

            const mockDbUtils = {
                cleanup: mockCleanupRes
            };

            const attrRepo = attributeAdvancedLinkRepo(mockDbServ, mockDbUtils);

            const values = await attrRepo.getValues('test_lib', 123456, mockAttribute);

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].bindVars).toMatchSnapshot();

            expect(values.length).toBe(2);
            expect(values[0]).toMatchObject({
                id: 112233,
                value: {
                    id: 123456,
                    created_at: 88888,
                    modified_at: 88888
                },
                attribute: 'test_adv_link_attr',
                modified_at: 99999,
                created_at: 99999
            });

            expect(values[1]).toMatchObject({
                id: 112234,
                value: {
                    id: 123457,
                    created_at: 77777,
                    modified_at: 77777
                },
                attribute: 'test_adv_link_attr',
                modified_at: 66666,
                created_at: 66666
            });
        });
    });
});
