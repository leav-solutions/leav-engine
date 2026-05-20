/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {aql} from 'arangojs';
import {join, type GeneratedAqlQuery} from 'arangojs/aql';
import {
    type AutomationRuleIndexEntry,
    type ICreateAutomationRule,
    type IAutomationRule,
    type IUpdateAutomationRule,
    type SyncAutomationRuleEventAction,
} from '../../_types/automation';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
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
    getActiveAutomationRulesForCache(ctx: IQueryInfos): Promise<AutomationRuleIndexEntry[]>;
    deleteAutomationRule(ruleId: string, ctx: IQueryInfos): Promise<IAutomationRule>;
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
        async createAutomationRule(rule, ctx) {
            const collection = dbService.db.collection(AUTOMATION_RULES_COLLECTION_NAME);
            const docToInsert = createDocumentFromAutomationRule(rule, ctx);

            const newAutomationRule = await dbService.execute<IAutomationRuleDbDocument[]>({
                query: aql`INSERT ${docToInsert} IN ${collection} RETURN NEW`,
                ctx,
            });

            return automationRuleFromDbDocument(newAutomationRule[0]);
        },
        async updateAutomationRule(rule, ctx) {
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
        async deleteAutomationRule(ruleId, ctx) {
            const collection = dbService.db.collection(AUTOMATION_RULES_COLLECTION_NAME);

            const oldAutomationRule = await dbService.execute<IAutomationRuleDbDocument[]>({
                query: aql`
                    REMOVE { _key: ${ruleId} } IN ${collection} 
                    RETURN OLD
                `,
                ctx,
            });

            return automationRuleFromDbDocument(oldAutomationRule[0]);
        },
        async getActiveAutomationRulesForCache(ctx) {
            const collection = dbService.db.collection(AUTOMATION_RULES_COLLECTION_NAME);

            return dbService.execute<AutomationRuleIndexEntry[]>({
                query: aql`
                    FOR el IN ${collection}
                        FILTER el.active == true
                        RETURN { id: el._key, trigger: el.trigger }
                `,
                ctx,
            });
        },
        async getAutomationRules(params, ctx) {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null,
            };

            const {partialMatchOnEventTopic, ...findCoreEntityParams} = {...defaultParams, ...params};

            const buildEventTopicFilter = (eventTopic: Record<string, unknown>): GeneratedAqlQuery => {
                const eventTopicEntries = Object.entries(eventTopic);
                const valueConditions = eventTopicEntries.map(([eventTopicSubKey, eventTopicSubVal]) =>
                    partialMatchOnEventTopic
                        ? aql`(el.trigger.eventTopic.${eventTopicSubKey} == ${eventTopicSubVal} OR el.trigger.eventTopic.${eventTopicSubKey} == null)`
                        : aql`(el.trigger.eventTopic.${eventTopicSubKey} == ${eventTopicSubVal})`,
                );

                // Ensure that the rule's eventTopic does not have extra keys that are not in the event, otherwise it would match events that only partially match the filter
                const allowedKeys = eventTopicEntries.map(([k]) => k);
                const subsetConstraint =
                    partialMatchOnEventTopic && allowedKeys.length > 0
                        ? [
                              aql`(NOT IS_OBJECT(el.trigger.eventTopic) OR COUNT(MINUS(ATTRIBUTES(el.trigger.eventTopic, true), ${allowedKeys})) == 0)`,
                          ]
                        : [];

                return join([...valueConditions, ...subsetConstraint], ' AND ');
            };

            const customFilterConditions =
                params.filters?.trigger !== undefined
                    ? {
                          trigger: (
                              _filterKey: string,
                              filterVal: string | boolean | string[] | Record<string, unknown>,
                          ): GeneratedAqlQuery => {
                              const parts = Object.entries(filterVal as Record<string, unknown>).map(
                                  ([subKey, subVal]) =>
                                      subKey === 'eventTopic'
                                          ? buildEventTopicFilter(subVal as Record<string, unknown>)
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
