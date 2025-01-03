// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeConditionFilter} from '_ui/types';

export const nullValueConditions = [
    AttributeConditionFilter.IS_EMPTY,
    AttributeConditionFilter.IS_NOT_EMPTY,
    AttributeConditionFilter.TODAY,
    AttributeConditionFilter.TOMORROW,
    AttributeConditionFilter.YESTERDAY,
    AttributeConditionFilter.LAST_MONTH,
    AttributeConditionFilter.NEXT_MONTH
];
