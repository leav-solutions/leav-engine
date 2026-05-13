import {AttributeFormat} from '_ui/_gqlTypes';
import {AttributeConditionFilter} from '_ui/types';

export const hasOnlyNoValueConditions = (attributeFormat: AttributeFormat): boolean =>
    [AttributeFormat.color, AttributeFormat.date_range, AttributeFormat.encrypted, AttributeFormat.extended].includes(
        attributeFormat,
    );

export const nullValueConditions = [
    AttributeConditionFilter.IS_EMPTY,
    AttributeConditionFilter.IS_NOT_EMPTY,
    AttributeConditionFilter.TODAY,
    AttributeConditionFilter.TOMORROW,
    AttributeConditionFilter.YESTERDAY,
    AttributeConditionFilter.LAST_MONTH,
    AttributeConditionFilter.NEXT_MONTH,
];
