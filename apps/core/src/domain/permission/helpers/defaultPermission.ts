import _ from 'lodash';
import {adminsGroupId, systemUserId} from '../../../_constants/users';
import {type IConfig} from '../../../_types/config';
import {
    AdminPermissionsActions,
    ApplicationPermissionsActions,
    AttributeDependentValuesPermissionsActions,
    AttributePermissionsActions,
    LibraryPermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
    TreeNodePermissionsActions,
    TreePermissionsActions,
    type PermissionsActions,
} from '../../../_types/permissions';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type TreePath} from '../../../_types/tree';

interface IDeps {
    config: IConfig;
}

export interface IGetDefaultPermissionParams {
    type: PermissionTypes;
    action: PermissionsActions;
    userGroups: TreePath[];
    ctx: IQueryInfos;
}
export type GetDefaultPermission = ({ctx, type, action, userGroups}: IGetDefaultPermissionParams) => boolean;

export interface IDefaultPermissionHelper {
    getDefaultPermission: GetDefaultPermission;
    getAdminDefaultPermissionOrNull: GetDefaultPermission;
}

const permissionsByTypeAndActions = {
    [PermissionTypes.RECORD]: Object.values(RecordPermissionsActions),
    [PermissionTypes.RECORD_ATTRIBUTE]: Object.values(RecordAttributePermissionsActions),
    [PermissionTypes.ADMIN]: Object.values(AdminPermissionsActions),
    [PermissionTypes.LIBRARY]: Object.values(LibraryPermissionsActions),
    [PermissionTypes.ATTRIBUTE]: Object.values(AttributePermissionsActions),
    [PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES]: Object.values(AttributeDependentValuesPermissionsActions),
    [PermissionTypes.TREE]: Object.values(TreePermissionsActions),
    [PermissionTypes.TREE_NODE]: Object.values(TreeNodePermissionsActions),
    [PermissionTypes.TREE_LIBRARY]: Object.values(TreeNodePermissionsActions),
    [PermissionTypes.APPLICATION]: Object.values(ApplicationPermissionsActions),
};

export default function ({config}: IDeps): IDefaultPermissionHelper {
    // Build a flat map of permissions for quick lookup
    function buildPermissionsFlatMap(
        permissions: Record<string, any>,
        globalDefault: boolean,
    ): Record<string, boolean> & {default: boolean} {
        const map: Record<string, boolean> & {default: boolean} = {
            default: globalDefault,
        };

        for (const type of Object.keys(permissionsByTypeAndActions)) {
            const typePerms = permissions[type] ?? {};
            for (const action of permissionsByTypeAndActions[type]) {
                const key = `${type}:${action}`;
                map[key] = typePerms[action] ?? typePerms.default ?? globalDefault;
            }
            map[`${type}:default`] = typePerms.default ?? globalDefault;
        }

        return map;
    }

    function isInAdminGroup(userGroups: TreePath[]): boolean {
        return !!userGroups.some(ug => ug.some(g => g.id === adminsGroupId));
    }

    function getPermission(map: Record<string, boolean>, type: string, action: string): boolean {
        return map[`${type}:${action}`] ?? map[`${type}:default`] ?? map.default;
    }

    const adminPermissionsMap = buildPermissionsFlatMap(
        config.permissions.adminGroup,
        config.permissions.adminGroup.default ?? true,
    );
    const everybodyPermissionsMap = buildPermissionsFlatMap(
        config.permissions.everybody,
        config.permissions.everybody.default ?? true,
    );

    return {
        getDefaultPermission({type, action, userGroups, ctx}: IGetDefaultPermissionParams): boolean {
            // system user always has permission
            if (ctx.userId === systemUserId) {
                return true;
            }

            if (isInAdminGroup(userGroups) && type !== PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES) {
                return getPermission(adminPermissionsMap, type, action);
            }

            return getPermission(everybodyPermissionsMap, type, action);
        },
        getAdminDefaultPermissionOrNull({type, action, userGroups}: IGetDefaultPermissionParams): boolean | null {
            if (isInAdminGroup(userGroups) && type !== PermissionTypes.ATTRIBUTE_DEPENDENT_VALUES) {
                return getPermission(adminPermissionsMap, type, action);
            }

            return null;
        },
    };
}
