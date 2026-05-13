import {PermissionTypes} from '../../_types/permissions';
import {type IGlobalPermissionHelper} from './helpers/globalPermission';
import {type IGetApplicationPermissionParams, type IGetInheritedApplicationPermissionParams} from './_types';

export interface IApplicationPermissionDomain {
    getApplicationPermission(params: IGetApplicationPermissionParams): Promise<boolean>;
    getInheritedApplicationPermission(params: IGetInheritedApplicationPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper,
}: IDeps): IApplicationPermissionDomain {
    const getApplicationPermission = async ({
        action,
        applicationId,
        ctx,
    }: IGetApplicationPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.APPLICATION,
                action,
                applyTo: applicationId,
            },
            ctx,
        );

    const getInheritedApplicationPermission = async ({
        action,
        applicationId,
        userGroupId,
        ctx,
    }: IGetInheritedApplicationPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.APPLICATION,
                action,
                applyTo: applicationId,
                userGroupNodeId: userGroupId,
            },
            ctx,
        );

    return {
        getApplicationPermission,
        getInheritedApplicationPermission,
    };
}
