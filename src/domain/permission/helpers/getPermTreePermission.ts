import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {PermissionsActions, PermissionTypes} from '_types/permissions';
import {IQueryInfos} from '_types/queryInfos';
import {ITreeNode} from '_types/tree';
import getPermissionByUserGroups from './getPermissionByUserGroups';

interface IDeps {
    'core.infra.tree'?: ITreeRepo;
    'core.infra.permission'?: IPermissionRepo;
}

/**
 * Return permission for given permission tree attribute.
 * Get record's value on this tree attribute, then run through its ancestors to look for any permission defined
 *
 * @param action
 * @param recordLibrary
 * @param recordId
 * @param permTreeAttr
 * @param userGroupsPaths
 */
export default async (
    params: {
        type: PermissionTypes;
        action: PermissionsActions;
        applyTo: string;
        userGroupsPaths: ITreeNode[][];
        permTreeId: string;
        permTreeVal: ITreeNode[];
        ctx: IQueryInfos;
    },
    deps: IDeps = {}
): Promise<boolean> => {
    const {type, action, applyTo, userGroupsPaths, permTreeId, permTreeVal, ctx} = params;
    const {'core.infra.tree': treeRepo = null} = deps;

    if (permTreeVal.length) {
        const permTreePath = await treeRepo.getElementAncestors({
            treeId: permTreeId,
            element: {
                id: permTreeVal[0].record.id,
                library: permTreeVal[0].record.library
            },
            ctx
        });

        for (const treeElem of permTreePath.slice().reverse()) {
            const perm = await getPermissionByUserGroups(
                {
                    type,
                    action,
                    userGroupsPaths,
                    applyTo,
                    permissionTreeTarget: {
                        id: treeElem.record.id,
                        library: treeElem.record.library,
                        tree: permTreeId
                    },
                    ctx
                },
                deps
            );

            if (perm !== null) {
                return perm;
            }
        }
    }

    // Nothing found on tree or no value defined, return root level permission
    const rootPerm = await getPermissionByUserGroups(
        {
            type,
            action,
            userGroupsPaths,
            applyTo,
            permissionTreeTarget: {
                id: null,
                library: null,
                tree: permTreeId
            },
            ctx
        },
        deps
    );

    return rootPerm;
};
