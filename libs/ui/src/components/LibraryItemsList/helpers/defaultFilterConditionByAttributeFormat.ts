// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
