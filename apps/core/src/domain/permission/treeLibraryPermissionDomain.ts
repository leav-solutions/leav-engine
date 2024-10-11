// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetInheritedTreeLibraryPermissionParams, IGetTreeLibraryPermissionParams} from './_types';

export interface ITreeLibraryPermissionDomain {
    getTreeLibraryPermission(params: IGetTreeLibraryPermissionParams): Promise<boolean>;
    getInheritedTreeLibraryPermission(params: IGetInheritedTreeLibraryPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission': IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper
}: IDeps): ITreeLibraryPermissionDomain {
    const getTreeLibraryPermission = async ({
        action,
        treeId,
        libraryId,
        userId,
        getDefaultPermission,
        ctx
    }: IGetTreeLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.TREE_LIBRARY,
                action,
                applyTo: `${treeId}/${libraryId}`,
                userId,
                getDefaultPermission
            },
            ctx
        );

    const getInheritedTreeLibraryPermission = async ({
        action,
        treeId,
        libraryId,
        userGroupId,
        getDefaultPermission,
        ctx
    }: IGetInheritedTreeLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.TREE_LIBRARY,
                action,
                applyTo: `${treeId}/${libraryId}`,
                userGroupNodeId: userGroupId,
                getDefaultPermission
            },
            ctx
        );

    return {
        getTreeLibraryPermission,
        getInheritedTreeLibraryPermission
    };
}
