// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {difference} from 'lodash';
import {ILibrary} from '_types/library';
import {IQueryInfos} from '_types/queryInfos';
import getDefaultAttributes from '../../../utils/helpers/getLibraryDefaultAttributes';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';

export default async (
    libraryData: ILibrary,
    attributes: string[],
    deps: {attributeDomain: IAttributeDomain},
    ctx: IQueryInfos
): Promise<ErrorFieldDetail<ILibrary>> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (!attributes.length) {
        return {};
    }

    const availableAttributes = await deps.attributeDomain.getAttributes({ctx});
    const defaultAttributes = getDefaultAttributes(libraryData.behavior, libraryData.id);
    const attributesById = availableAttributes.list.reduce((acc, a) => {
        acc[a.id] = a;
        return acc;
    }, {});

    // Ignore default attributes here. We consider they exist or are created somewhere else
    const unknownAttrs = difference(
        attributes.filter(a => !defaultAttributes.includes(a)),
        Object.keys(attributesById)
    );

    if (unknownAttrs.length) {
        errors.attributes = {msg: Errors.UNKNOWN_ATTRIBUTES, vars: {attributes: unknownAttrs.join(', ')}};
    }

    return errors;
};
