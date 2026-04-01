// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GetAutomationDataQuery, type AvailableLanguage} from '../../../../_gqlTypes';
import {type AutomationData} from './useGetAutomationData';
import {localizedLabel} from '../../../../utils';

export const mapAutomationData = (
    data: GetAutomationDataQuery['automationRules'],
    lang: AvailableLanguage[],
): AutomationData[] =>
    data?.list?.map(automation => ({
        id: automation.id,
        name: localizedLabel(automation.label, lang),
        trigger: 'TODO',
        target: 'TODO',
        nb_actions: 0,
        status: 'TODO',
    }));
