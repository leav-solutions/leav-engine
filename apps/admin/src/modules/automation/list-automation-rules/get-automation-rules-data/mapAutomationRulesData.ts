import {type GetAutomationRulesDataQuery} from '../../../../_gqlTypes';
import {type AutomationRulesData} from './useGetAutomationRulesData';
import {removeGraphqlTypename} from '../../../utils/removeGraphqlTypename';

const TARGET_SEPARATOR = ' | ';

const _getTarget = (
    eventTopic: GetAutomationRulesDataQuery['automationRules']['list'][number]['trigger']['eventTopic'],
): string =>
    Object.values(removeGraphqlTypename(eventTopic ?? {}))
        .filter(Boolean)
        .join(TARGET_SEPARATOR);

export const mapAutomationRulesData = (data: GetAutomationRulesDataQuery['automationRules']): AutomationRulesData[] =>
    data?.list?.map(automation => ({
        id: automation.id,
        name: automation.label,
        trigger: automation.trigger.eventAction,
        target: _getTarget(automation.trigger.eventTopic),
        nb_actions: automation.pipeline?.steps.length ?? 0,
        active: automation.active,
    }));
