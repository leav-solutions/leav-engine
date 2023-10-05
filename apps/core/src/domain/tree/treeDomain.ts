// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {IAdminPermissionDomain} from 'domain/permission/adminPermissionDomain';
import {ITreeNodePermissionDomain} from 'domain/permission/treeNodePermissionDomain';
import {ITreePermissionDomain} from 'domain/permission/treePermissionDomain';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IVersionProfileRepo} from 'infra/versionProfile/versionProfileRepo';
import {omit} from 'lodash';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {ECacheType, ICachesService} from '../../infra/cache/cacheService';
import {Errors} from '../../_types/errors';
import {EventAction} from '../../_types/event';
import {TriggerNames} from '../../_types/eventsManager';
import {IList, IPaginationParams, SortOrder} from '../../_types/list';
import {
    AdminPermissionsActions,
    PermissionTypes,
    TreeNodePermissionsActions,
    TreePermissionsActions
} from '../../_types/permissions';
import {AttributeCondition, IRecord} from '../../_types/record';
import {
    IGetCoreTreesParams,
    ITree,
    ITreeElement,
    ITreeNode,
    ITreeNodeLight,
    TreeBehavior,
    TreeEventTypes,
    TreePaths
} from '../../_types/tree';
import {IAttributeDomain} from '../attribute/attributeDomain';
import getPermissionCachePatternKey from '../permission/helpers/getPermissionCachePatternKey';
import {PERMISSIONS_CACHE_HEADER} from '../permission/_types';
import {IRecordDomain} from '../record/recordDomain';
import {IElementAncestorsHelper} from './helpers/elementAncestors';
import {IGetDefaultElementHelper} from './helpers/getDefaultElement';
import {HandleRemovedLibrariesFunc} from './helpers/handleRemovedLibraries';
import {ITreeDataValidationHelper} from './helpers/treeDataValidation';

