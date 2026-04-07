// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {aql} from 'arangojs';
import {type ICreateAutomationRule, type IAutomationRule, type IUpdateAutomationRule} from '../../_types/automation';
import {type IList} from '../../_types/list';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import {type ISystemTranslation} from '../../_types/systemTranslation';
import {type IDbDocument} from '../db/_types';
import {type IDbService} from '../db/dbService';
import {type IDbUtils} from '../db/dbUtils';
import dayjs from 'dayjs';

export const AUTOMATION_RULES_COLLECTION_NAME = 'core_automation_rules';

type IAutomationRuleBaseDocument = {
    label: ISystemTranslation;
    description?: ISystemTranslation;
    active: boolean;
    // metadata
    createdAt?: number;
    createdBy?: string;
    modifiedAt?: number;
    modifiedBy?: string;
};

type IAutomationRuleDbDocument = IAutomationRuleBaseDocument & IDbDocument;

export type IAutomationRuleFilterOptionsInRepo = ICoreEntityFilterOptions & {
    active?: boolean;
};

export type IGetAutomationRulesParams = IGetCoreEntitiesParams & {
    filters?: IAutomationRuleFilterOptionsInRepo;
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
    ): IAutomationRuleBaseDocument => ({
        ...dbUtils.convertToDoc(rule),
        modifiedAt: dayjs().unix(),
        modifiedBy: String(ctx.userId),
    });

    return {
        async createAutomationRule(rule: ICreateAutomationRule, ctx: IQueryInfos): Promise<IAutomationRule> {
            const collection = dbService.db.collection(AUTOMATION_RULES_COLLECTION_NAME);
            const docToInsert = createDocumentFromAutomationRule(rule, ctx);

            const newAutomationRule = await dbService.execute<IAutomationRuleDbDocument[]>({
                query: aql`INSERT ${docToInsert} IN ${collection} RETURN NEW`,
                ctx,
            });

            return automationRuleFromDbDocument(newAutomationRule[0]);
        },
        async updateAutomationRule(rule: IUpdateAutomationRule, ctx: IQueryInfos): Promise<IAutomationRule> {
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
        async getAutomationRules(params: IGetCoreEntitiesParams, ctx: IQueryInfos): Promise<IList<IAutomationRule>> {
            const defaultParams: IGetCoreEntitiesParams = {
                filters: null,
                strictFilters: false,
                withCount: false,
                pagination: null,
                sort: null,
            };
            const initializedParams = {...defaultParams, ...params};

            return dbUtils.findCoreEntity<IAutomationRule, IAutomationRuleDbDocument>({
                ...initializedParams,
                collectionName: AUTOMATION_RULES_COLLECTION_NAME,
                customFilterConditions: {
                    userId: (filterKey, filterVal) => aql`el.${filterKey} == ${filterVal}`,
                },
                mapFromDbDocument: automationRuleFromDbDocument,
                ctx,
            });
        },
    };
}
