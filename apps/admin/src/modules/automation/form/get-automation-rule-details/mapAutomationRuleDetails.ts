// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GetAutomationRuleDetailsQuery} from '../../../../_gqlTypes';
import {type AutomationFormValues} from '../types';

export const mapAutomationRuleDetails = (
    data: GetAutomationRuleDetailsQuery['automationRules'],
): AutomationFormValues | undefined => {
    const rule = data?.list?.[0];

    if (!rule) {
        return undefined;
    }

    return {
        label: rule.label,
        description: rule.description ?? '',
        active: rule.active,
    };
};
