import {PermissionTypes} from '../../_types/permissions';
import {type IGlobalPermissionHelper} from './helpers/globalPermission';
import {type IGetInheritedTreeLibraryPermissionParams, type IGetTreeLibraryPermissionParams} from './_types';

export interface ITreeLibraryPermissionDomain {
    getTreeLibraryPermission(params: IGetTreeLibraryPermissionParams): Promise<boolean>;
    getInheritedTreeLibraryPermission(params: IGetInheritedTreeLibraryPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper,
}: IDeps): ITreeLibraryPermissionDomain {
    const getTreeLibraryPermission = async ({
        action,
        treeId,
        libraryId,
        getDefaultTreeLibraryPermission,
        ctx,
    }: IGetTreeLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.TREE_LIBRARY,
                action,
                applyTo: `${treeId}/${libraryId}`,
                getDefaultGlobalPermission: getDefaultTreeLibraryPermission,
            },
            ctx,
        );

    const getInheritedTreeLibraryPermission = async ({
        action,
        treeId,
        libraryId,
        userGroupId,
        ctx,
    }: IGetInheritedTreeLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.TREE_LIBRARY,
                action,
                applyTo: `${treeId}/${libraryId}`,
                userGroupNodeId: userGroupId,
            },
            ctx,
        );

    return {
        getTreeLibraryPermission,
        getInheritedTreeLibraryPermission,
    };
}
