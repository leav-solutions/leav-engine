// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeConditionFilter, AttributeConditionType} from '_types/types';

export default (condition: AttributeConditionType): boolean => {
    const noValueConditions: AttributeConditionType[] = [
        AttributeConditionFilter.IS_EMPTY,
        AttributeConditionFilter.IS_NOT_EMPTY,
        AttributeConditionFilter.TODAY,
        AttributeConditionFilter.TOMORROW,
        AttributeConditionFilter.YESTERDAY,
        AttributeConditionFilter.LAST_MONTH,
        AttributeConditionFilter.NEXT_MONTH
    ];

    return noValueConditions.includes(condition);
};