export interface ITreeDomain {
    isNodePresent(params: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<boolean>;
    isRecordPresent(params: {treeId: string; record: ITreeElement; ctx: IQueryInfos}): Promise<boolean>;
    saveTree(tree: Partial<ITree>, ctx: IQueryInfos): Promise<ITree>;
    deleteTree(id: string, ctx: IQueryInfos): Promise<ITree>;
    getTrees(params: {params?: IGetCoreTreesParams; ctx: IQueryInfos}): Promise<IList<ITree>>;
    getTreeProperties(treeId: string, ctx: IQueryInfos): Promise<ITree>;

    /**
     * Add an element to the tree
     * parent must be a record or null to add element to root
     */
    addElement(params: {
        treeId: string;
        element: ITreeElement;
        parent: string | null;
        order?: number;
        ctx: IQueryInfos;
    }): Promise<ITreeNodeLight>;

    /**
     * Move an element in the tree
     *
     * parentFrom A record or null to move from root
     * parentTo A record or null to move to root
     */
    moveElement(params: {
        treeId: string;
        nodeId: string;
        parentTo: string | null;
        order?: number;
        ctx: IQueryInfos;
        skipChecks?: boolean;
    }): Promise<ITreeNodeLight>;

    /**
     * Delete an element from the tree
     *
     * parent A record or null to delete from root
     */
    deleteElement(params: {
        treeId: string;
        nodeId: string;
        deleteChildren: boolean | null;
        ctx: IQueryInfos;
    }): Promise<ITreeNodeLight>;

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
    getTreeContent(params: {
        treeId: string;
        startingNode?: string;
        depth?: number;
        childrenCount?: boolean;
        ctx: IQueryInfos;
    }): Promise<ITreeNode[]>;

    /**
     * Retrieve first level children of an element
     */
    getElementChildren(params: {
        treeId: string;
        nodeId: string;
        childrenCount?: boolean;
        withTotalCount?: boolean;
        pagination?: IPaginationParams;
        ctx: IQueryInfos;
    }): Promise<IList<ITreeNode>>;

    /**
     * Retrieve all ancestors of an element, including element itself and starting from the root
     */
    getElementAncestors(params: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<TreePaths>;

    /**
     * Retrieve all records linked to an element via given attribute
     */
    getLinkedRecords(params: {treeId: string; attribute: string; nodeId: string; ctx: IQueryInfos}): Promise<IRecord[]>;

    getLibraryTreeId(library: string, ctx: IQueryInfos): string;
    getRecordByNodeId(params: {treeId: string; nodeId: string; ctx: IQueryInfos}): Promise<IRecord>;
    getNodesByRecord(params: {treeId: string; record: ITreeElement; ctx: IQueryInfos}): Promise<string[]>;
    getDefaultElement(params: {treeId: string; ctx: IQueryInfos}): Promise<ITreeNode>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission.admin'?: IAdminPermissionDomain;
    'core.domain.permission.tree'?: ITreePermissionDomain;
    'core.domain.permission.treeNode'?: ITreeNodePermissionDomain;
    'core.domain.tree.helpers.treeDataValidation'?: ITreeDataValidationHelper;
    'core.domain.helpers.getCoreEntityById'?: GetCoreEntityByIdFunc;
    'core.domain.tree.helpers.elementAncestors'?: IElementAncestorsHelper;
    'core.domain.tree.helpers.handleRemovedLibraries'?: HandleRemovedLibrariesFunc;
    'core.domain.tree.helpers.getDefaultElement'?: IGetDefaultElementHelper;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.infra.library'?: ILibraryRepo;
    'core.infra.tree'?: ITreeRepo;
    'core.infra.versionProfile'?: IVersionProfileRepo;
    'core.utils'?: IUtils;
    'core.infra.cache.cacheService'?: ICachesService;
}

export default function({
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission.admin': adminPermissionDomain = null,
    'core.domain.permission.tree': treePermissionDomain = null,
    'core.domain.permission.treeNode': treeNodePermissionDomain = null,
    'core.domain.tree.helpers.treeDataValidation': treeDataValidationHelper = null,
    'core.domain.helpers.getCoreEntityById': getCoreEntityById = null,
    'core.domain.tree.helpers.elementAncestors': elementAncestorsHelper = null,
    'core.domain.tree.helpers.handleRemovedLibraries': handleRemovedLibraries = null,
    'core.domain.tree.helpers.getDefaultElement': getDefaultElementHelper = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.infra.library': libraryRepo = null,
    'core.infra.tree': treeRepo = null,
    'core.infra.versionProfile': versionProfileRepo = null,
    'core.utils': utils = null,
    'core.infra.cache.cacheService': cacheService = null
}: IDeps = {}): ITreeDomain {
    async function _isExistingTree(treeId: string, ctx: IQueryInfos): Promise<boolean> {
        const treeProps = await getCoreEntityById<ITree>('tree', treeId, ctx);

        return !!treeProps;
    }

    async function _isRecordExisting(element: ITreeElement, ctx: IQueryInfos) {
        const record = await recordDomain.find({
            params: {
                library: element.library,
                filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: `${element.id}`}],
                retrieveInactive: true
            },
            ctx
        });

        return !!record.list.length;
    }

    const _isForbiddenAsChild = (treeProps: ITree, parent: ITreeElement | null, element: ITreeElement): boolean =>
        (parent === null && !treeProps.libraries?.[element.library]?.allowedAtRoot) ||
        (parent !== null &&
            !treeProps.libraries?.[parent.library]?.allowedChildren.includes('__all__') &&
            !treeProps.libraries?.[parent.library]?.allowedChildren.includes(element.library));

    const _clearLibraries = async (libraries: string[]): Promise<void> => {
        const keys = [];

        for (const libId of libraries) {
            keys.push(
                getPermissionCachePatternKey({
                    permissionType: PermissionTypes.LIBRARY,
                    applyTo: libId
                }),
                getPermissionCachePatternKey({
                    permissionType: PermissionTypes.RECORD,
                    applyTo: libId
                })
            );
        }

        await cacheService.getCache(ECacheType.RAM).deleteData(keys);
    };

