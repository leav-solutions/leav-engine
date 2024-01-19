import pick from 'lodash/pick';
import {ISelectedAttribute} from '_ui/types/attributes';
import {AttributesByLibAttributeFragment} from '_ui/_gqlTypes';

export const attributeToSelectedAttribute = (
    attribute: AttributesByLibAttributeFragment,
    otherProps: Pick<ISelectedAttribute, 'path' | 'library' | 'parentAttributeData' | 'embeddedFieldData'>
): ISelectedAttribute => ({
    ...pick(attribute, ['id', 'label', 'format', 'type', 'multiple_values']),
    ...otherProps
});
