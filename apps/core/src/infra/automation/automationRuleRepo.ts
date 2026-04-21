// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {aql} from 'arangojs';
import {join, type GeneratedAqlQuery} from 'arangojs/aql';
import {
    type ICreateAutomationRule,
    type IAutomationRule,
    type IUpdateAutomationRule,
    type SyncAutomationRuleEventAction,
} from '../../_types/automation';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type ISystemTranslation} from '../../_types/systemTranslation';
import {type IDbDocument} from '../db/_types';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import dayjs from 'dayjs';
import {type EventAction, type IDbPayload} from '@leav/utils';

export const AUTOMATION_RULES_COLLECTION_NAME = 'core_automation_rules';

type IAutomationRuleBaseDocument = {
    // metadata
    createdAt: number;
    createdBy: string;
    modifiedAt: number;
    modifiedBy: string;

    label: string;
    description?: string;
    active: boolean;
    trigger: {
        synchronous: boolean;
        eventAction: EventAction | SyncAutomationRuleEventAction;
        eventTopic?: IDbPayload['topic'];
    };
};

type IAutomationRuleDbDocument = IAutomationRuleBaseDocument & IDbDocument;

export type IAutomationRuleFilterOptionsInRepo = ICoreEntityFilterOptions & {
    active?: boolean;
    trigger?: {
        synchronous?: boolean;
        eventAction?: EventAction | SyncAutomationRuleEventAction;
        eventTopic?: IDbPayload['topic'];
    };
};

export type IGetAutomationRulesParams = IGetCoreEntitiesParams & {
    filters?: IAutomationRuleFilterOptionsInRepo;
    partialMatchOnEventTopic?: boolean; // if true, only one field of eventTopic has to match the filter
};

export interface IAutomationRuleRepo {
    createAutomationRule(rule: ICreateAutomationRule, ctx: IQueryInfos): Promise<IAutomationRule>;
    updateAutomationRule(rule: IUpdateAutomationRule, ctx: IQueryInfos): Promise<IAutomationRule>;
    getAutomationRules(params: IGetAutomationRulesParams, ctx: IQueryInfos): Promise<IList<IAutomationRule>>;
}

export interface IAutomationRuleRepoDeps {
    'core.infra.db.dbService': IDbService;
    'core.infra.db.dbUtils': IDbUtils;
}

export default function ({
    'core.infra.db.dbService': dbService = null,
    'core.infra.db.dbUtils': dbUtils = null,
}: IAutomationRuleRepoDeps): IAutomationRuleRepo {
    const automationRuleFromDbDocument = (doc: IAutomationRuleDbDocument): IAutomationRule =>
        dbUtils.cleanup<IAutomationRule>(doc);

    const createDocumentFromAutomationRule = (
        rule: ICreateAutomationRule,
        ctx: IQueryInfos,
    ): IAutomationRuleBaseDocument => ({
        ...rule,
        active: false,
        createdAt: dayjs().unix(),
        createdBy: String(ctx.userId),
        modifiedAt: dayjs().unix(),
        modifiedBy: String(ctx.userId),
    });

    const updateDocumentFromAutomationRule = (
        rule: IUpdateAutomationRule,
        ctx: IQueryInfos,
    ): Omit<IUpdateAutomationRule, 'id'> & {modifiedAt: number; modifiedBy: string; _key: string} => ({
        ...(dbUtils.convertToDoc(rule) as Omit<IUpdateAutomationRule, 'id'> & {_key: string}),
        modifiedAt: dayjs().unix(),
        modifiedBy: String(ctx.userId),
    });

    return {
        async createAutomationRule(rule, ctx): Promise<IAutomationRule> {
            const collection = dbService.db.collection(AUTOMATION_RULES_COLLECTION_NAME);
            const docToInsert = createDocumentFromAutomationRule(rule, ctx);

            const newAutomationRule = await dbService.execute<IAutomationRuleDbDocument[]>({
                query: aql`INSERT ${docToInsert} IN ${collection} RETURN NEW`,
                ctx,
            });

            return automationRuleFromDbDocument(newAutomationRule[0]);
        },
        async updateAutomationRule(rule, ctx): Promise<IAutomationRule> {
            const collection = dbService.db.collection(AUTOMATION_RULES_COLLECTION_NAME);
            const docToUpdate = updateDocumentFromAutomationRule(rule, ctx);

            const updatedAutomationRule = await dbService.execute<IAutomationRuleDbDocument[]>({
                query: aql`
                    UPDATE ${docToUpdate} IN ${collection} 
                        OPTIONS { keepNull: false }
                    RETURN NEW`,
                ctx,
            });

            return automationRuleFromDbDocument(updatedAutomationRule[0]);
        },
        async getAutomationRules(params, ctx): Promise<IList<IAutomationRule>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null,
            };

            const {partialMatchOnEventTopic, ...findCoreEntityParams} = {...defaultParams, ...params};

            const customFilterConditions =
                partialMatchOnEventTopic && params.filters?.trigger?.eventTopic !== undefined
                    ? {
                          trigger: (
                              _filterKey: string,
                              filterVal: string | boolean | string[] | Record<string, unknown>,
                          ): GeneratedAqlQuery => {
                              const parts = Object.entries(filterVal as Record<string, unknown>).map(
                                  ([subKey, subVal]) =>
                                      subKey === 'eventTopic'
                                          ? join(
                                                Object.entries(subVal as Record<string, unknown>).map(
                                                    ([eventTopicSubKey, eventTopicSubVal]) =>
                                                        aql`el.trigger.eventTopic.${eventTopicSubKey} == ${eventTopicSubVal}`,
                                                ),
                                                ' OR ',
                                            )
                                          : aql`el.trigger.${subKey} == ${subVal}`,
                              );

                              return parts.length ? join(parts, ' AND ') : join([]);
                          },
                      }
                    : {};

            return dbUtils.findCoreEntity<IAutomationRule, IAutomationRuleDbDocument>({
                ...findCoreEntityParams,
                collectionName: AUTOMATION_RULES_COLLECTION_NAME,
                customFilterConditions,
                mapFromDbDocument: automationRuleFromDbDocument,
                ctx,
            });
        },
    };
}
