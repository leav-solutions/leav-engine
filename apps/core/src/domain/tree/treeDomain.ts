// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable jsdoc/check-indentation */

import {IAppPermissionDomain} from 'domain/permission/appPermissionDomain';
import {ITreeNodePermissionDomain} from 'domain/permission/treeNodePermissionDomain';
import {ITreePermissionDomain} from 'domain/permission/treePermissionDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {omit} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {IList, SortOrder} from '../../_types/list';
import {AppPermissionsActions, TreeNodePermissionsActions, TreePermissionsActions} from '../../_types/permissions';
import {AttributeCondition, IRecord} from '../../_types/record';
import {IGetCoreTreesParams, ITree, ITreeElement, ITreeNode, TreeBehavior, TreePaths} from '../../_types/tree';
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
    saveTree(tree: Partial<ITree>, ctx: IQueryInfos): Promise<ITree>;
    deleteTree(id: string, ctx: IQueryInfos): Promise<ITree>;
    getTrees({params, ctx}: {params?: IGetCoreTreesParams; ctx: IQueryInfos}): Promise<IList<ITree>>;
    getTreeProperties(treeId: string, ctx: IQueryInfos): Promise<ITree>;

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
    }): Promise<TreePaths>;

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
    'core.domain.permission.tree'?: ITreePermissionDomain;
    'core.domain.permission.treeNode'?: ITreeNodePermissionDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree.helpers.treeDataValidation'?: ITreeDataValidationHelper;
    'core.infra.tree'?: ITreeRepo;
    'core.utils'?: IUtils;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission.app': appPermissionDomain = null,
    'core.domain.permission.tree': treePermissionDomain = null,
    'core.domain.permission.treeNode': treeNodePermissionDomain = null,
    'core.domain.value': valueDomain = null,
    'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper = null,
    'core.infra.tree': treeRepo = null,
    'core.utils': utils = null
}: IDeps = {}): ITreeDomain {
    async function _getTreeProps(treeId: string, ctx: IQueryInfos): Promise<ITree | null> {
        const trees = await treeRepo.getTrees({params: {filters: {id: treeId}, strictFilters: true}, ctx});

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
                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: `${treeElement.id}`}],
                retrieveInactive: true
            },
            ctx
        });

        return !!record.list.length;
    }

    const _isForbiddenAsChild = (treeProps: ITree, parent: ITreeElement, element: ITreeElement): boolean =>
        (parent === null && !treeProps.libraries?.[element.library]?.allowedAtRoot) ||
        (parent !== null &&
            !treeProps.libraries?.[parent.library]?.allowedChildren.includes('__all__') &&
            !treeProps.libraries?.[parent.library]?.allowedChildren.includes(element.library));

    return {
        async saveTree(treeData: Partial<ITree>, ctx: IQueryInfos): Promise<ITree> {
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
            const treeProps = await _getTreeProps(treeData.id, ctx);

            // If existing tree, skip all uneditable fields from supplied params.
            // If new tree, merge default params with supplied params
            const uneditableFields = ['behavior', 'system'];
            const dataToSave = isExistingTree
                ? {
                      ...defaultParams,
                      ...treeProps,
                      ...omit(treeData, uneditableFields)
                  }
                : {...defaultParams, ...treeData};

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
        async getTrees({params, ctx}: {params?: IGetCoreTreesParams; ctx: IQueryInfos}): Promise<IList<ITree>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return treeRepo.getTrees({params: initializedParams, ctx});
        },
        async getTreeProperties(treeId: string, ctx: IQueryInfos): Promise<ITree> {
            const tree = await _getTreeProps(treeId, ctx);

            if (!tree) {
                throw new ValidationError({
                    id: Errors.UNKNOWN_TREE
                });
            }

            return tree;
        },
        async addElement({treeId, element, parent = null, order = 0, ctx}): Promise<ITreeElement> {
            const errors: any = {};
            const treeProps = await _getTreeProps(treeId, ctx);
            const treeExists = !!treeProps;

            if (!(await _isExistingTree(treeId, ctx))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            const elementExists = await _treeElementExists(element, ctx);

            if (!elementExists) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (parent !== null && !(await _treeElementExists(parent, ctx))) {
                errors.parentTo = Errors.UNKNOWN_PARENT;
            }

            // check allow as children setting
            if (treeExists && elementExists && _isForbiddenAsChild(treeProps, parent, element)) {
                errors.element = Errors.LIBRARY_FORBIDDEN_AS_CHILD;
            }

            if (treeExists && elementExists && (await treeRepo.isElementPresent({treeId, element, ctx}))) {
                if (!treeProps.libraries[element.library].allowMultiplePositions) {
                    errors.element = Errors.ELEMENT_ALREADY_PRESENT;
                    // if allow multiple positions is true, check if parents are not same
                } else {
                    if (
                        parent &&
                        (await this.getElementAncestors({treeId, element: parent, ctx})).some(ancestors =>
                            ancestors.some(a => a.record.id === element.id && a.record.library === element.library)
                        )
                    ) {
                        errors.element = Errors.ELEMENT_ALREADY_PRESENT_IN_ANCESTORS;
                    }

                    const siblings = parent
                        ? await treeRepo.getElementChildren({
                              treeId,
                              element: {library: element.library, id: parent.id},
                              ctx
                          })
                        : await treeRepo.getTreeContent({
                              treeId,
                              ctx
                          });

                    if (siblings.some(c => c.record?.id === element.id)) {
                        errors.element = Errors.ELEMENT_WITH_SAME_PATH_ALREADY_PRESENT;
                    }
                }
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

            const elementExists = await _treeElementExists(element, ctx);

            if (!elementExists) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (parentTo !== null && !(await _treeElementExists(parentTo, ctx))) {
                errors.parentTo = Errors.UNKNOWN_PARENT;
            }

            // Check permissions on source
            const parents = await this.getElementAncestors({treeId, element, ctx});
            let canEditSourceChildren: boolean;
            if (parents.length > 1) {
                canEditSourceChildren = (
                    await Promise.all(
                        parents.map(ancestorBranch => {
                            const parent = ancestorBranch.splice(-2, 1)[0];
                            return treeNodePermissionDomain.getTreeNodePermission({
                                treeId,
                                action: TreeNodePermissionsActions.EDIT_CHILDREN,
                                node: {id: parent.record.id, library: parent.record.library},
                                userId: ctx.userId,
                                ctx
                            });
                        })
                    )
                ).reduce((isAllowed, ancestorBranchPermission): boolean => isAllowed || ancestorBranchPermission);
            } else {
                canEditSourceChildren = await treePermissionDomain.getTreePermission({
                    treeId,
                    action: TreePermissionsActions.EDIT_CHILDREN,
                    userId: ctx.userId,
                    ctx
                });
            }

            // Check permissions on destination
            const canEditDestinationChildren = parentTo
                ? treeNodePermissionDomain.getTreeNodePermission({
                      treeId,
                      action: TreeNodePermissionsActions.EDIT_CHILDREN,
                      node: parentTo,
                      userId: ctx.userId,
                      ctx
                  })
                : treePermissionDomain.getTreePermission({
                      treeId,
                      action: TreePermissionsActions.EDIT_CHILDREN,
                      userId: ctx.userId,
                      ctx
                  });

            if (!canEditSourceChildren || !canEditDestinationChildren) {
                throw new PermissionError(TreePermissionsActions.EDIT_CHILDREN);
            }

            // check allow as children setting
            if (treeExists && elementExists && _isForbiddenAsChild(treeProps, parentTo, element)) {
                errors.element = Errors.LIBRARY_FORBIDDEN_AS_CHILD;
            }

            if (
                treeExists &&
                elementExists &&
                parentTo &&
                (await this.getElementAncestors({treeId, element: parentTo, ctx})).some(ancestors =>
                    ancestors.some(a => a.record.id === element.id && a.record.library === element.library)
                )
            ) {
                errors.element = Errors.ELEMENT_ALREADY_PRESENT_IN_ANCESTORS;
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

            const canDetach = await treeNodePermissionDomain.getTreeNodePermission({
                treeId,
                action: TreeNodePermissionsActions.DETACH,
                node: element,
                userId: ctx.userId,
                ctx
            });

            if (!canDetach) {
                throw new PermissionError(TreeNodePermissionsActions.DETACH);
            }

            return treeRepo.deleteElement({treeId, element, deleteChildren, ctx});
        },
        async getTreeContent({treeId, startingNode = null, ctx}): Promise<ITreeNode[]> {
            const errors: any = {};
            if (!(await _isExistingTree(treeId, ctx))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            const isTreeAccessible = await treePermissionDomain.getTreePermission({
                treeId,
                action: TreePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                ctx
            });

            if (!isTreeAccessible) {
                throw new PermissionError(TreePermissionsActions.ACCESS_TREE);
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors);
            }

            return treeRepo.getTreeContent({treeId, startingNode, ctx});
        },
        async getElementChildren({treeId, element, ctx}): Promise<ITreeNode[]> {
            return treeRepo.getElementChildren({treeId, element, ctx});
        },
        async getElementAncestors({treeId, element, ctx}): Promise<TreePaths> {
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