    const _clearTrees = async (trees: string[]): Promise<void> => {
        const keys = [];

        for (const treeId of trees) {
            keys.push(
                getPermissionCachePatternKey({
                    permissionType: PermissionTypes.TREE,
                    applyTo: treeId
                }),
                getPermissionCachePatternKey({
                    permissionType: PermissionTypes.TREE_LIBRARY,
                    applyTo: treeId
                }),
                getPermissionCachePatternKey({
                    permissionType: PermissionTypes.TREE_NODE,
                    applyTo: treeId
                })
            );
        }

        await cacheService.getCache(ECacheType.RAM).deleteData(keys);
    };

    const _clearAttributes = async (attributes: string[]): Promise<void> => {
        const keys = [];

        for (const attributeId of attributes) {
            keys.push(
                getPermissionCachePatternKey({
                    permissionType: PermissionTypes.ATTRIBUTE,
                    applyTo: attributeId
                }),
                getPermissionCachePatternKey({
                    permissionType: PermissionTypes.RECORD_ATTRIBUTE,
                    applyTo: attributeId
                })
            );
        }

        await cacheService.getCache(ECacheType.RAM).deleteData(keys);
    };

    const _cleanPermissionsCacheRelatedToTree = async (treeId: string, ctx: IQueryInfos): Promise<void> => {
        if (treeId === 'users_groups') {
            return cacheService.getCache(ECacheType.RAM).deleteData([`${PERMISSIONS_CACHE_HEADER}:*`]);
        }

        const attributes = (await attributeDomain.getAttributes({params: {filters: {linked_tree: treeId}}, ctx})).list;

        const libraries = (await libraryRepo.getLibraries({ctx})).list
            .filter(l => !!l.permissions_conf)
            .filter(library => {
                let isUsingAttributes = false;
                for (const attrs of library.permissions_conf?.permissionTreeAttributes) {
                    isUsingAttributes = !!attributes.filter(a => attrs.includes(a.id)).length || isUsingAttributes;
                }
                return isUsingAttributes;
            });

        await _clearLibraries(libraries.map(l => l.id));

        const trees = (await treeRepo.getTrees({ctx})).list
            .filter(tree => !!tree.permissions_conf)
            .filter(tree => {
                let isUsingAttributes = false;
                for (const [lib, treePermissionsConf] of Object.entries(tree.permissions_conf)) {
                    isUsingAttributes =
                        !!attributes.filter(a => treePermissionsConf.permissionTreeAttributes.includes(a.id)).length ||
                        isUsingAttributes;
                }
                return isUsingAttributes;
            });

        await _clearTrees(trees.map(t => t.id));

        const attribs = (await attributeDomain.getAttributes({ctx})).list
            .filter(a => !!a.permissions_conf)
            .filter(attribute => {
                let isUsingAttributes = false;
                for (const attrs of attribute.permissions_conf?.permissionTreeAttributes) {
                    isUsingAttributes = !!attributes.filter(a => attrs.includes(a.id)).length || isUsingAttributes;
                }
                return isUsingAttributes;
            });

        await _clearAttributes(attribs.map(a => a.id));
    };

    const _clearAllTreeCaches = async (treeId: string, ctx: IQueryInfos): Promise<void> => {
        await _cleanPermissionsCacheRelatedToTree(treeId, ctx);
        await elementAncestorsHelper.clearElementAncestorsCache({treeId, ctx});
        await getDefaultElementHelper.clearCache({treeId, ctx});
    };

