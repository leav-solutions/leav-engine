import {ITree, ITreeFilterOptions} from '_types/tree';
import ValidationError from '../errors/ValidationError';
import {ITreeRepo} from 'infra/treeRepo';
import {ILibraryDomain} from './libraryDomain';
import {difference} from 'lodash';

export interface ITreeDomain {
    saveTree(tree: ITree): Promise<ITree>;
    deleteTree(id: string): Promise<ITree>;
    getTrees(filters?: ITreeFilterOptions): Promise<ITree[]>;
}

export default function(treeRepo: ITreeRepo | null = null, libraryDomain: ILibraryDomain | null = null): ITreeDomain {
    return {
        async saveTree(tree: ITree): Promise<ITree> {
            const trees = await treeRepo.getTrees({id: tree.id});
            const newTree = !!trees.length;

            // Check if all libraries exists
            const libs = await libraryDomain.getLibraries();
            const libsIds = libs.map(lib => lib.id);

            const unknownLibs = difference(tree.libraries, libsIds);

            if (unknownLibs.length) {
                throw new ValidationError([{libraries: `Unknown libraries: ${unknownLibs.join(', ')}`}]);
            }

            const savedTree = newTree ? await treeRepo.updateTree(tree) : await treeRepo.createTree(tree);

            return savedTree;
        },
        async deleteTree(id: string): Promise<ITree> {
            const trees = await this.getTrees({id});

            if (!trees.length) {
                throw new ValidationError([{id: 'Unknown tree'}]);
            }

            if (trees.pop().system) {
                throw new ValidationError([{id: 'Cannot delete system tree'}]);
            }

            return treeRepo.deleteTree(id);
        },
        async getTrees(filters?: ITreeFilterOptions): Promise<ITree[]> {
            return treeRepo.getTrees(filters);
        }
    };
}
