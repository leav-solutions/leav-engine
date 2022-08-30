// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeRepo} from 'infra/tree/treeRepo';
import {mockCtx} from '../../../__tests__/mocks/shared';
import {mockTree} from '../../../__tests__/mocks/tree';
import handleRemovedLibraries from './handleRemovedLibraries';

describe('handleRemovedLibraries', () => {
    const mockTreeRepo: Mockify<ITreeRepo> = {
        deleteElement: jest.fn(),
        getNodesByLibrary: global.__mockPromise(['123456', '987654'])
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Detach elements for all removed libraries', async () => {
        const handleRemovedLibrariesFunc = handleRemovedLibraries({'core.infra.tree': mockTreeRepo as ITreeRepo});
        const treeDataBefore = {
            ...mockTree,
            libraries: {
                lib1: {
                    allowMultiplePositions: false,
                    allowedAtRoot: true,
                    allowedChildren: ['__all__']
                },
                lib2: {
                    allowMultiplePositions: false,
                    allowedAtRoot: true,
                    allowedChildren: ['__all__']
                }
            }
        };

        const treeDataAfter = {
            ...mockTree,
            libraries: {
                lib1: {
                    allowMultiplePositions: false,
                    allowedAtRoot: true,
                    allowedChildren: ['__all__']
                }
            }
        };

        await handleRemovedLibrariesFunc(treeDataBefore, treeDataAfter, mockCtx);

        expect(mockTreeRepo.getNodesByLibrary).toHaveBeenCalledTimes(1);
        expect(mockTreeRepo.deleteElement).toHaveBeenCalledTimes(2);
    });

    test('Does not do anything if no libraries removed', async () => {
        const handleRemovedLibrariesFunc = handleRemovedLibraries({'core.infra.tree': mockTreeRepo as ITreeRepo});
        await handleRemovedLibrariesFunc(mockTree, mockTree, mockCtx);

        expect(mockTreeRepo.getNodesByLibrary).toHaveBeenCalledTimes(0);
        expect(mockTreeRepo.deleteElement).toHaveBeenCalledTimes(0);
    });
});
