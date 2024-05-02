// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetInheritedLibraryPermissionParams, IGetLibraryPermissionParams} from './_types';

export interface ILibraryPermissionDomain {
    getLibraryPermission(params: IGetLibraryPermissionParams): Promise<boolean>;
    getInheritedLibraryPermission({action, userGroupId, ctx}: IGetInheritedLibraryPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission'?: IGlobalPermissionHelper;
}

export default function ({
    'core.domain.permission.helpers.globalPermission': globalPermHelper = null
}: IDeps = {}): ILibraryPermissionDomain {
    const getLibraryPermission = async ({
        action,
        libraryId,
        userId,
        ctx
    }: IGetLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.LIBRARY,
                action,
                applyTo: libraryId,
                userId
            },
            ctx
        );

    const getInheritedLibraryPermission = async ({
        action,
        libraryId,
        userGroupId,
        ctx
    }: IGetInheritedLibraryPermissionParams): Promise<boolean> =>
        globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.LIBRARY,
                action,
                applyTo: libraryId,
                userGroupNodeId: userGroupId
            },
            ctx
        );

    return {
        getLibraryPermission,
        getInheritedLibraryPermission
    };
}
