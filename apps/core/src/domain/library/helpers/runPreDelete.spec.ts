// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeDomain} from 'domain/tree/treeDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IUtils} from 'utils/utils';
import {mockLibrary, mockLibraryFiles} from '../../../__tests__/mocks/library';
import {mockCtx} from '../../../__tests__/mocks/shared';
import {mockTree} from '../../../__tests__/mocks/tree';
import runPreDelete from './runPreDelete';

describe('runPreDelete', () => {
    const mockTreeDomain: Mockify<ITreeDomain> = {
        getTrees: global.__mockPromise({list: [mockTree]}),
        saveTree: jest.fn()
    };

    const mockTreeRepo: Mockify<ITreeRepo> = {
        deleteTree: jest.fn()
    };

    const mockUtils: Mockify<IUtils> = {
        getLibraryTreeId: jest.fn(() => 'lib_tree')
    };

    test("Remove library from tree where it's used", async () => {
        const runPreDeleteFunc = runPreDelete({
            'core.domain.tree': mockTreeDomain as ITreeDomain,
            'core.infra.tree': mockTreeRepo as ITreeRepo,
            'core.utils': mockUtils as IUtils
        });

        await runPreDeleteFunc(mockLibrary, mockCtx);

        expect(mockTreeDomain.saveTree).toBeCalled();
    });

    test('On a files library, delete associated tree', async () => {
        const runPreDeleteFunc = runPreDelete({
            'core.domain.tree': mockTreeDomain as ITreeDomain,
            'core.infra.tree': mockTreeRepo as ITreeRepo,
            'core.utils': mockUtils as IUtils
        });

        await runPreDeleteFunc(mockLibraryFiles, mockCtx);

        expect(mockTreeDomain.saveTree).toBeCalled();
        expect(mockTreeRepo.deleteTree).toBeCalled();
    });
});
