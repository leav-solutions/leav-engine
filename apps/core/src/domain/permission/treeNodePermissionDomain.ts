// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeElement} from '_types/tree';
import {
    ITreeNodePermissionsConf,
    PermissionTypes,
    TreeNodePermissionsActions,
    TreePermissionsActions
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {ITreeLibraryPermissionDomain} from './treeLibraryPermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';
import {IGetDefaultPermissionParams, IGetHeritedTreeNodePermissionParams, IGetTreeNodePermissionParams} from './_types';

export interface ITreeNodePermissionDomain {
    getTreeNodePermission(params: IGetTreeNodePermissionParams): Promise<boolean>;
    getHeritedTreeNodePermission(params: IGetHeritedTreeNodePermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.tree'?: ITreePermissionDomain;
    'core.domain.permission.treeLibrary'?: ITreeLibraryPermissionDomain;
    'core.domain.permission.helpers.treeBasedPermissions'?: ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.value'?: IValueRepo;
}

export default function (deps: IDeps = {}): ITreeNodePermissionDomain {
    const {
        'core.domain.permission.tree': treePermissionDomain = null,
        'core.domain.permission.treeLibrary': treeLibraryPermissionDomain = null,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper = null,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.domain.tree': treeDomain = null,
        'core.domain.attribute': attributeDomain = null,
        'core.infra.value': valueRepo = null
    } = deps;

    const _getPermByTreeNode = async (params: {
        action: TreeNodePermissionsActions;
        userId: string;
        treeId: string;
        permConf: ITreeNodePermissionsConf;
        treeElement: ITreeElement;
        ctx: IQueryInfos;
    }) => {
        const {action, userId, treeId, permConf, treeElement, ctx} = params;
        const {id: recordId, library} = treeElement;

        if (!permConf[library]) {
            return treeLibraryPermissionDomain.getTreeLibraryPermission({
                action,
                treeId,
                libraryId: library,
                userId,
                ctx,
                getDefaultPermission: () => null
            });
        }

        // Get tree attributes values
        const treesAttrValues = await Promise.all(
            permConf[library].permissionTreeAttributes.map(async permTreeAttr => {
                const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                return valueRepo.getValues({
                    library,
                    recordId,
                    attribute: permTreeAttrProps,
                    ctx
                });
            })
        );

        const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
            allVal[permConf[library].permissionTreeAttributes[i]] = treeVal.map(v => v.value);

            return allVal;
        }, {});

        // Get permission
        const nodePerm = await treeBasedPermissionsHelper.getTreeBasedPermission(
            {
                type: PermissionTypes.TREE_NODE,
                action,
                userId,
                applyTo: `${treeId}/${library}`,
                treeValues: valuesByAttr,
                permissions_conf: permConf[library],
                getDefaultPermission: () => null
            },
            ctx
        );

        if (nodePerm !== null) {
            return nodePerm;
        }

        // Element has no permission defined, look for tree library permission
        return treeLibraryPermissionDomain.getTreeLibraryPermission({
            action,
            treeId,
            libraryId: library,
            userId,
            ctx,
            getDefaultPermission: () => null
        });
    };

    return {
        async getTreeNodePermission({action, userId, node, treeId, ctx}): Promise<boolean> {
            // Retrieve permissions conf for this node library
            const treeData = await treeDomain.getTreeProperties(treeId, ctx);

            // Tree has no permissions conf defined, check global tree permission
            if (!treeData.permissions_conf) {
                return treePermissionDomain.getTreePermission({
                    action: (action as unknown) as TreePermissionsActions,
                    userId,
                    treeId,
                    ctx
                });
            }

            // Retrieve permissions for this element, based on tree permissions conf
            const elemPerm = await _getPermByTreeNode({
                action: (action as unknown) as TreeNodePermissionsActions,
                userId,
                treeId,
                permConf: treeData.permissions_conf,
                treeElement: node,
                ctx
            });

            if (elemPerm !== null) {
                return elemPerm;
            }

            // Element has no permission defined. We check on its ancestors and return the first we find.
            // If we find nothing, we'll return global tree permission.
            const ancestors = await treeDomain.getElementAncestors({
                treeId,
                element: node,
                ctx
            });

            for (const parent of ancestors) {
                const parentNode: ITreeElement = {
                    id: parent.record.id,
                    library: parent.record.library
                };

                const parentPerm = await _getPermByTreeNode({
                    action,
                    userId,
                    treeId,
                    permConf: treeData.permissions_conf,
                    treeElement: parentNode,
                    ctx
                });

                if (parentPerm !== null) {
                    return parentPerm;
                }
            }

            // Nothing found on all ancestors
            return treePermissionDomain.getTreePermission({
                action: (action as unknown) as TreePermissionsActions,
                userId,
                treeId,
                ctx
            });
        },
        async getHeritedTreeNodePermission({
            action,
            userGroupId,
            treeId,
            libraryId,
            permTree,
            permTreeNode,
            ctx
        }): Promise<boolean> {
            const _getDefaultPermission = async (params: IGetDefaultPermissionParams) => {
                const {userGroups} = params;

                // Check tree library permission
                const treeLibPerm = await permByUserGroupHelper.getPermissionByUserGroups({
                    type: PermissionTypes.TREE_LIBRARY,
                    action,
                    userGroupsPaths: userGroups,
                    applyTo: `${treeId}/${libraryId}`,
                    ctx
                });

                if (treeLibPerm !== null) {
                    return treeLibPerm;
                }

                const treePerm = await permByUserGroupHelper.getPermissionByUserGroups({
                    type: PermissionTypes.TREE,
                    action,
                    userGroupsPaths: userGroups,
                    applyTo: treeId,
                    ctx
                });

                return treePerm !== null ? treePerm : defaultPermHelper.getDefaultPermission();
            };

            return treeBasedPermissionsHelper.getHeritedTreeBasedPermission(
                {
                    type: PermissionTypes.TREE_NODE,
                    applyTo: `${treeId}/${libraryId}`,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, ...permTreeNode},
                    getDefaultPermission: _getDefaultPermission
                },
                ctx
            );
        }
    };
}
