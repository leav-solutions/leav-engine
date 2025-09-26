// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GetCoreEntityByIdFunc} from 'domain/helpers/getCoreEntityById';
import {type IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
import {type IValueRepo} from 'infra/value/valueRepo';
import {type ILibrary} from '_types/library';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {LibraryPermissionsActions, PermissionsRelations, PermissionTypes} from '../../_types/permissions';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IDefaultPermissionHelper} from './helpers/defaultPermission';
import {type IPermissionByUserGroupsHelper} from './helpers/permissionByUserGroups';
import {type ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {type ILibraryPermissionDomain} from './libraryPermissionDomain';
import {
    type IEstimateTreeValueRecordPermissionParams,
    type IGetDefaultPermissionParams,
    type IGetInheritedRecordPermissionParams,
    type IGetRecordPermissionParams,
    type IGetTreeBasedPermissionParams
} from './_types';
import {type ITreeRepo} from '../../infra/tree/treeRepo';
import {type IRecordRepo} from '../../infra/record/recordRepo';
import {type IRecordInCreationByPassHelper} from './helpers/recordInCreationBypass';

export interface IRecordPermissionDomain {
    getRecordPermission(params: IGetRecordPermissionParams): Promise<boolean>;
    getInheritedRecordPermission(params: IGetInheritedRecordPermissionParams): Promise<boolean>;
    evaluateTreeValueRecordPermission(params: IEstimateTreeValueRecordPermissionParams): Promise<boolean>;
}

export interface IRecordPermissionDomainDeps {
    'core.domain.permission.library': ILibraryPermissionDomain;
    'core.domain.permission.helpers.treeBasedPermissions': ITreeBasedPermissionHelper;
    'core.domain.permission.helpers.permissionByUserGroups': IPermissionByUserGroupsHelper;
    'core.domain.permission.helpers.defaultPermission': IDefaultPermissionHelper;
    'core.domain.permission.helpers.recordInCreationByPass': IRecordInCreationByPassHelper;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.helpers.getCoreEntityById': GetCoreEntityByIdFunc;
    'core.infra.value': IValueRepo;
    'core.infra.tree': ITreeRepo;
    'core.infra.record': IRecordRepo;
}

export default function (deps: IRecordPermissionDomainDeps): IRecordPermissionDomain {
    const {
        'core.domain.permission.library': libraryPermissionDomain,
        'core.domain.permission.helpers.treeBasedPermissions': treeBasedPermissionsHelper,
        'core.domain.permission.helpers.permissionByUserGroups': permByUserGroupHelper,
        'core.domain.permission.helpers.defaultPermission': defaultPermHelper,
        'core.domain.permission.helpers.recordInCreationByPass': recordInCreationByPassHelper,
        'core.domain.attribute': attributeDomain,
        'core.domain.helpers.getCoreEntityById': getCoreEntityById,
        'core.infra.value': valueRepo,
        'core.infra.tree': treeRepo,
        'core.infra.record': recordRepo
    } = deps;

    return {
        async evaluateTreeValueRecordPermission({
            action,
            userId,
            libraryId,
            attributeId,
            nodeId,
            ctx
        }): Promise<boolean> {
            const attribute = (await attributeDomain.getLibraryAttributes(libraryId, ctx)).find(
                a => a.id === attributeId
            );

            if (!attribute) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.INVALID_ATTRIBUTE_FOR_LIBRARY,
                        vars: {attribute: attributeId, library: libraryId}
                    }
                });
            }

            if (!(await treeRepo.isNodePresent({treeId: attribute.linked_tree, nodeId, ctx}))) {
                throw new ValidationError({node: Errors.UNKNOWN_NODE});
            }

            return treeBasedPermissionsHelper.getTreeBasedPermission(
                {
                    type: PermissionTypes.RECORD,
                    action,
                    userId,
                    applyTo: libraryId,
                    treeValues: {
                        [attributeId]: [nodeId]
                    },
                    permissions_conf: {
                        permissionTreeAttributes: [attributeId],
                        relation: PermissionsRelations.AND
                    },
                    getDefaultPermission: () =>
                        libraryPermissionDomain.getLibraryPermission({
                            action: action as unknown as LibraryPermissionsActions,
                            libraryId,
                            userId: ctx.userId,
                            ctx
                        })
                },
                ctx
            );
        },
        async getRecordPermission({action, userId, library, recordId, ctx}): Promise<boolean> {
            const libProps = await getCoreEntityById<ILibrary>('library', library, ctx);

            if (!libProps) {
                throw new ValidationError({id: Errors.UNKNOWN_LIBRARY});
            }

            if (
                typeof libProps.permissions_conf === 'undefined' ||
                !libProps.permissions_conf.permissionTreeAttributes.length
            ) {
                // Check if action is present in library permissions
                const isLibAction =
                    Object.values(LibraryPermissionsActions).indexOf(action as unknown as LibraryPermissionsActions) !==
                    -1;

                return isLibAction
                    ? libraryPermissionDomain.getLibraryPermission({
                          action: action as unknown as LibraryPermissionsActions,
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
                    allVal[libProps.permissions_conf.permissionTreeAttributes[i]] = treeVal.map(v => v.payload.id);

                    return allVal;
                },
                {}
            );

            const treeBasedPermission = await treeBasedPermissionsHelper.getTreeBasedPermission(
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

            // If record is in creation and user is the creator, we allow all actions
            if (treeBasedPermission === false) {
                const record = await recordRepo.getRecord({libraryId: library, recordId, ctx});
                return recordInCreationByPassHelper.recordInCreationByPass(record, ctx);
            }

            return treeBasedPermission;
        },
        async getInheritedRecordPermission({
            action,
            userGroupId,
            library: recordLibrary,
            permTree,
            permTreeNode,
            ctx
        }): Promise<boolean> {
            const _getDefaultPermission = (params: IGetDefaultPermissionParams) =>
                permByUserGroupHelper.getPermissionByUserGroups({
                    type: PermissionTypes.LIBRARY,
                    action,
                    userGroupsPaths: params.userGroups,
                    applyTo: params.applyTo,
                    ctx
                });

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
