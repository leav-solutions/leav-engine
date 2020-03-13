import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {difference, omit} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {LibraryBehavior} from '../../_types/library';
import {IList, SortOrder} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {IRecord} from '../../_types/record';
import {ITree, ITreeElement, ITreeNode, TreeBehavior} from '../../_types/tree';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {ILibraryDomain} from '../library/libraryDomain';
import {IPermissionDomain} from '../permission/permissionDomain';
import {IRecordDomain} from '../record/recordDomain';
import validateFilesParent from './helpers/validateFilesParent';

export interface ITreeDomain {
    isElementPresent(treeId: string, element: ITreeElement): Promise<boolean>;
    saveTree(tree: ITree, infos: IQueryInfos): Promise<ITree>;
    deleteTree(id: string, infos: IQueryInfos): Promise<ITree>;
    getTrees(params?: IGetCoreEntitiesParams): Promise<IList<ITree>>;

    /**
     * Add an element to the tree
     *
     * @param element
     * @param parent Parent must be a record or null to add element to root
     */
    addElement(
        treeId: string,
        element: ITreeElement,
        parent: ITreeElement | null,
        order?: number
    ): Promise<ITreeElement>;

    /**
     * Move an element in the tree
     *
     * @param element
     * @param parentFrom A record or null to move from root
     * @param parentTo A record or null to move to root
     */
    moveElement(
        treeId: string,
        element: ITreeElement,
        parentTo: ITreeElement | null,
        order?: number
    ): Promise<ITreeElement>;

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
    getTreeContent(treeId: string, startingNode?: ITreeElement): Promise<ITreeNode[]>;

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

    getLibraryTreeId(library: string): string;
}

