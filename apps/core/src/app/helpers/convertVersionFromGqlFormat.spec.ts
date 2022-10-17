// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import convertVersionFromGqlFormat from './convertVersionFromGqlFormat';

describe('convertVersionFromGqlFormat', () => {
    test('Return version', async () => {
        const func = convertVersionFromGqlFormat();
        expect(func([{treeId: 'my_tree', treeNodeId: '123456'}])).toEqual({
            my_tree: '123456'
        });
    });
});
