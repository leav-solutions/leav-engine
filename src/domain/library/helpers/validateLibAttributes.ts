import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {difference} from 'lodash';
import {ILibrary} from '_types/library';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';

export default async (
    attributes: string[],
    deps: {attributeDomain: IAttributeDomain}
): Promise<ErrorFieldDetail<ILibrary>> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (!attributes.length) {
        return {};
    }

    const availableAttributes = await deps.attributeDomain.getAttributes();
    const unknownAttrs = difference(
        attributes,
        availableAttributes.list.map(attr => attr.id)
    );

    if (unknownAttrs.length) {
        errors.attributes = {msg: Errors.UNKNOWN_ATTRIBUTES, vars: {attributes: unknownAttrs.join(', ')}};
    }

    return errors;
};
