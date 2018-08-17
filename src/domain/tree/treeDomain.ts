import {ITree, ITreeElement, ITreeFilterOptions, ITreeNode} from '../../_types/tree';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {difference} from 'lodash';
import ValidationError from '../../errors/ValidationError';
import {ILibraryDomain} from '../library/libraryDomain';
import {IRecordDomain} from '../record/recordDomain';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IQueryField, IRecord} from '../../_types/record';
import {IQueryInfos} from '_types/queryInfos';
import {IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import {AdminPermisisonsActions} from '../../_types/permissions';
import PermissionError from '../../errors/PermissionError';

export interface ITreeDomain {
    saveTree(tree: ITree, infos: IQueryInfos): Promise<ITree>;
    deleteTree(id: string, infos: IQueryInfos): Promise<ITree>;
    getTrees(filters?: ITreeFilterOptions): Promise<ITree[]>;

    /**
     * Add an element to the tree
     *
     * @param element
     * @param parent Parent must be a record or null to add element to root
     */
    addElement(treeId: string, element: ITreeElement, parent: ITreeElement | null): Promise<ITreeElement>;

    /**
     * Move an element in the tree
     *
     * @param element
     * @param parentFrom A record or null to move from root
     * @param parentTo A record or null to move to root
     */
    moveElement(treeId: string, element: ITreeElement, parentTo: ITreeElement | null): Promise<ITreeElement>;

    /**
     * Delete an element from the tree
     *
     * @param element
     * @param parent A record or null to delete from root
     */
    deleteElement(treeId: string, element: ITreeElement, deleteChildren: boolean | null): Promise<ITreeElement>;

    /**
     * Return the whole tree in the form:
     * [
     *      {
     *          record: {...},
     *          children: [
     *              {
     *                  record: ...
     *                  children: ...
     *              }
     *          ]
     *      },
     *      { ... }
     * ]
     *
     * @param treeId
     */
    getTreeContent(treeId: string, fields: string[]): Promise<ITreeNode[]>;

    /**
     * Retrieve first level children of an element
     *
     * @param treeId
     * @param element
     */
    getElementChildren(treeId: string, element: ITreeElement): Promise<ITreeNode[]>;

    /**
     * Retrieve all ancestors of an element, including element itself and starting from the root
     *
     * @param treeId
     * @param element
     */
    getElementAncestors(treeId: string, element: ITreeElement): Promise<ITreeNode[]>;

    /**
     * Retrieve all records linked to an element via given attribute
     *
     * @param treeId
     * @param attribute
     * @param element
     */
    getLinkedRecords(treeId: string, attribute: string, element: ITreeElement): Promise<IRecord[]>;
}

export default function(
    treeRepo: ITreeRepo = null,
    libraryDomain: ILibraryDomain = null,
    recordDomain: IRecordDomain = null,
    attributeDomain: IAttributeDomain = null,
    adminPermissionDomain: IAdminPermissionDomain = null
): ITreeDomain {
    async function _treeExists(treeId: string): Promise<boolean> {
        const trees = await treeRepo.getTrees({id: treeId});

        return !!trees.length;
    }

    async function _treeElementExists(treeElement: ITreeElement) {
        const record = await recordDomain.find(treeElement.library, {
            id: `${treeElement.id}`
        });

        return !!record.length;
    }

    return {
        async saveTree(tree: ITree, infos: IQueryInfos): Promise<ITree> {
            const trees = await treeRepo.getTrees({id: tree.id});
            const newTree = !!trees.length;

            // Check permissions
            const action = newTree ? AdminPermisisonsActions.EDIT_TREE : AdminPermisisonsActions.CREATE_TREE;
            const canSaveTree = await adminPermissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            // Check if all libraries exists
            const libs = await libraryDomain.getLibraries();
            const libsIds = libs.map(lib => lib.id);

            const unknownLibs = difference(tree.libraries, libsIds);

            if (unknownLibs.length) {
                throw new ValidationError({libraries: `Unknown libraries: ${unknownLibs.join(', ')}`});
            }

            const savedTree = newTree ? await treeRepo.updateTree(tree) : await treeRepo.createTree(tree);

            return savedTree;
        },
        async deleteTree(id: string, infos: IQueryInfos): Promise<ITree> {
            // Check permissions
            const action = AdminPermisisonsActions.DELETE_TREE;
            const canSaveTree = await adminPermissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            const trees = await this.getTrees({id});

            if (!trees.length) {
                throw new ValidationError({id: 'Unknown tree'});
            }

            if (trees.pop().system) {
                throw new ValidationError({id: 'Cannot delete system tree'});
            }

            return treeRepo.deleteTree(id);
        },
        async getTrees(filters?: ITreeFilterOptions): Promise<ITree[]> {
            return treeRepo.getTrees(filters);
        },
        async addElement(
            treeId: string,
            element: ITreeElement,
            parent: ITreeElement | null = null
        ): Promise<ITreeElement> {
            const errors: any = {};

            if (!(await _treeExists(treeId))) {
                errors.treeId = 'Unknown tree';
            }

            if (!(await _treeElementExists(element))) {
                errors.element = 'Unknown element';
            }

            if (parent !== null && !(await _treeElementExists(parent))) {
                errors.parent = 'Unknown parent';
            }

            if (await treeRepo.isElementPresent(treeId, element)) {
                errors.element = 'Element already present';
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.addElement(treeId, element, parent);
        },
        async moveElement(treeId: string, element: ITreeElement, parentTo: ITreeElement | null): Promise<ITreeElement> {
            const errors: any = {};

            if (!(await _treeExists(treeId))) {
                errors.treeId = 'Unknown tree';
            }

            if (!(await _treeElementExists(element))) {
                errors.element = 'Unknown element';
            }

            if (parentTo !== null && !(await _treeElementExists(parentTo))) {
                errors.parentTo = 'Unknown parent';
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.moveElement(treeId, element, parentTo);
        },
        async deleteElement(
            treeId: string,
            element: ITreeElement,
            deleteChildren: boolean | null = true
        ): Promise<ITreeElement> {
            const errors: any = {};

            if (!(await _treeExists(treeId))) {
                errors.treeId = 'Unknown tree';
            }

            if (!(await _treeElementExists(element))) {
                errors.element = 'Unknown element';
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.deleteElement(treeId, element, deleteChildren);
        },
        async getTreeContent(treeId: string, fields: string[]): Promise<ITreeNode[]> {
            const errors: any = {};
            if (!(await _treeExists(treeId))) {
                errors.treeId = 'Unknown tree';
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            const treeContent = await treeRepo.getTreeContent(treeId);

            return treeContent;
        },
        async getElementChildren(treeId: string, element: ITreeElement): Promise<ITreeNode[]> {
            return treeRepo.getElementChildren(treeId, element);
        },
        async getElementAncestors(treeId: string, element: ITreeElement): Promise<ITreeNode[]> {
            return treeRepo.getElementAncestors(treeId, element);
        },
        async getLinkedRecords(treeId: string, attribute: string, element: ITreeElement): Promise<IRecord[]> {
            const attrs = await attributeDomain.getAttributes({id: attribute});

            if (!attrs.length) {
                throw new ValidationError({id: 'Unknown attribute ' + attribute});
            }

            return treeRepo.getLinkedRecords(treeId, attribute, element);
        }
    };
}