    const _sendTreeEvent = async (
        params: {
            treeId: string;
            type: TreeEventTypes;
            element?: ITreeNodeLight;
            record: IRecord;
            parentNode: string;
            parentNodeBefore?: string;
            order: number;
        },
        ctx: IQueryInfos
    ): Promise<void> => {
        const {treeId, type, record, element, parentNode, parentNodeBefore, order} = params;
        const actionByType: {[key in TreeEventTypes]: EventAction} = {
            [TreeEventTypes.ADD]: EventAction.TREE_ADD_ELEMENT,
            [TreeEventTypes.REMOVE]: EventAction.TREE_DELETE_ELEMENT,
            [TreeEventTypes.MOVE]: EventAction.TREE_MOVE_ELEMENT
        };

        await Promise.all([
            eventsManagerDomain.sendPubSubEvent(
                {
                    data: {
                        treeEvent: {
                            type,
                            treeId,
                            element: {...element, treeId},
                            parentNode: parentNode ? {id: parentNode, treeId} : null,
                            parentNodeBefore: parentNodeBefore ? {id: parentNodeBefore, treeId} : null,
                            order
                        }
                    },
                    triggerName: TriggerNames.TREE_EVENT
                },
                ctx
            ),
            eventsManagerDomain.sendDatabaseEvent(
                {
                    action: actionByType[type],
                    topic: {
                        tree: treeId,
                        record: {
                            id: record.id,
                            libraryId: record.library
                        }
                    },
                    before: parentNodeBefore ?? null,
                    after: parentNode ?? null
                },
                ctx
            )
        ]);
    };

    return {
        async saveTree(treeData: Partial<ITree>, ctx: IQueryInfos): Promise<ITree> {
            // Check is existing tree
            const isExistingTree = await _isExistingTree(treeData.id, ctx);

            // Check permissions
            const action = isExistingTree ? AdminPermissionsActions.EDIT_TREE : AdminPermissionsActions.CREATE_TREE;
            const canSaveTree = await adminPermissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            // Get data to save
            const defaultParams = {id: '', behavior: TreeBehavior.STANDARD, system: false, label: {fr: '', en: ''}};
            const treeProps = await getCoreEntityById<ITree>('tree', treeData.id, ctx);

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

            // If permissions conf changed we clean cache related to this tree.
            if (
                isExistingTree &&
                JSON.stringify(treeData.permissions_conf) !== JSON.stringify(treeProps.permissions_conf)
            ) {
                await _clearTrees([treeData.id]);
            }

            // Save
            const savedTree = isExistingTree
                ? await treeRepo.updateTree({treeData: dataToSave as ITree, ctx})
                : await treeRepo.createTree({treeData: dataToSave as ITree, ctx});

            await eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.TREE_SAVE,
                    topic: {
                        tree: savedTree.id
                    },
                    after: savedTree,
                    before: isExistingTree ? treeProps : null
                },
                ctx
            );

            if (isExistingTree) {
                const cacheKey = utils.getCoreEntityCacheKey('tree', dataToSave.id);
                await cacheService.getCache(ECacheType.RAM).deleteData([cacheKey]);

                await handleRemovedLibraries(treeProps, dataToSave as ITree, ctx);
            }

