import {Database} from 'arangojs';
import {type IFilterTypesHelper} from '../record/helpers/filterTypes';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import attributeAdvancedRepo, {type IAttributeAdvancedRepoDeps} from './attributeAdvancedRepo';
import {type ToAny} from '../../utils/utils';
import {type IAttributeWithRevLink} from './attributeTypesRepo';

const depsBase: ToAny<IAttributeAdvancedRepoDeps> = {
    'core.infra.db.dbService': vi.fn(),
    'core.infra.record.helpers.filterTypes': vi.fn(),
};

describe('AttributeStandardRepo', () => {
    const mockAttribute: IAttributeWithRevLink = {
        id: 'test_attr',
        type: AttributeTypes.ADVANCED,
        multiple_values: true,
    };

    const ctx: IQueryInfos = {
        userId: '0',
        queryId: 'attributeAdvancedRepoTest',
    };

    describe('createValue', () => {
        test('Should create a new advanced value', async function () {
            const createdValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val',
            };

            const createdEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'},
            };

            const newValueData = {
                id_value: 987654,
                payload: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                created_by: '0',
                modified_by: '0',
                metadata: {my_attribute: 'metadata value'},
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[createdValueData], [createdEdgeData]]),
            };

            const attrRepo = attributeAdvancedRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 'test val',
                    modified_at: 400999999,
                    created_at: 400999999,
                    metadata: {my_attribute: 'metadata value'},
                },
                ctx,
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(2);

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject(newValueData);
        });

        test('Should save version on value', async function () {
            const createdValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val',
                version: {
                    my_tree: '1',
                },
            };

            const createdEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                version: {
                    my_tree: '1',
                },
            };

            const newValueData = {
                id_value: 987654,
                payload: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                version: {
                    my_tree: '1',
                },
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[createdValueData], [createdEdgeData]]),
            };

            const attrRepo = attributeAdvancedRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
            });

            const createdVal = await attrRepo.createValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    payload: 'test val',
                    modified_at: 400999999,
                    created_at: 400999999,
                    version: {my_tree: '1'},
                },
                ctx,
            });

            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/INSERT/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(createdVal).toMatchObject(newValueData);
        });
    });

    describe('updateValue', () => {
        test('Should update an advanced value', async function () {
            const savedValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val',
            };

            const savedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'},
            };

            const valueData = {
                id_value: 987654,
                payload: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                metadata: {my_attribute: 'metadata value'},
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[savedValueData], [savedEdgeData]]),
            };

            const attrRepo = attributeAdvancedRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const savedVal = await attrRepo.updateValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '987654',
                    payload: 'test val',
                    modified_at: 500999999,
                    metadata: {my_attribute: 'metadata value'},
                },
                ctx,
            });

            expect(typeof mockDbServ.execute.mock.calls[0][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[0][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[0][0].query.bindVars).toMatchSnapshot();

            expect(typeof mockDbServ.execute.mock.calls[1][0]).toBe('object'); // AqlQuery
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatch(/UPDATE/);
            expect(mockDbServ.execute.mock.calls[1][0].query.query).toMatchSnapshot();
            expect(mockDbServ.execute.mock.calls[1][0].query.bindVars).toMatchSnapshot();

            expect(savedVal).toMatchObject(valueData);
        });

        test('Should update value version', async function () {
            const savedValueData = {
                _id: 'core_values/987654',
                _rev: '_WSywvyC--_',
                _key: 987654,
                value: 'test_val',
                version: {
                    my_tree: '1',
                },
            };

            const savedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                version: {
                    my_tree: '1',
                },
            };

            const valueData = {
                id_value: 987654,
                payload: 'test_val',
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
                version: {
                    my_tree: '1',
                },
            };

            const mockDbServ = {
                db: new Database(),
                execute: global.__mockPromiseMultiple([[savedValueData], [savedEdgeData]]),
            };

            const attrRepo = attributeAdvancedRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
            });

            const savedVal = await attrRepo.updateValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '987654',
                    payload: 'test val',
                    modified_at: 500999999,
                    version: {my_tree: '1'},
                },
                ctx,
            });

            expect(savedVal).toMatchObject(valueData);
        });
    });

    describe('deleteValue', () => {
        test('Should delete a value', async function () {
            const deletedValueData = {
                _id: 'core_values/123456789',
                _rev: '_WSywvyC--_',
                _key: 123456789,
                old: {
                    payload: 'test_val',
                },
            };

            const deletedEdgeData = {
                _id: 'core_edge_values_links/222435651',
                _rev: '_WSywvyC--_',
                _from: 'test_lib/12345',
                _to: 'core_values/987654',
                _key: 978654321,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
                modified_by: '0',
                created_by: '0',
            };

            const oldValueData = {
                id_value: 123456789,
                attribute: 'test_attr',
                modified_at: 400999999,
                created_at: 400999999,
            };

            const mockDbCollec = {
                remove: global.__mockPromise(deletedValueData),
            };

            const mockDbEdgeCollec = {
                removeByExample: global.__mockPromise(deletedEdgeData),
            };

            const mockDb = {
                collection: vi.fn().mockReturnValueOnce(mockDbCollec).mockReturnValue(mockDbEdgeCollec),
            };

            const mockDbServ = {db: mockDb as unknown as Database};

            const attrRepo = attributeAdvancedRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const deletedVal = await attrRepo.deleteValue({
                library: 'test_lib',
                recordId: '12345',
                attribute: mockAttribute,
                value: {
                    id_value: '123456789',
                    payload: 'test_val',
                    modified_at: 400999999,
                    created_at: 400999999,
                    modified_by: '0',
                    created_by: '0',
                },
                ctx,
            });

            expect(mockDbCollec.remove.mock.calls.length).toBe(1);
            expect(mockDbCollec.remove).toBeCalledWith({_key: '123456789'}, {returnOld: true});

            expect(mockDbEdgeCollec.removeByExample.mock.calls.length).toBe(1);
            expect(mockDbEdgeCollec.removeByExample).toBeCalledWith({
                _from: 'test_lib/12345',
                _to: 'core_values/123456789',
            });

            expect(deletedVal).toMatchObject(oldValueData);
        });
    });

    describe('getValueByID', () => {
        test('Should return value', async function () {
            const lookupValueRes = [
                {
                    _key: 987654,
                    value: 'test val',
                },
            ];

            const edgeRes = {
                _from: 'test_lib/987654',
                _to: 'core_values/987654',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                attribute: 'test_attr',
            };

            const mockDbCollec = {
                lookupByKeys: global.__mockPromise(lookupValueRes),
            };

            const mockDbEdgeCollec = {};

            const mockDb = {
                collection: vi.fn().mockReturnValueOnce(mockDbCollec).mockReturnValueOnce(mockDbEdgeCollec),
            };

            const mockDbServ = {
                db: mockDb as unknown as Database,
                execute: global.__mockPromise([{...edgeRes, payload: 'test val'}]),
            };

            const attrRepo = attributeAdvancedRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const value = await attrRepo.getValueById!({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '132465',
                ctx,
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(value).toMatchObject({
                id_value: '132465',
                payload: 'test val',
                modified_at: 99999,
                created_at: 99999,
                modified_by: '0',
                created_by: '0',
                attribute: 'test_attr',
            });
        });

        test("Should return null if value doesn't exists", async function () {
            const mockDbCollec = {};

            const mockDbEdgeCollec = {};

            const mockDb = {
                collection: vi.fn().mockReturnValue(mockDbCollec),
                edgeCollection: vi.fn().mockReturnValue(mockDbEdgeCollec),
            };

            const mockDbServ = {
                db: mockDb as unknown as Database,
                execute: global.__mockPromise([]),
            };

            const attrRepo = attributeAdvancedRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});

            const value = await attrRepo?.getValueById?.({
                library: 'test_lib',
                recordId: '987654',
                attribute: mockAttribute,
                valueId: '132465',
                ctx,
            });

            expect(mockDbServ.execute.mock.calls.length).toBe(1);
            expect(value).toBeNull();
        });
    });

    describe('sortQueryPart', () => {
        test('Should return advanced filter', () => {
            const mockDbServ = {
                db: new Database(),
            };
            const attrRepo = attributeAdvancedRepo({...depsBase, 'core.infra.db.dbService': mockDbServ});
            const filter = attrRepo.sortQueryPart({
                attributes: [{id: 'label', type: AttributeTypes.ADVANCED}],
                order: 'ASC',
            });

            expect(filter).toMatchSnapshot();
        });
    });

    describe('filterValueQueryPart', () => {
        test('Should return queyr to retrieve value to filter on', () => {
            const mockDbServ = {
                db: new Database(),
            };

            const mockFilterTypesHelper: Mockify<IFilterTypesHelper> = {
                isCountFilter: vi.fn().mockReturnValue(false),
            };

            const attrRepo = attributeAdvancedRepo({
                ...depsBase,
                'core.infra.db.dbService': mockDbServ,
                'core.infra.record.helpers.filterTypes': mockFilterTypesHelper as IFilterTypesHelper,
            });
            const filter = attrRepo.filterValueQueryPart(
                [{id: 'label', type: AttributeTypes.ADVANCED, reverse_link: null, _repo: null}],
                {condition: AttributeCondition.EQUAL, value: 'MyLabel'},
                'r',
            );

            expect(filter.query).toMatch(/OUTBOUND/);
            expect(filter).toMatchSnapshot();
        });
    });
});
