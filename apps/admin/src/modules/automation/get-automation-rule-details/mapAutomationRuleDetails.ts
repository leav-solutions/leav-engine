// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type GetAutomationRuleDetailsQuery} from '../../../_gqlTypes';
import {type AutomationFormValues} from '../types';
import {removeGraphqlTypename} from '../../utils/removeGraphqlTypename';

const omitNullValues = <T extends object>(obj: T): Partial<T> =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>;

export const mapAutomationRuleDetails = (
    data: GetAutomationRuleDetailsQuery['automationRules'],
): AutomationFormValues | undefined => {
    const rule = data?.list?.[0];

    if (!rule) {
        return undefined;
    }

    const {eventTopic, ...triggerRest} = removeGraphqlTypename(rule.trigger);
    const cleanedEventTopic = eventTopic ? omitNullValues(removeGraphqlTypename(eventTopic)) : undefined;

    return {
        label: rule.label,
        description: rule.description ?? '',
        active: rule.active,
        trigger: {...triggerRest, ...(cleanedEventTopic !== undefined ? {eventTopic: cleanedEventTopic} : {})},
        pipeline: rule.pipeline
            ? {
                  steps: rule.pipeline.steps.map(step => ({
                      type: step.type,
                      ...(step.name ? {name: step.name} : {}), // As name is optional, we need to check if it is defined
                      params: step.params,
                  })),
              }
            : undefined,
    };
};
