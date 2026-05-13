import convertVersionFromGqlFormat from './convertVersionFromGqlFormat';

describe('convertVersionFromGqlFormat', () => {
    test('Return version', async () => {
        const func = convertVersionFromGqlFormat();
        expect(func([{treeId: 'my_tree', treeNodeId: '123456'}])).toEqual({
            my_tree: '123456',
        });
    });
});
