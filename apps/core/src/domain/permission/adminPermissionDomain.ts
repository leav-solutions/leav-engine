import {PermissionTypes} from '../../_types/permissions';
import {type IGlobalPermissionHelper} from './helpers/globalPermission';
import {type IGetAdminPermissionParams, type IGetInheritedAdminPermissionParams} from './_types';

export interface IAdminPermissionDomain {
    getAdminPermission({action, ctx}: IGetAdminPermissionParams): Promise<boolean>;
    getInheritedAdminPermission({action, userGroupId, ctx}: IGetInheritedAdminPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper,
}: IDeps): IAdminPermissionDomain {
    const getAdminPermission = async ({action, ctx}: IGetAdminPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.ADMIN,
                action,
            },
            ctx,
        );

    const getInheritedAdminPermission = async ({
        action,
        userGroupId,
        ctx,
    }: IGetInheritedAdminPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.ADMIN,
                action,
                userGroupNodeId: userGroupId,
            },
            ctx,
        );

    return {
        getAdminPermission,
        getInheritedAdminPermission,
    };
}
