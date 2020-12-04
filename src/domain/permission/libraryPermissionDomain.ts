// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import {IGetHeritedLibraryPermissionParams, IGetLibraryPermissionParams} from './_types';

export interface ILibraryPermissionDomain {
    getLibraryPermission(params: IGetLibraryPermissionParams): Promise<boolean>;
    getHeritedLibraryPermission({action, userGroupId, ctx}: IGetHeritedLibraryPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.helpers.globalPermission'?: IGlobalPermissionHelper;
}

export default function({
    'core.domain.permission.helpers.globalPermission': globalPermHelper = null
}: IDeps = {}): ILibraryPermissionDomain {
    const getLibraryPermission = async ({
        action,
        libraryId,
        userId,
        ctx
    }: IGetLibraryPermissionParams): Promise<boolean> => {
        return globalPermHelper.getGlobalPermission(
            {
                type: PermissionTypes.LIBRARY,
                action,
                applyTo: libraryId,
                userId
            },
            ctx
        );
    };

    const getHeritedLibraryPermission = async ({
        action,
        libraryId,
        userGroupId,
        ctx
    }: IGetHeritedLibraryPermissionParams): Promise<boolean> => {
        return globalPermHelper.getInheritedGlobalPermission(
            {
                type: PermissionTypes.LIBRARY,
                action,
                applyTo: libraryId,
                userGroupId
            },
            ctx
        );
    };

    return {
        getLibraryPermission,
        getHeritedLibraryPermission
    };
}
