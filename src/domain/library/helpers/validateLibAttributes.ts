// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {difference} from 'lodash';
import {ILibrary} from '_types/library';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {IQueryInfos} from '_types/queryInfos';

export default async (
    attributes: string[],
    deps: {attributeDomain: IAttributeDomain},
    ctx: IQueryInfos
): Promise<ErrorFieldDetail<ILibrary>> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (!attributes.length) {
        return {};
    }

    const availableAttributes = await deps.attributeDomain.getAttributes({ctx});
    const unknownAttrs = difference(
        attributes,
        availableAttributes.list.map(attr => attr.id)
    );

    if (unknownAttrs.length) {
        errors.attributes = {msg: Errors.UNKNOWN_ATTRIBUTES, vars: {attributes: unknownAttrs.join(', ')}};
    }

    return errors;
};
