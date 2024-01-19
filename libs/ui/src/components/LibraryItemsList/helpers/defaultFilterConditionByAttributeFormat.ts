import {AttributeConditionFilter, AttributeConditionType} from '_ui/types/search';
import {AttributeFormat} from '_ui/_gqlTypes';

export const defaultFilterConditionByAttributeFormat = (format: AttributeFormat): AttributeConditionType => {
    switch (format) {
        case AttributeFormat.boolean:
        case AttributeFormat.date:
        case AttributeFormat.numeric:
            return AttributeConditionFilter.EQUAL;
        case AttributeFormat.encrypted:
            return AttributeConditionFilter.IS_EMPTY;
        case AttributeFormat.text:
        case AttributeFormat.date_range:
        case AttributeFormat.extended:
        default:
            return AttributeConditionFilter.CONTAINS;
    }
};
