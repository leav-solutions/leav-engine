// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibrary} from '_types/library';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {IQueryInfos} from '_types/queryInfos';

export default async (
    libData: ILibrary,
    libAttributes: string[],
    deps: {attributeDomain: IAttributeDomain},
    ctx: IQueryInfos
): Promise<ErrorFieldDetail<ILibrary>> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (!libData.recordIdentityConf) {
        return {};
    }

    const allowedAttributes = libAttributes.length
        ? libAttributes
        : (await deps.attributeDomain.getLibraryAttributes(libData.id, ctx)).map(a => a.id);

    const unbindedAttrs = [];
    for (const identitiyField of Object.keys(libData.recordIdentityConf)) {
        const attrId = libData.recordIdentityConf[identitiyField];
        if (!attrId) {
            libData.recordIdentityConf[identitiyField] = null;
            continue;
        }

        if (allowedAttributes.indexOf(attrId) === -1) {
            unbindedAttrs.push(attrId);
        }
    }

    if (unbindedAttrs.length) {
        errors.recordIdentityConf = {msg: Errors.UNBINDED_ATTRIBUTES, vars: {attributes: unbindedAttrs.join(', ')}};
    }

    return errors;
};
