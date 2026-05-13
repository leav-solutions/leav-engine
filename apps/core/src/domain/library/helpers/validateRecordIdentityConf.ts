import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type ILibrary} from '../../../_types/library';
import {type ErrorFieldDetail, Errors} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';

export default async (
    libData: ILibrary,
    libAttributes: string[],
    deps: {attributeDomain: IAttributeDomain},
    ctx: IQueryInfos,
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
