// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type ICreateAutomationRule, type IAutomationRule} from '../../_types/automation';
import {SortOrder, type IList} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import PermissionError from '../../errors/PermissionError';
import {type IAutomationRuleRepo} from '../../infra/automation/automationRuleRepo';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {EventAction} from '@leav/utils';

export interface IGetAutomationRulesParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        active?: boolean;
    };
}

export interface IAutomationDomain {
    getAutomationRules({
        params,
        ctx,
    }: {
        params: IGetAutomationRulesParams;
        ctx: IQueryInfos;
    }): Promise<IList<IAutomationRule>>;

    createAutomationRule({rule, ctx}: {rule: ICreateAutomationRule; ctx: IQueryInfos}): Promise<IAutomationRule>;
}

export interface IAutomationDomainDeps {
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.infra.automation.rule': IAutomationRuleRepo;
}

export default function ({
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.infra.automation.rule': automationRuleRepo,
}: IAutomationDomainDeps): IAutomationDomain {
    return {
        async getAutomationRules({params, ctx}) {
            const hasAdminAccessPermission = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.MANAGE_AUTOMATION,
                ctx,
            });
            if (!hasAdminAccessPermission) {
                throw new PermissionError(AdminPermissionsActions.MANAGE_AUTOMATION);
            }

            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return automationRuleRepo.getAutomationRules(initializedParams, ctx);
        },
        async createAutomationRule({rule, ctx}) {
            const hasAdminAccessPermission = await adminPermissionDomain.getAdminPermission({
                action: AdminPermissionsActions.MANAGE_AUTOMATION,
                ctx,
            });
            if (!hasAdminAccessPermission) {
                throw new PermissionError(AdminPermissionsActions.MANAGE_AUTOMATION);
            }

            const newAutomationRule = await automationRuleRepo.createAutomationRule(rule, ctx);

            logger.debug(`Created new automation rule with id ${newAutomationRule.id}`);

            await eventsManagerDomain.sendDatabaseEvent<EventAction.AUTOMATION_RULE_CREATE>(
                {
                    action: EventAction.AUTOMATION_RULE_CREATE,
                    topic: {
                        automationRule: newAutomationRule.id,
                    },
                    after: newAutomationRule,
                },
                ctx,
            );

            return newAutomationRule;
        },
    };
}
