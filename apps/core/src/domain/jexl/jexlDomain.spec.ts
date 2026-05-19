import {type IValueDomain} from '../value/valueDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type ITreeNode} from '../../_types/tree';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockStandardValue} from '../../__tests__/mocks/value';
import jexlDomain from './jexlDomain';
import {JexlContextType} from './types';
import {AttributeCondition} from '../../_types/record';

describe('jexlDomain', () => {
    const ctx: IQueryInfos = {userId: '42', queryId: 'jexlTest', lang: 'fr'};

    const mockValueDomain: Mockify<IValueDomain> = {
        getValues: vi.fn(),
    };

    const mockRecordDomain: Mockify<IRecordDomain> = {
        find: vi.fn(),
    };

    const domain = jexlDomain({
        'core.domain.value': mockValueDomain as IValueDomain,
        'core.domain.record': mockRecordDomain as IRecordDomain,
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('buildRecordContext', () => {
        test('should return an object with __jexlContextType RECORD', () => {
            const result = domain.buildRecordContext(mockRecord, ctx);
            expect(result.__jexlContextType).toBe(JexlContextType.RECORD);
        });

        test('should preserve record fields', () => {
            const result = domain.buildRecordContext(mockRecord, ctx);
            expect(result.id).toBe(mockRecord.id);
            expect(result.library).toBe(mockRecord.library);
        });

        test('should expose _getCtx returning the query context', () => {
            const result = domain.buildRecordContext(mockRecord, ctx);
            expect(result.__getJexlQueryCtx()).toBe(ctx);
        });
    });

    describe('buildTreeNodeContext', () => {
        const mockTreeNode: ITreeNode = {
            id: 'node1',
            order: 0,
            record: {id: '123456', library: 'my_lib'},
        };

        test('should return an object with __jexlContextType TREE_NODE', () => {
            const result = domain.buildTreeNodeContext(mockTreeNode, ctx);
            expect(result.__jexlContextType).toBe(JexlContextType.TREE_NODE);
        });

        test('should preserve tree node fields', () => {
            const result = domain.buildTreeNodeContext(mockTreeNode, ctx);
            expect(result.id).toBe(mockTreeNode.id);
            expect(result.record).toEqual(mockTreeNode.record);
        });

        test('should expose _getCtx returning the query context', () => {
            const result = domain.buildTreeNodeContext(mockTreeNode, ctx);
            expect(result.__getJexlQueryCtx()).toBe(ctx);
        });
    });

    describe('buildValuesContext', () => {
        test('should return primitive string payload as-is', () => {
            const values = [{...mockStandardValue, payload: 'hello'}];
            const result = domain.buildValuesContext(values, ctx);
            expect(result).toEqual(['hello']);
        });

        test('should return primitive number payload as-is', () => {
            const values = [{...mockStandardValue, payload: 42}];
            const result = domain.buildValuesContext(values, ctx);
            expect(result).toEqual([42]);
        });

        test('should convert record-like payload (with library) to JexlRecordValueContext', () => {
            const values = [{...mockStandardValue, payload: {id: '789', library: 'other_lib'}}];
            const result = domain.buildValuesContext(values, ctx);
            expect(result[0]).toMatchObject({
                __jexlContextType: JexlContextType.RECORD,
                id: '789',
                library: 'other_lib',
            });
        });

        test('should convert tree-node-like payload (with nested record) to JexlTreeNodeValueContext', () => {
            const values = [
                {
                    ...mockStandardValue,
                    payload: {id: 'node1', record: {id: '789', library: 'other_lib'}},
                },
            ];
            const result = domain.buildValuesContext(values, ctx);
            expect(result[0]).toMatchObject({
                __jexlContextType: JexlContextType.TREE_NODE,
                id: 'node1',
            });
        });

        test('should return an empty array for empty input', () => {
            const result = domain.buildValuesContext([], ctx);
            expect(result).toEqual([]);
        });
    });

    describe('buildRootContext', () => {
        test('should return an object with __jexlContextType ROOT', () => {
            const result = domain.buildRootContext({}, ctx);
            expect(result.__jexlContextType).toBe(JexlContextType.ROOT);
        });

        test('should contain currentUser with __jexlContextType USER', () => {
            const result = domain.buildRootContext({}, ctx);
            expect(result.currentUser.__jexlContextType).toBe(JexlContextType.USER);
        });

        test('should set currentUser.record as a record context for ctx.userId in library "users"', () => {
            const result = domain.buildRootContext({}, ctx);
            expect(result.currentUser.record.__jexlContextType).toBe(JexlContextType.RECORD);
            expect(result.currentUser.record.id).toBe(ctx.userId);
            expect(result.currentUser.record.library).toBe('users');
        });

        test('should set currentUser.lang from ctx.lang', () => {
            const result = domain.buildRootContext({}, ctx);
            expect(result.currentUser.lang).toBe(ctx.lang);
        });

        test('should spread contextData fields at root level', () => {
            const customData = {foo: 'bar', count: 3};
            const result = domain.buildRootContext(customData, ctx);
            expect(result.foo).toBe('bar');
            expect(result.count).toBe(3);
        });

        test('should expose _getCtx returning the query context', () => {
            const result = domain.buildRootContext({}, ctx);
            expect(result.__getJexlQueryCtx()).toBe(ctx);
        });
    });

    describe('eval', () => {
        test('should evaluate arithmetic expressions', async () => {
            const result = await domain.eval('1 + 2');
            expect(result).toBe(3);
        });

        test('should access fields from context', async () => {
            const recordCtx = domain.buildRecordContext(mockRecord, ctx);
            const result = await domain.eval('$.id', recordCtx);
            expect(result).toBe(mockRecord.id);
        });

        test('should apply the first transform on an array', async () => {
            const result = await domain.eval('[10, 20, 30] | first');
            expect(result).toBe(10);
        });

        test('should apply the last transform on an array', async () => {
            const result = await domain.eval('[10, 20, 30] | last');
            expect(result).toBe(30);
        });

        test('should apply the map transform on an array', async () => {
            const result = await domain.eval('[1, 2, 3] | map("value * 2")');
            expect(result).toEqual([2, 4, 6]);
        });

        test('should return null for first on an empty array', async () => {
            const result = await domain.eval('[] | first');
            expect(result).toBeNull();
        });
    });

    describe('getValues transform', () => {
        describe('on a record context', () => {
            test('should call valueDomain.getValues with correct params and return primitive values', async () => {
                mockValueDomain.getValues.mockResolvedValue([{...mockStandardValue, payload: 'label-1'}]);

                const rootCtx = domain.buildRootContext(
                    {currentRecord: domain.buildRecordContext(mockRecord, ctx)},
                    ctx,
                );
                const result = await domain.eval('$.currentRecord | getValues("my_attr")', rootCtx);
                const resultF = await domain.eval('getValues($.currentRecord, "my_attr")', rootCtx);

                expect(mockValueDomain.getValues).toHaveBeenCalledWith({
                    attribute: 'my_attr',
                    recordId: mockRecord.id,
                    library: mockRecord.library,
                    ctx,
                });
                expect(result).toEqual(['label-1']);
                expect(resultF).toEqual(['label-1']);
            });

            test('should return JexlRecordValueContext for link attribute values', async () => {
                mockValueDomain.getValues.mockResolvedValue([
                    {...mockStandardValue, payload: {id: '789', library: 'other_lib'}},
                ]);

                const rootCtx = domain.buildRootContext(
                    {currentRecord: domain.buildRecordContext(mockRecord, ctx)},
                    ctx,
                );
                const result = await domain.eval('$.currentRecord | getValues("campaigns")', rootCtx);
                const resultF = await domain.eval('getValues($.currentRecord, "campaigns")', rootCtx);

                expect(result[0]).toMatchObject({
                    __jexlContextType: JexlContextType.RECORD,
                    id: '789',
                    library: 'other_lib',
                });
                expect(resultF[0]).toMatchObject({
                    __jexlContextType: JexlContextType.RECORD,
                    id: '789',
                    library: 'other_lib',
                });
            });

            test('should return JexlTreeNodeValueContext for tree attribute values', async () => {
                mockValueDomain.getValues.mockResolvedValue([
                    {
                        ...mockStandardValue,
                        payload: {id: 'node1', record: {id: '789', library: 'other_lib'}},
                    },
                ]);

                const rootCtx = domain.buildRootContext(
                    {currentRecord: domain.buildRecordContext(mockRecord, ctx)},
                    ctx,
                );
                const result = await domain.eval('$.currentRecord | getValues("categories")', rootCtx);
                const resultF = await domain.eval('getValues($.currentRecord, "categories")', rootCtx);

                expect(result[0]).toMatchObject({__jexlContextType: JexlContextType.TREE_NODE, id: 'node1'});
                expect(resultF[0]).toMatchObject({__jexlContextType: JexlContextType.TREE_NODE, id: 'node1'});
            });
        });

        describe('on a tree node context', () => {
            test('should use the record from the tree node to call valueDomain.getValues', async () => {
                mockValueDomain.getValues.mockResolvedValue([{...mockStandardValue, payload: 'label-1'}]);

                const treeNode: ITreeNode = {
                    id: 'node1',
                    record: {id: mockRecord.id, library: mockRecord.library},
                };
                const rootCtx = domain.buildRootContext({currentNode: domain.buildTreeNodeContext(treeNode, ctx)}, ctx);
                const result = await domain.eval('$.currentNode | getValues("my_attr")', rootCtx);

                expect(mockValueDomain.getValues).toHaveBeenCalledWith({
                    attribute: 'my_attr',
                    recordId: mockRecord.id,
                    library: mockRecord.library,
                    ctx,
                });
                expect(result).toEqual(['label-1']);
            });
        });

        describe('error cases', () => {
            test('should throw when called on a null value', async () => {
                const evalCtx = domain.buildRootContext({nullVal: null}, ctx);
                await expect(domain.eval('nullVal | getValues("attr")', evalCtx)).rejects.toThrow();
            });

            test('should throw when called on a ROOT context (wrong __jexlContextType)', async () => {
                const rootCtx = domain.buildRootContext({}, ctx);
                const evalCtx = {wrongValue: rootCtx} as any;
                await expect(domain.eval('wrongValue | getValues("attr")', evalCtx)).rejects.toThrow(
                    'getValues transform can only be used on record or tree node',
                );
            });

            test('should propagate errors from valueDomain.getValues', async () => {
                const dbError = new Error('DB connection failed');
                mockValueDomain.getValues.mockRejectedValue(dbError);

                const rootCtx = domain.buildRootContext(
                    {currentRecord: domain.buildRecordContext(mockRecord, ctx)},
                    ctx,
                );
                await expect(domain.eval('$.currentRecord | getValues("attr")', rootCtx)).rejects.toThrow(
                    'DB connection failed',
                );
            });
        });
    });

    describe('getRecord function', () => {
        test('should call recordDomain.find with correct params and return a record context', async () => {
            const mockRecordData = {id: 'rec123', library: 'lib1'};
            mockRecordDomain.find.mockResolvedValue({list: [mockRecordData], total: 1});

            const rootCtx = domain.buildRootContext({}, ctx);
            const result = await domain.eval('getRecord($, "lib1", "rec123")', rootCtx);
            const resultF = await domain.eval('$ | getRecord("lib1", "rec123")', rootCtx);

            expect(mockRecordDomain.find).toHaveBeenCalledWith({
                params: {
                    library: 'lib1',
                    filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: 'rec123'}],
                    pagination: {
                        limit: 1,
                        offset: 0,
                    },
                },
                ctx,
            });
            expect(result).toMatchObject({
                __jexlContextType: JexlContextType.RECORD,
                id: 'rec123',
                library: 'lib1',
            });
            expect(resultF).toMatchObject({
                __jexlContextType: JexlContextType.RECORD,
                id: 'rec123',
                library: 'lib1',
            });
        });

        test('should throw when called on a non-ROOT context', async () => {
            const recordCtx = domain.buildRecordContext(mockRecord, ctx);
            const evalCtx = {wrongRoot: recordCtx} as any;
            await expect(domain.eval('getRecord($, "lib1", "rec123")', evalCtx)).rejects.toThrow(
                'getRecord function can only be used on root context',
            );
        });

        test('should throw when recordDomain.find returns no results', async () => {
            mockRecordDomain.find.mockResolvedValue({list: [], total: 0});

            const rootCtx = domain.buildRootContext({}, ctx);
            await expect(domain.eval('getRecord($, "lib1", "nonexistent")', rootCtx)).rejects.toThrow(
                'Record with id nonexistent not found in library lib1',
            );
        });
    });

    describe('validate', () => {
        test('should resolve for a valid arithmetic expression', async () => {
            await expect(domain.validate('1 + 2')).resolves.toBeUndefined();
        });

        test('should resolve for a valid ternary expression', async () => {
            await expect(domain.validate('a > 0 ? "yes" : "no"')).resolves.toBeUndefined();
        });

        test('should resolve for a valid transform chain', async () => {
            await expect(domain.validate('[1, 2, 3] | map("value * 2") | first')).resolves.toBeUndefined();
        });

        test('should resolve for a valid getValues expression', async () => {
            await expect(domain.validate('$.currentRecord | getValues("label") | first')).resolves.toBeUndefined();
        });

        test('should reject for an expression truncated after an operator', async () => {
            await expect(domain.validate('1 +')).rejects.toThrow('Unexpected end of expression');
        });

        test('should reject for an unmatched opening parenthesis', async () => {
            await expect(domain.validate('foo(')).rejects.toThrow('Unexpected end of expression');
        });

        test('should reject for an invalid expression token', async () => {
            await expect(domain.validate('2 & 2')).rejects.toThrow('Invalid expression token');
        });
    });

    describe('README examples', () => {
        test('recopy label: prefix + uppercase first value', async () => {
            mockValueDomain.getValues.mockResolvedValue([{...mockStandardValue, payload: 'hello'}]);

            const rootCtx = domain.buildRootContext({currentRecord: domain.buildRecordContext(mockRecord, ctx)}, ctx);
            const result = await domain.eval(
                '"copy: " + ($.currentRecord | getValues("label") | first | uppercase)',
                rootCtx,
            );
            expect(result).toBe('copy: HELLO');
        });

        test('nested getValues: list sub-entity labels via map', async () => {
            mockValueDomain.getValues
                .mockResolvedValueOnce([
                    {...mockStandardValue, payload: {id: 'c1', library: 'campaigns'}},
                    {...mockStandardValue, payload: {id: 'c2', library: 'campaigns'}},
                ])
                .mockResolvedValueOnce([{...mockStandardValue, payload: 'label1'}])
                .mockResolvedValueOnce([{...mockStandardValue, payload: 'label2'}]);

            const rootCtx = domain.buildRootContext({currentRecord: domain.buildRecordContext(mockRecord, ctx)}, ctx);
            const result = await domain.eval(
                '$.currentRecord | getValues("campaigns") | map("value | getValues(\'campaigns_label\') | first")',
                rootCtx,
            );
            expect(result).toEqual(['label1', 'label2']);
        });

        test('currentValues | map("value * 2"): double all values (save action pattern)', async () => {
            const rootCtx = domain.buildRootContext({currentValues: [2, 5, 10]}, ctx);
            const result = await domain.eval('$.currentValues | map("value * 2")', rootCtx);
            expect(result).toEqual([4, 10, 20]);
        });

        test('currentUser.lang + email: access user context and fetch attribute', async () => {
            mockValueDomain.getValues.mockResolvedValue([{...mockStandardValue, payload: 'seb@aristid.com'}]);

            const rootCtx = domain.buildRootContext({}, ctx);
            const result = await domain.eval(
                '$.currentUser.lang + " - " + first(getValues($.currentUser.record, "email"))',
                rootCtx,
            );
            expect(result).toBe('fr - seb@aristid.com');
        });
    });
});
