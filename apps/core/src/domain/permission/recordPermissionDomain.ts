// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {
    LibraryPermissionsActions,
    PermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {ILibraryPermissionDomain} from './libraryPermissionDomain';
import {IGetDefaultPermissionParams} from './_types';

export interface IRecordPermissionDomain {
    getRecordPermission(
        action: string,
        userId: string,
        recordLibrary: string,
        recordId: string,
        ctx: IQueryInfos
    ): Promise<boolean>;
    getHeritedRecordPermission(
        action: PermissionsActions,
        userGroupId: string,
        recordLibrary: string,
        permTree: string,
        permTreeNode: {id: string; library: string},
        ctx: IQueryInfos
    ): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.library'?: ILibraryPermissionDomain;
    'core.infra.library'?: ILibraryRepo;
    'core.domain.permission.helpers.treeBasedPermissions'?: ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.infra.value'?: IValueRepo;
}

export default function(deps: IDeps = {}): IRecordPermissionDomain {
    const {
        'core.domain.permission.library': libraryPermissionDomain = null,
        'core.infra.library': libraryRepo = null,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper = null,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.domain.attribute': attributeDomain = null,
        'core.infra.value': valueRepo = null
    } = deps;

    return {
        async getRecordPermission(
            action: RecordPermissionsActions,
            userId: string,
            recordLibrary: string,
            recordId: string,
            ctx: IQueryInfos
        ): Promise<boolean> {
            const libs = await libraryRepo.getLibraries({
                params: {filters: {id: recordLibrary}, strictFilters: true},
                ctx
            });

            if (!libs.list.length) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            const lib = libs.list[0];

            if (typeof lib.permissions_conf === 'undefined') {
                // Check if action is present in library permissions
                const isLibAction =
                    Object.values(LibraryPermissionsActions).indexOf(
                        (action as unknown) as LibraryPermissionsActions
                    ) !== -1;

                return isLibAction
                    ? libraryPermissionDomain.getLibraryPermission({
                          action: (action as unknown) as LibraryPermissionsActions,
                          libraryId: recordLibrary,
                          userId,
                          ctx
                      })
                    : defaultPermHelper.getDefaultPermission();
            }

            const treesAttrValues = await Promise.all(
                lib.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library: recordLibrary,
                        recordId,
                        attribute: permTreeAttrProps,
                        ctx
                    });
                })
            );

            const valuesByAttr = treesAttrValues.reduce((allVal, treeVal, i) => {
                allVal[lib.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.value);

                return allVal;
            }, {});

            const perm = await treeBasedPermissionsHelper.getTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    action,
                    userId,
                    applyTo: recordLibrary,
                    treeValues: valuesByAttr,
                    permissions_conf: lib.permissions_conf,
                    getDefaultPermission: params =>
                        libraryPermissionDomain.getLibraryPermission({
                            action: params.action,
                            libraryId: params.applyTo,
                            userId: params.userId,
                            ctx
                        })
                },
                ctx
            );

            return perm;
        },
        async getHeritedRecordPermission(
            action: PermissionsActions,
            userGroupId: string,
            recordLibrary: string,
            permTree: string,
            permTreeNode: {id: string; library: string},
            ctx: IQueryInfos
        ): Promise<boolean> {
            const _getDefaultPermission = async (params: IGetDefaultPermissionParams) => {
                const {applyTo, userGroups} = params;

                const libPerm = await permByUserGroupHelper.getPermissionByUserGroups({
                    type: PermissionTypes.LIBRARY,
                    action,
                    userGroupsPaths: userGroups,
                    applyTo,
                    ctx
                });

                return libPerm !== null ? libPerm : defaultPermHelper.getDefaultPermission();
            };

            return treeBasedPermissionsHelper.getHeritedTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    applyTo: recordLibrary,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, ...permTreeNode},
                    getDefaultPermission: _getDefaultPermission
                },
                ctx
            );
        }
    };
}
