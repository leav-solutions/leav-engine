// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {difference} from 'lodash';
import {ILibrary} from '_types/library';
import {ITreePermissionsConf} from '_types/permissions';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {IQueryInfos} from '_types/queryInfos';

export default async (
    permissionsConf: ITreePermissionsConf,
    deps: {attributeDomain: IAttributeDomain},
    ctx: IQueryInfos
): Promise<ErrorFieldDetail<ILibrary>> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (typeof permissionsConf === 'undefined') {
        return {};
    }

    const availableTreeAttributes = await deps.attributeDomain.getAttributes({ctx});
    const unknownTreeAttributes = difference(
        permissionsConf.permissionTreeAttributes,
        availableTreeAttributes.list.map(treeAttr => treeAttr.id)
    );

    if (unknownTreeAttributes.length) {
        errors.permissions_conf = {
            msg: Errors.UNKNOWN_ATTRIBUTES,
            vars: {attributes: unknownTreeAttributes.join(', ')}
        };
    }

    return errors;
};
