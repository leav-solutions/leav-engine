// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable jsdoc/check-indentation */

import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {omit} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import {IGetCoreEntitiesParams} from '_types/shared';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AppPermissionsActions} from '../../_types/permissions';
import {IRecord} from '../../_types/record';
import {ITree, ITreeElement, ITreeNode, TreeBehavior} from '../../_types/tree';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IRecordDomain} from '../record/recordDomain';
import {ITreeDataValidationHelper} from './helpers/treeDataValidation';
import validateFilesParent from './helpers/validateFilesParent';

export interface ITreeDomain {
    isElementPresent({
        treeId,
        element,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<boolean>;
    saveTree(tree: ITree, ctx: IQueryInfos): Promise<ITree>;
    deleteTree(id: string, ctx: IQueryInfos): Promise<ITree>;
    getTrees({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ITree>>;

    /**
     * Add an element to the tree
     * parent must be a record or null to add element to root
     */
    addElement({
        treeId,
        element,
        parent,
        order,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        parent: ITreeElement | null;
        order?: number;
        ctx: IQueryInfos;
    }): Promise<ITreeElement>;

    /**
     * Move an element in the tree
     *
     * parentFrom A record or null to move from root
     * parentTo A record or null to move to root
     */
    moveElement({
        treeId,
        element,
        parentTo,
        order,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        parentTo: ITreeElement | null;
        order?: number;
        ctx: IQueryInfos;
    }): Promise<ITreeElement>;

    /**
     * Delete an element from the tree
     *
     * parent A record or null to delete from root
     */
    deleteElement({
        treeId,
        element,
        deleteChildren,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        deleteChildren: boolean | null;
        ctx: IQueryInfos;
    }): Promise<ITreeElement>;

    /* eslint-disable jsdoc/check-indentation */
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
     */
    getTreeContent({
        treeId,
        startingNode,
        ctx
    }: {
        treeId: string;
        startingNode?: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Retrieve first level children of an element
     */
    getElementChildren({
        treeId,
        element,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Retrieve all ancestors of an element, including element itself and starting from the root
     */
    getElementAncestors({
        treeId,
        element,
        ctx
    }: {
        treeId: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Retrieve all records linked to an element via given attribute
     */
    getLinkedRecords({
        treeId,
        attribute,
        element,
        ctx
    }: {
        treeId: string;
        attribute: string;
        element: ITreeElement;
        ctx: IQueryInfos;
    }): Promise<IRecord[]>;

    getLibraryTreeId(library: string, ctx: IQueryInfos): string;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.app'?: IAppPermissionDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree.helpers.treeDataValidation'?: ITreeDataValidationHelper;
    'core.infra.tree'?: ITreeRepo;
    'core.utils'?: IUtils;
}

export default function({
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission.app': appPermissionDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper = null,
    'core.infra.tree': treeRepo = null,
    'core.utils': utils = null
}: IDeps = {}): ITreeDomain {
    async function _getTreeProps(treeId: string, ctx: IQueryInfos): Promise<ITree | null> {
        const trees = await treeRepo.getTrees({params: {filters: {id: treeId}}, ctx});

        return trees.list.length ? trees.list[0] : null;
    }

    async function _isExistingTree(treeId: string, ctx: IQueryInfos): Promise<boolean> {
        const treeProps = await _getTreeProps(treeId, ctx);

        return !!treeProps;
    }

    async function _treeElementExists(treeElement: ITreeElement, ctx: IQueryInfos) {
        const record = await recordDomain.find({
            params: {
                library: treeElement.library,
                filters: [{field: 'id', value: `${treeElement.id}`}],
                retrieveInactive: true
            },
            ctx
        });

        return !!record.list.length;
    }

    return {
        async saveTree(treeData: ITree, ctx: IQueryInfos): Promise<ITree> {
            // Check is existing tree
            const isExistingTree = await _isExistingTree(treeData.id, ctx);

            // Check permissions
            const action = isExistingTree ? AppPermissionsActions.EDIT_TREE : AppPermissionsActions.CREATE_TREE;
            const canSaveTree = await appPermissionDomain.getAppPermission({action, userId: ctx.userId, ctx});

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            // Get data to save
            const defaultParams = {id: '', behavior: TreeBehavior.STANDARD, system: false, label: {fr: '', en: ''}};

            // If existing tree, skip all uneditable fields from supplied params.
            // If new tree, merge default params with supplied params
            const uneditableFields = ['behavior', 'system'];
            const dataToSave = isExistingTree ? omit(treeData, uneditableFields) : {...defaultParams, ...treeData};

            // Validate tree data
            await treeDataValidationHelper.validate(dataToSave as ITree, ctx);

            // Save
            const savedTree = isExistingTree
                ? await treeRepo.updateTree({treeData: dataToSave as ITree, ctx})
                : await treeRepo.createTree({treeData: dataToSave as ITree, ctx});

            return savedTree;
        },
        async deleteTree(id: string, ctx: IQueryInfos): Promise<ITree> {
            // Check permissions
            const action = AppPermissionsActions.DELETE_TREE;
            const canSaveTree = await appPermissionDomain.getAppPermission({action, userId: ctx.userId, ctx});

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            const trees = await this.getTrees({params: {filters: {id}}, ctx});

            if (!trees.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_TREE});
            }

            if (trees.list.pop().system) {
                throw new ValidationError({id: Errors.SYSTEM_TREE_DELETION});
            }

            return treeRepo.deleteTree({id, ctx});
        },
        async getTrees({params, ctx}: {params?: IGetCoreEntitiesParams; ctx: IQueryInfos}): Promise<IList<ITree>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return treeRepo.getTrees({params: initializedParams, ctx});
        },
        async addElement({treeId, element, parent = null, order = 0, ctx}): Promise<ITreeElement> {
            const errors: any = {};
            const treeProps = await _getTreeProps(treeId, ctx);
            const treeExists = !!treeProps;

            if (!(await _isExistingTree(treeId, ctx))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (!(await _treeElementExists(element, ctx))) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (parent !== null && !(await _treeElementExists(parent, ctx))) {
                errors.parent = Errors.UNKNOWN_PARENT;
            }

            if (await treeRepo.isElementPresent({treeId, element, ctx})) {
                errors.element = Errors.ELEMENT_ALREADY_PRESENT;
            }

            // If files tree, check if parent is not a file
            if (treeExists && treeProps.behavior === TreeBehavior.FILES) {
                const validateParentDir = await validateFilesParent(parent, {valueDomain}, ctx);

                if (!validateParentDir.isValid) {
                    errors.parent = validateParentDir.message;
                }
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.addElement({treeId, element, parent, order, ctx});
        },
        async moveElement({treeId, element, parentTo = null, order = 0, ctx}): Promise<ITreeElement> {
            const errors: any = {};
            const treeProps = await _getTreeProps(treeId, ctx);
            const treeExists = !!treeProps;

            if (!(await _isExistingTree(treeId, ctx))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (!(await _treeElementExists(element, ctx))) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (parentTo !== null && !(await _treeElementExists(parentTo, ctx))) {
                errors.parentTo = Errors.UNKNOWN_PARENT;
            }

            // If files tree, check if parent is not a file
            if (treeExists && treeProps.behavior === TreeBehavior.FILES) {
                const validateParentDir = await validateFilesParent(parentTo, {valueDomain}, ctx);
                if (!validateParentDir.isValid) {
                    errors.parent = validateParentDir.message;
                }
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.moveElement({treeId, element, parentTo, order, ctx});
        },
        async deleteElement({treeId, element, deleteChildren = true, ctx}): Promise<ITreeElement> {
            const errors: any = {};

            if (!(await _isExistingTree(treeId, ctx))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (!(await _treeElementExists(element, ctx))) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.deleteElement({treeId, element, deleteChildren, ctx});
        },
        async getTreeContent({treeId, startingNode = null, ctx}): Promise<ITreeNode[]> {
            const errors: any = {};
            if (!(await _isExistingTree(treeId, ctx))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            const treeContent = await treeRepo.getTreeContent({treeId, startingNode, ctx});

            return treeContent;
        },
        async getElementChildren({treeId, element, ctx}): Promise<ITreeNode[]> {
            return treeRepo.getElementChildren({treeId, element, ctx});
        },
        async getElementAncestors({treeId, element, ctx}): Promise<ITreeNode[]> {
            return treeRepo.getElementAncestors({treeId, element, ctx});
        },
        async getLinkedRecords({treeId, attribute, element, ctx}): Promise<IRecord[]> {
            const attrs = await attributeDomain.getAttributes({params: {filters: {id: attribute}}, ctx});

            if (!attrs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            return treeRepo.getLinkedRecords({treeId, attribute, element, ctx});
        },
        async isElementPresent({treeId, element, ctx}): Promise<boolean> {
            return treeRepo.isElementPresent({treeId, element, ctx});
        },
        getLibraryTreeId(library, ctx) {
            return utils.getLibraryTreeId(library);
        }
    };
}