            return savedTree;
        },
        async deleteTree(id, ctx) {
            // Check permissions
            const action = AdminPermissionsActions.DELETE_TREE;
            const canSaveTree = await adminPermissionDomain.getAdminPermission({action, userId: ctx.userId, ctx});

            if (!canSaveTree) {
                throw new PermissionError(action);
            }

            // Check is existing tree
            const treeProps = await getCoreEntityById<ITree>('tree', id, ctx);

            if (!treeProps) {
                throw new ValidationError({id: Errors.UNKNOWN_TREE});
            }

            if (treeProps.system) {
                throw new ValidationError({id: Errors.SYSTEM_TREE_DELETION});
            }

            await _cleanPermissionsCacheRelatedToTree(treeProps.id, ctx);
            await elementAncestorsHelper.clearElementAncestorsCache({treeId: treeProps.id, ctx});

            // Remove tree from versions profile using it
            const versionProfiles = await versionProfileRepo.getVersionProfiles({
                params: {filters: {trees: treeProps.id}},
                ctx
            });
            if (versionProfiles.list.length) {
                await Promise.all(
                    versionProfiles.list.map(async versionProfile => {
                        const trees = versionProfile.trees.filter(t => t !== treeProps.id);
                        await versionProfileRepo.updateVersionProfile({
                            profileData: {...versionProfile, trees},
                            ctx
                        });
                    })
                );
            }

            const deletedTree = await treeRepo.deleteTree({id, ctx});

            await eventsManagerDomain.sendDatabaseEvent(
                {
                    action: EventAction.TREE_DELETE,
                    topic: {
                        tree: id
                    },
                    before: treeProps
                },
                ctx
            );

            const cacheKey = utils.getCoreEntityCacheKey('tree', id);
            await cacheService.getCache(ECacheType.RAM).deleteData([cacheKey, `${cacheKey}:*`]);

            return deletedTree;
        },
        async getTrees({params, ctx}: {params?: IGetCoreTreesParams; ctx: IQueryInfos}): Promise<IList<ITree>> {
            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return treeRepo.getTrees({params: initializedParams, ctx});
        },
        async getTreeProperties(treeId: string, ctx: IQueryInfos): Promise<ITree> {
            const tree = await getCoreEntityById<ITree>('tree', treeId, ctx);

            if (!tree) {
                throw utils.generateExplicitValidationError(
                    'id',
                    {msg: Errors.UNKNOWN_TREE, vars: {tree: treeId}},
                    ctx.lang
                );
            }

            return tree;
        },
        async addElement({treeId, element, parent = null, order = 0, ctx}): Promise<ITreeNodeLight> {
            const errors: any = {};
            const treeProps = await getCoreEntityById<ITree>('tree', treeId, ctx);
            const treeExists = !!treeProps;

            if (!treeExists) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            const isRecordExisting = await _isRecordExisting(element, ctx);

            if (!isRecordExisting) {
                errors.element = Errors.UNKNOWN_RECORD;
            }

            if (parent !== null && !(await treeRepo.isNodePresent({treeId, nodeId: parent, ctx}))) {
                errors.parentTo = Errors.UNKNOWN_PARENT;
            }

            // check allow as children setting
            const parentRecord = parent ? await treeRepo.getRecordByNodeId({treeId, nodeId: parent, ctx}) : null;
            const parentElement = parentRecord ? {id: parentRecord.id, library: parentRecord.library} : null;

            if (treeExists && isRecordExisting && _isForbiddenAsChild(treeProps, parentElement, element)) {
                errors.element = Errors.LIBRARY_FORBIDDEN_AS_CHILD;
            }

            const isRecordPresent = await treeRepo.isRecordPresent({treeId, record: element, ctx});
            if (treeExists && isRecordExisting && isRecordPresent) {
                if (!treeProps.libraries[element.library].allowMultiplePositions) {
                    errors.element = Errors.ELEMENT_ALREADY_PRESENT;
                    // if allow multiple positions is true, check if parents are not same
                } else {
                    const ancestors = await this.getElementAncestors({treeId, nodeId: parent, ctx});

                    if (
                        parent &&
                        ancestors.some(a => a.record.id === element.id && a.record.library === element.library)
                    ) {
                        errors.element = Errors.ELEMENT_ALREADY_PRESENT_IN_ANCESTORS;
                    }
                }
            }

            if (Object.keys(errors).length) {
                throw new ValidationError(errors, Object.values(errors).join(', '));
            }

            await getDefaultElementHelper.clearCache({treeId, ctx});

            const addedElement = await treeRepo.addElement({
                treeId,
                element,
                parent,
                order,
                ctx
            });

            await _sendTreeEvent(
                {type: TreeEventTypes.ADD, treeId, record: element, element: addedElement, parentNode: parent, order},
                ctx
            );

            return addedElement;
        },
        async moveElement({
            treeId,
            nodeId,
            parentTo = null,
            order = 0,
            ctx,
            skipChecks = false
        }): Promise<ITreeNodeLight> {
            const parents = await this.getElementAncestors({treeId, nodeId, ctx});
            const parentBefore = parents.length > 1 ? [...parents].splice(-2, 1)[0] : null;

            const errors: any = {};
            let treeExists;
            let nodeExists;
            let treeProps;
            let parentElement;
            let nodeElement;
            const nodeRecord = await treeRepo.getRecordByNodeId({treeId, nodeId, ctx});
            if (!skipChecks) {
                treeProps = await getCoreEntityById<ITree>('tree', treeId, ctx);
                treeExists = !!treeProps;

                if (!(await _isExistingTree(treeId, ctx))) {
                    errors.treeId = Errors.UNKNOWN_TREE;
                }

                nodeExists = await treeRepo.isNodePresent({treeId, nodeId, ctx});
                if (!nodeExists) {
                    errors.element = Errors.UNKNOWN_ELEMENT;
                }

                const parentExists = await treeRepo.isNodePresent({treeId, nodeId: parentTo, ctx});
                if (parentTo !== null && !parentExists) {
                    errors.parentTo = Errors.UNKNOWN_PARENT;
                }

                nodeElement = {id: nodeRecord.id, library: nodeRecord.library};
                const parentRecord = parentTo
                    ? await treeRepo.getRecordByNodeId({treeId, nodeId: parentTo, ctx})
                    : null;
                parentElement = parentRecord ? {id: parentRecord.id, library: parentRecord.library} : null;

                // Check permissions on source
                let canEditSourceChildren: boolean;
                if (parentBefore) {
                    canEditSourceChildren = await treeNodePermissionDomain.getTreeNodePermission({
                        treeId,
                        action: TreeNodePermissionsActions.EDIT_CHILDREN,
                        nodeId: parentBefore.id,
                        userId: ctx.userId,
                        ctx
                    });
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
                    ? await treeNodePermissionDomain.getTreeNodePermission({
                          treeId,
                          action: TreeNodePermissionsActions.EDIT_CHILDREN,
                          nodeId: parentTo,
                          userId: ctx.userId,
                          ctx
                      })
                    : await treePermissionDomain.getTreePermission({
                          treeId,
                          action: TreePermissionsActions.EDIT_CHILDREN,
                          userId: ctx.userId,
                          ctx
                      });

                if (!canEditSourceChildren || !canEditDestinationChildren) {
                    throw new PermissionError(TreePermissionsActions.EDIT_CHILDREN);
                }

                // check allow as children setting
                if (treeExists && nodeExists && _isForbiddenAsChild(treeProps, parentElement, nodeElement)) {
                    errors.element = Errors.LIBRARY_FORBIDDEN_AS_CHILD;
                }

                if (
                    treeExists &&
                    nodeExists &&
                    parentTo &&
                    (await this.getElementAncestors({treeId, nodeId: parentTo, ctx})).some(
                        a => a.record.id === nodeRecord.id && a.record.library === nodeRecord.library
                    )
                ) {
                    errors.element = Errors.ELEMENT_ALREADY_PRESENT_IN_ANCESTORS;
                }

                if (!!Object.keys(errors).length) {
                    throw new ValidationError(errors, Object.values(errors).join(', '));
                }
            }

            await _clearAllTreeCaches(treeId, ctx);

            const movedElement = await treeRepo.moveElement({treeId, nodeId, parentTo, order, ctx});

            await _sendTreeEvent(
                {
                    type: TreeEventTypes.MOVE,
                    treeId,
                    record: nodeRecord,
                    element: movedElement,
                    parentNode: parentTo ?? null,
                    parentNodeBefore: parentBefore?.id ?? null,
                    order
                },
                ctx
            );

            return movedElement;
        },
        async deleteElement({treeId, nodeId, deleteChildren = true, ctx}): Promise<ITreeNodeLight> {
            const errors: any = {};

            if (!(await _isExistingTree(treeId, ctx))) {
                errors.treeId = Errors.UNKNOWN_TREE;
            }

            if (!(await treeRepo.isNodePresent({treeId, nodeId, ctx}))) {
                errors.element = Errors.UNKNOWN_ELEMENT;
            }

            if (!!Object.keys(errors).length) {
                throw new ValidationError(errors, Object.values(errors).join(', '));
            }

            const canDetach = await treeNodePermissionDomain.getTreeNodePermission({
                treeId,
                action: TreeNodePermissionsActions.DETACH,
                nodeId,
                userId: ctx.userId,
                ctx
            });

            if (!canDetach) {
                throw new PermissionError(TreeNodePermissionsActions.DETACH);
            }

            await _clearAllTreeCaches(treeId, ctx);

            const parents = await this.getElementAncestors({treeId, nodeId, ctx});
            const parentBefore = parents.length > 1 ? [...parents].splice(-2, 1)[0] : null;
            const nodeRecord = await treeRepo.getRecordByNodeId({treeId, nodeId, ctx});
            const deletedElement = await treeRepo.deleteElement({treeId, nodeId, deleteChildren, ctx});

            await _sendTreeEvent(
                {
                    type: TreeEventTypes.REMOVE,
                    treeId,
                    record: nodeRecord,
                    element: deletedElement,
                    parentNode: null,
                    parentNodeBefore: parentBefore?.id ?? null,
                    order: null
                },
                ctx
            );

            return deletedElement;
        },
        async getTreeContent({treeId, startingNode = null, depth, childrenCount, ctx}): Promise<ITreeNode[]> {
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
                throw new ValidationError(errors, Object.values(errors).join(', '));
            }

            return treeRepo.getTreeContent({treeId, startingNode, depth, childrenCount, ctx});
        },
        async getElementChildren({
            treeId,
            nodeId,
            childrenCount,
            withTotalCount,
            pagination,
            ctx
        }): Promise<IList<ITreeNode>> {
            if (!(await _isExistingTree(treeId, ctx))) {
                throw new ValidationError({treeId: Errors.UNKNOWN_TREE});
            }

            if (nodeId && !(await this.isNodePresent({treeId, nodeId, ctx}))) {
                throw new ValidationError({node: Errors.UNKNOWN_NODE});
            }

            return treeRepo.getElementChildren({treeId, nodeId, childrenCount, withTotalCount, pagination, ctx});
        },
        async getElementAncestors({treeId, nodeId, ctx}): Promise<TreePaths> {
            return elementAncestorsHelper.getCachedElementAncestors({treeId, nodeId, ctx});
        },
        async getLinkedRecords({treeId, attribute, nodeId, ctx}): Promise<IRecord[]> {
            const attrs = await attributeDomain.getAttributes({params: {filters: {id: attribute}}, ctx});

            if (!attrs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_ATTRIBUTE});
            }

            return treeRepo.getLinkedRecords({treeId, attribute, nodeId, ctx});
        },
        async isNodePresent({treeId, nodeId, ctx}): Promise<boolean> {
            return treeRepo.isNodePresent({treeId, nodeId, ctx});
        },
        async isRecordPresent({treeId, record, ctx}): Promise<boolean> {
            return treeRepo.isRecordPresent({treeId, record, ctx});
        },
        getLibraryTreeId(library, ctx) {
            return utils.getLibraryTreeId(library);
        },
        async getRecordByNodeId({treeId, nodeId, ctx}): Promise<IRecord> {
            if (!treeId) {
                throw new ValidationError({treeId: Errors.UNKNOWN_TREE});
            }

            if (!nodeId) {
                throw new ValidationError({nodeId: Errors.UNKNOWN_NODE});
            }

            return treeRepo.getRecordByNodeId({treeId, nodeId, ctx});
        },
        async getNodesByRecord({treeId, record, ctx}): Promise<string[]> {
            return treeRepo.getNodesByRecord({treeId, record, ctx});
        },
        async getDefaultElement({treeId, ctx}) {
            return getDefaultElementHelper.getDefaultElement({treeId, ctx});
        }
    };
}
