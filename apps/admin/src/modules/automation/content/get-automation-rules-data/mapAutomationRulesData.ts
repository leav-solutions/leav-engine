// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GetAutomationRulesDataQuery} from '../../../../_gqlTypes';
import {type AutomationRulesData} from './useGetAutomationRulesData';

export const mapAutomationRulesData = (data: GetAutomationRulesDataQuery['automationRules']): AutomationRulesData[] =>
    data?.list?.map(automation => ({
        id: automation.id,
        name: automation.label,
        trigger: 'TODO',
        target: 'TODO',
        nb_actions: 0,
        active: automation.active,
    }));
