import {
    AdminPermissionsActions,
    IPermissionsTreeTarget,
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IPermissionDomain} from './permissionDomain';
import {IRecordPermissionDomain} from './recordPermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';

export interface IHeritedPermissionDomain {
    /**
     * Retrieve herited permission: ignore permission defined on given element, force retrieval of herited permission
     *
     * @param type
     * @param applyTo
     * @param actions
     * @param userGroupId
     * @param permissionTreeTarget
     */
    getHeritedPermissions(
        type: PermissionTypes,
        applyTo: string,
        action: PermissionsActions,
        userGroupId: number,
        permissionTreeTarget?: IPermissionsTreeTarget
    ): Promise<boolean>;
}

export default function(
    recordPermissionDomain: IRecordPermissionDomain = null,
    permissionDomain: IPermissionDomain = null,
    treePermissionDomain: ITreePermissionDomain = null
): IHeritedPermissionDomain {
    return {
        async getHeritedPermissions(
            type: PermissionTypes,
            applyTo: string,
            action: PermissionsActions,
            userGroupId: number,
            permissionTreeTarget: IPermissionsTreeTarget
        ): Promise<boolean> {
            let perm;
            switch (type) {
                case PermissionTypes.RECORD:
                    perm = await recordPermissionDomain.getHeritedRecordPermission(
                        action as RecordPermissionsActions,
                        userGroupId,
                        applyTo,
                        permissionTreeTarget.tree,
                        {id: permissionTreeTarget.id, library: permissionTreeTarget.library}
                    );
                    break;
                case PermissionTypes.ATTRIBUTE:
                    perm = treePermissionDomain.getHeritedTreePermission({
                        type: PermissionTypes.ATTRIBUTE,
                        applyTo,
                        action,
                        userGroupId,
                        permissionTreeTarget,
                        getDefaultPermission: permissionDomain.getDefaultPermission
                    });
                    break;
                case PermissionTypes.LIBRARY:
                    perm = await permissionDomain.getHeritedLibraryPermission(
                        action as LibraryPermissionsActions,
                        applyTo,
                        userGroupId
                    );
                    break;
                case PermissionTypes.ADMIN:
                    perm = await permissionDomain.getHeritedAdminPermission(
                        action as AdminPermissionsActions,
                        userGroupId
                    );
                    break;
            }

            return perm;
        }
    };
}
