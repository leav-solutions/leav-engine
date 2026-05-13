import {PermissionTypes} from '../../_types/permissions';
import {type IGlobalPermissionHelper} from './helpers/globalPermission';
import {type IGetInheritedLibraryPermissionParams, type IGetLibraryPermissionParams} from './_types';

export interface ILibraryPermissionDomain {
    getLibraryPermission(params: IGetLibraryPermissionParams): Promise<boolean>;
    getInheritedLibraryPermission({action, userGroupId, ctx}: IGetInheritedLibraryPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper,
}: IDeps): ILibraryPermissionDomain {
    const getLibraryPermission = async ({action, libraryId, ctx}: IGetLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.LIBRARY,
                action,
                applyTo: libraryId,
            },
            ctx,
        );

    const getInheritedLibraryPermission = async ({
        action,
        libraryId,
        userGroupId,
        ctx,
    }: IGetInheritedLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.LIBRARY,
                action,
                applyTo: libraryId,
                userGroupNodeId: userGroupId,
            },
            ctx,
        );

    return {
        getLibraryPermission,
        getInheritedLibraryPermission,
    };
}