interface IDeps {
    'core.infra.tree'?: ITreeRepo;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.value'?: IValueDomain;
    'core.utils'?: IUtils;
}
export default function({
    'core.infra.tree': treeRepo = null,
    'core.domain.library': libraryDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.domain.value': valueDomain = null,
    'core.utils': utils = null
}: IDeps = {}): ITreeDomain {
    async function _getTreeProps(treeId: string): Promise<ITree | null> {
        const trees = await treeRepo.getTrees({filters: {id: treeId}});

        return trees.list.length ? trees.list[0] : null;
    }

    async function _treeExists(treeId: string): Promise<boolean> {
        const treeProps = await _getTreeProps(treeId);

        return !!treeProps;
    }

    async function _treeElementExists(treeElement: ITreeElement) {
        const record = await recordDomain.find({
            library: treeElement.library,
            filters: {
                id: `${treeElement.id}`
            },
            retrieveInactive: true
        });

        return !!record.list.length;
    }

    return {
        async saveTree(treeData: ITree, infos: IQueryInfos): Promise<ITree> {
            const trees = await treeRepo.getTrees({filters: {id: treeData.id}});
            const existingTree = !!trees.list.length;

            const defaultParams = {id: '', behavior: TreeBehavior.STANDARD, system: false, label: {fr: '', en: ''}};

            // If existing tree, skip all uneditable fields from supplied params.
            // If new tree, merge default params with supplied params
            const uneditableFields = ['behavior', 'system'];
            const dataToSave = existingTree ? omit(treeData, uneditableFields) : {...defaultParams, ...treeData};

            // Check permissions
            const action = existingTree ? AdminPermissionsActions.EDIT_TREE : AdminPermissionsActions.CREATE_TREE;
            const canSaveTree = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            if (!utils.validateID(treeData.id)) {
                throw new ValidationError({id: Errors.INVALID_ID_FORMAT});
            }

            // Check if all libraries exists
            const libs = await libraryDomain.getLibraries();
            const libsIds = libs.list.map(lib => lib.id);

            const unknownLibs = difference(dataToSave.libraries, libsIds);

            if (unknownLibs.length) {
                throw new ValidationError({
                    libraries: {msg: Errors.UNKNOWN_LIBRARIES, vars: {libraries: unknownLibs.join(', ')}}
                });
            }

            // On files behavior, check if we have only 1 files lib
            if (treeData.behavior === TreeBehavior.FILES) {
                if (dataToSave.libraries.length > 1) {
                    throw new ValidationError<ITree>({libraries: Errors.TOO_MUCH_LIBRARIES_ON_FILES_TREE});
                }

                const linkedLib = libs.list.filter(l => l.id === dataToSave.libraries[0])[0];
                if (linkedLib.behavior !== LibraryBehavior.FILES) {
                    throw new ValidationError<ITree>({libraries: Errors.NON_FILES_LIBRARY});
                }
            }

            const savedTree = existingTree
                ? await treeRepo.updateTree(dataToSave as ITree)
                : await treeRepo.createTree(dataToSave as ITree);

            return savedTree;
        },
        async deleteTree(id: string, infos: IQueryInfos): Promise<ITree> {
            // Check permissions
            const action = AdminPermissionsActions.DELETE_TREE;
            const canSaveTree = await permissionDomain.getAdminPermission(action, infos.userId);

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            const trees = await this.getTrees({filters: {id}});

            if (!trees.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_TREE});
            }

            if (trees.list.pop().system) {
                throw new ValidationError({id: Errors.SYSTEM_TREE_DELETION});
            }

            return treeRepo.deleteTree(id);
        },
        async getTrees(params?: IGetCoreEntitiesParams): Promise<IList<ITree>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return treeRepo.getTrees(initializedParams);
        },
        async addElement(
            treeId: string,
            element: ITreeElement,
            parent: ITreeElement | null = null,
            order: number = 0
        ): Promise<ITreeElement> {
            const errors: any = {};
            const treeProps = await _getTreeProps(treeId);
            const treeExists = !!treeProps;

            if (!(await _treeExists(treeId))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (!(await _treeElementExists(element))) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (parent !== null && !(await _treeElementExists(parent))) {
                errors.parent = Errors.UNKNOWN_PARENT;
            }

            if (await treeRepo.isElementPresent(treeId, element)) {
                errors.element = Errors.ELEMENT_ALREADY_PRESENT;
            }

            // If files tree, check if parent is not a file
            if (treeExists && treeProps.behavior === TreeBehavior.FILES) {
                const validateParentDir = await validateFilesParent(parent, {valueDomain});

                if (!validateParentDir.isValid) {
                    errors.parent = validateParentDir.message;
                }
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.addElement(treeId, element, parent, order);
        },
        async moveElement(
            treeId: string,
            element: ITreeElement,
            parentTo: ITreeElement | null = null,
            order: number = 0
        ): Promise<ITreeElement> {
            const errors: any = {};
            const treeProps = await _getTreeProps(treeId);
            const treeExists = !!treeProps;

            if (!(await _treeExists(treeId))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (!(await _treeElementExists(element))) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (parentTo !== null && !(await _treeElementExists(parentTo))) {
                errors.parentTo = Errors.UNKNOWN_PARENT;
            }

            // If files tree, check if parent is not a file
            if (treeExists && treeProps.behavior === TreeBehavior.FILES) {
                const validateParentDir = await validateFilesParent(parentTo, {valueDomain});
                if (!validateParentDir.isValid) {
                    errors.parent = validateParentDir.message;
                }
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.moveElement(treeId, element, parentTo, order);
        },
        async deleteElement(
            treeId: string,
            element: ITreeElement,
            deleteChildren: boolean | null = true
        ): Promise<ITreeElement> {
            const errors: any = {};

            if (!(await _treeExists(treeId))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (!(await _treeElementExists(element))) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.deleteElement(treeId, element, deleteChildren);
        },
        async getTreeContent(treeId: string, startingNode: ITreeElement = null): Promise<ITreeNode[]> {
            const errors: any = {};
            if (!(await _treeExists(treeId))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            const treeContent = await treeRepo.getTreeContent(treeId, startingNode);

            return treeContent;
        },
        async getElementChildren(treeId: string, element: ITreeElement): Promise<ITreeNode[]> {
            return treeRepo.getElementChildren(treeId, element);
        },
        async getElementAncestors(treeId: string, element: ITreeElement): Promise<ITreeNode[]> {
            return treeRepo.getElementAncestors(treeId, element);
        },
        async getLinkedRecords(treeId: string, attribute: string, element: ITreeElement): Promise<IRecord[]> {
            const attrs = await attributeDomain.getAttributes({filters: {id: attribute}});

            if (!attrs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            return treeRepo.getLinkedRecords(treeId, attribute, element);
        },
        async isElementPresent(treeId: string, element: ITreeElement): Promise<boolean> {
            return treeRepo.isElementPresent(treeId, element);
        },
        getLibraryTreeId(library) {
            return utils.getLibraryTreeId(library);
        }
    };
}
