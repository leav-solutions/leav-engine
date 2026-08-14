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

const _formatDate = (date: number): string => new Date(date * 1000).toLocaleString();

export const mapAutomationRulesData = (data: GetAutomationRulesDataQuery['automationRules']): AutomationRulesData[] =>
    data?.list?.map(automation => ({
        id: automation.id,
        name: automation.label,
        version: automation.version ?? '',
        trigger: automation.trigger.eventAction,
        target: _getTarget(automation.trigger.eventTopic),
        nb_actions: automation.pipeline?.steps.length ?? 0,
        active: automation.active,
        modifiedAt: _formatDate(automation.modifiedAt),
        modifiedBy: automation.modifiedBy?.whoAmI.label ?? '',
    }));
