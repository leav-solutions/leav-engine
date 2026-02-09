// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IValueRepo} from 'infra/value/valueRepo';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {AdminPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';

export interface IGarbageDomain {
    clearMultipleValues(attributeId: string, ctx: IQueryInfos): Promise<void>; // Delete multiples values of a mono attribute and keep only the more recent one
}

export interface IGarbageDomainDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.infra.value': IValueRepo;
    'core.domain.permission.admin': IAdminPermissionDomain;
}

const valueDomain = function ({
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.attribute': attributeDomain,
    'core.infra.value': valueRepo,
}: IGarbageDomainDeps): IGarbageDomain {
    return {
        clearMultipleValues: async (attributeId: string, ctx: IQueryInfos): Promise<void> => {
            const canSavePermission = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.EDIT_ATTRIBUTE,
                ctx,
            });
            if (!canSavePermission) {
                throw new PermissionError(AdminPermissionsActions.EDIT_ATTRIBUTE);
            }

            const attribute = await attributeDomain.getAttributeProperties({id: attributeId, ctx});

            if (
                attribute.type !== AttributeTypes.ADVANCED &&
                attribute.type !== AttributeTypes.ADVANCED_LINK &&
                attribute.type !== AttributeTypes.TREE
            ) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.UNSUPPORTED_ATTRIBUTE_TYPE,
                        vars: {attributeType: attribute.type},
                    },
                });
            }

            if (attribute.multiple_values) {
                throw new ValidationError({
                    [attributeId]: {
                        msg: Errors.UNSUPPORTED_ATTRIBUTE_MULTI_VALUE,
                        vars: {},
                    },
                });
            }

            const attributeLibraries = await attributeDomain.getAttributeLibraries({attributeId, ctx});

            await Promise.all(
                attributeLibraries.map(async ({id: libraryId}) =>
                    valueRepo.clearMultipleValues({libraryId, attribute, ctx}),
                ),
            );

            return;
        },
    };
};

export default valueDomain;
