import {ISelectedAttribute} from '_ui/types/attributes';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';

export const getFieldsKeyFromAttribute = (attribute: ISelectedAttribute) => {
    if (attribute?.format === AttributeFormat.extended && attribute.path) {
        return `${attribute.path}`;
    } else if (attribute.parentAttributeData) {
        return attribute.parentAttributeData.type === AttributeType.tree
            ? `${attribute.parentAttributeData.id}.${attribute.library}.${attribute.id}`
            : `${attribute.parentAttributeData.id}.${attribute.id}`;
    }

    return `${attribute.id}`;
};
