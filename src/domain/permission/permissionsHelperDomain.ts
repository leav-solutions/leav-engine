import {Errors} from '../../_types/errors';
import ValidationError from '../../errors/ValidationError';
import {
    AdminPermissionsActions,
    AttributePermissionsActions,
    IPermissionsTreeTarget,
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IAttributePermissionDomain} from './attributePermissionDomain';
import {IPermissionDomain} from './permissionDomain';
import {IRecordPermissionDomain} from './recordPermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';
import {IQueryInfos} from '_types/queryInfos';

export interface IPermissionTarget {
    attributeId?: string;
    recordId?: number;
}

export interface IPermissionsHelperDomain {
    /**
     * Retrieve herited permission: ignore permission defined on given element, force retrieval of herited permission
     */
    getHeritedPermissions({
        type,
        applyTo,
        action,
        userGroupId,
        permissionTreeTarget,
        ctx
    }: {
        type: PermissionTypes;
        applyTo: string;
        action: PermissionsActions;
        userGroupId: number;
        permissionTreeTarget?: IPermissionsTreeTarget;
        ctx: IQueryInfos;
    }): Promise<boolean>;

    isAllowed({
        type,
        action,
        userId,
        applyTo,
        target,
        ctx
    }: {
        type: PermissionTypes;
        action: PermissionsActions;
        userId: number;
        applyTo?: string;
        target?: IPermissionTarget;
        ctx: IQueryInfos;
    }): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.recordPermission'?: IRecordPermissionDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.domain.permission.treePermission'?: ITreePermissionDomain;
    'core.domain.permission.attributePermission'?: IAttributePermissionDomain;
}

export default function({
    'core.domain.permission.recordPermission': recordPermissionDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.domain.permission.treePermission': treePermissionDomain = null,
    'core.domain.permission.attributePermission': attributePermissionDomain = null
}: IDeps = {}): IPermissionsHelperDomain {
    return {
        async getHeritedPermissions({type, applyTo, action, userGroupId, permissionTreeTarget, ctx}): Promise<boolean> {
            let perm;
            switch (type) {
                case PermissionTypes.RECORD:
                    perm = await recordPermissionDomain.getHeritedRecordPermission(
                        action as RecordPermissionsActions,
                        userGroupId,
                        applyTo,
                        permissionTreeTarget.tree,
                        {id: permissionTreeTarget.id, library: permissionTreeTarget.library},
                        ctx
                    );
                    break;
                case PermissionTypes.ATTRIBUTE:
                    perm = treePermissionDomain.getHeritedTreePermission(
                        {
                            type: PermissionTypes.ATTRIBUTE,
                            applyTo,
                            action,
                            userGroupId,
                            permissionTreeTarget,
                            getDefaultPermission: permissionDomain.getDefaultPermission
                        },
                        ctx
                    );
                    break;
                case PermissionTypes.LIBRARY:
                    action = action as LibraryPermissionsActions;
                    perm = await permissionDomain.getHeritedLibraryPermission({
                        action,
                        libraryId: applyTo,
                        userGroupId,
                        ctx
                    });
                    break;
                case PermissionTypes.ADMIN:
                    action = action as AdminPermissionsActions;
                    perm = await permissionDomain.getHeritedAdminPermission({
                        action,
                        userGroupId,
                        ctx
                    });
                    break;
            }

            return perm;
        },
        async isAllowed({type, action, userId, applyTo, target, ctx}): Promise<boolean> {
            let perm;
            switch (type) {
                case PermissionTypes.RECORD:
                    if (!target || !target.recordId) {
                        throw new ValidationError({target: Errors.MISSING_RECORD_ID});
                    }

                    perm = await recordPermissionDomain.getRecordPermission(
                        action as RecordPermissionsActions,
                        userId,
                        applyTo,
                        target.recordId,
                        ctx
                    );
                    break;
                case PermissionTypes.ATTRIBUTE:
                    const errors = [];
                    if (!target) {
                        throw new ValidationError({target: Errors.MISSING_TARGET});
                    }

                    if (!target.recordId) {
                        errors.push('record ID');
                    }

                    if (!target.attributeId) {
                        errors.push('attribute ID');
                    }

                    if (errors.length) {
                        throw new ValidationError({
                            target: {msg: Errors.MISSING_FIELDS, vars: {fields: errors.join(', ')}}
                        });
                    }

                    perm = attributePermissionDomain.getAttributePermission(
                        action as AttributePermissionsActions,
                        userId,
                        target.attributeId,
                        applyTo,
                        target.recordId,
                        ctx
                    );

                    break;
                case PermissionTypes.LIBRARY:
                    action = action as LibraryPermissionsActions;
                    perm = await permissionDomain.getLibraryPermission({
                        action,
                        libraryId: applyTo,
                        userId,
                        ctx
                    });
                    break;
                case PermissionTypes.ADMIN:
                    action = action as AdminPermissionsActions;
                    perm = await permissionDomain.getAdminPermission({
                        action,
                        userId,
                        ctx
                    });
                    break;
            }

            return perm;
        }
    };
}
