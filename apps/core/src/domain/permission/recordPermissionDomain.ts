// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {ILibrary} from '_types/library';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {LibraryPermissionsActions, PermissionTypes} from '../../_types/permissions';
import {IAttributeDomain} from '../attribute/attributeDomain';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {ILibraryPermissionDomain} from './libraryPermissionDomain';
import {
    IGetDefaultPermissionParams,
    IGetInheritedRecordPermissionParams,
    IGetRecordPermissionParams,
    IGetTreeBasedPermissionParams
} from './_types';

export interface IRecordPermissionDomain {
    getRecordPermission(params: IGetRecordPermissionParams): Promise<boolean>;
    getInheritedRecordPermission(params: IGetInheritedRecordPermissionParams): Promise<boolean>;
}

interface IDeps {
    'core.domain.permission.library'?: ILibraryPermissionDomain;
    'core.domain.permission.helpers.treeBasedPermissions'?: ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups'?: IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission'?: IDefaultPermissionHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.helpers.getCoreEntityById'?: GetCoreEntityByIdFunc;
    'core.infra.value'?: IValueRepo;
}

export default function (deps: IDeps = {}): IRecordPermissionDomain {
    const {
        'core.domain.permission.library': libraryPermissionDomain = null,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper = null,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupHelper = null,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper = null,
        'core.domain.attribute': attributeDomain = null,
        'core.domain.helpers.getCoreEntityById': getCoreEntityById = null,
        'core.infra.value': valueRepo = null
    } = deps;

    return {
        async getRecordPermission({action, userId, library, recordId, ctx}): Promise<boolean> {
            const libProps = await getCoreEntityById<ILibrary>('library', library, ctx);

            if (!libProps) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            if (typeof libProps.permissions_conf === 'undefined') {
                // Check if action is present in library permissions
                const isLibAction =
                    Object.values(LibraryPermissionsActions).indexOf(
                        (action as unknown) as LibraryPermissionsActions
                    ) !== -1;

                return isLibAction
                    ? libraryPermissionDomain.getLibraryPermission({
                          action: (action as unknown) as LibraryPermissionsActions,
                          libraryId: library,
                          userId,
                          ctx
                      })
                    : defaultPermHelper.getDefaultPermission();
            }

            const treesAttrValues = await Promise.all(
                libProps.permissions_conf.permissionTreeAttributes.map(async permTreeAttr => {
                    const permTreeAttrProps = await attributeDomain.getAttributeProperties({id: permTreeAttr, ctx});
                    return valueRepo.getValues({
                        library,
                        recordId,
                        attribute: permTreeAttrProps as IAttributeWithRevLink,
                        ctx
                    });
                })
            );

            const valuesByAttr: IGetTreeBasedPermissionParams['treeValues'] = treesAttrValues.reduce(
                (allVal, treeVal, i) => {
                    allVal[libProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.value.id);

                    return allVal;
                },
                {}
            );

            const perm = await treeBasedPermissionsHelper.getTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    action,
                    userId,
                    applyTo: library,
                    treeValues: valuesByAttr,
                    permissions_conf: libProps.permissions_conf,
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
        async getInheritedRecordPermission({
            action,
            userGroupId,
            library: recordLibrary,
            permTree,
            permTreeNode,
            ctx
        }): Promise<boolean> {
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

            return treeBasedPermissionsHelper.getInheritedTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    applyTo: recordLibrary,
                    action,
                    userGroupId,
                    permissionTreeTarget: {tree: permTree, nodeId: permTreeNode},
                    getDefaultPermission: _getDefaultPermission
                },
                ctx
            );
        }
    };
}
