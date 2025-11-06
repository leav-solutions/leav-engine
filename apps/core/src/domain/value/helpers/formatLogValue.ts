// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type EventAction} from '@leav/utils';
import {AttributeFormats, AttributeTypes, type IAttribute} from '../../../_types/attribute';
import {type IDBPayloadData} from '_types/events';
import {type Log} from '_types/log';
import {type ILinkValue, type IStandardValue, type ITreeValue, type IValue} from '_types/value';
import {type IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type ITreeDomain} from 'domain/tree/treeDomain';
import {type i18n} from 'i18next';
import {type ILogger} from '@leav/logger';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {AttributeCondition, type IRecord} from '../../../_types/record';

export interface IFormatLogValueHelper {
    formatAsString(
        log: Log,
        rawData: IDBPayloadData<EventAction.VALUE_DELETE | EventAction.VALUE_SAVE>,
        ctx: IQueryInfos,
    ): Promise<string | null>;
}

interface IDeps {
    'core.domain.actionsList': IActionsListDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tree': ITreeDomain;
    'core.utils.logger': ILogger;
    translator: i18n;
}

export default function ({
    'core.domain.actionsList': actionsListDomain,
    'core.domain.record': recordDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
    'core.utils.logger': logger,
    translator,
}: IDeps): IFormatLogValueHelper {
    const execFormatPayloadAction = async <R>(
        attribute: IAttribute,
        actionId: string,
        rawData: IStandardValue,
        ctx: IQueryInfos,
    ): Promise<R> => {
        const actionParams = attribute.actions_list?.getValue?.find(action => action.id === actionId);
        if (!actionParams) {
            return rawData.payload;
        }
        const valueAfterAction = await actionsListDomain.runActionsList(
            [actionParams],
            [
                {
                    raw_payload: rawData.payload,
                },
            ],
            ctx,
        );
        return valueAfterAction[0].payload as R;
    };

    const formatLogDataValueStandardAsString = async (
        attribute: IAttribute,
        rawData: IStandardValue,
        ctx: IQueryInfos,
    ): Promise<string> => {
        switch (attribute.format) {
            case AttributeFormats.BOOLEAN:
                return rawData.payload
                    ? translator.t('global.yes', {lng: ctx.lang})
                    : translator.t('global.no', {lng: ctx.lang});
            case AttributeFormats.DATE_RANGE:
                if (typeof rawData.payload === 'object') {
                    const formattedPayload = await execFormatPayloadAction<{from: string; to: string}>(
                        attribute,
                        'formatDateRange',
                        rawData,
                        ctx,
                    );
                    return translator.t('labels.date_range', {
                        lng: ctx.lang,
                        ...formattedPayload,
                        interpolation: {escapeValue: false},
                    });
                }
                break;
            case AttributeFormats.DATE: {
                const formattedPayload = await execFormatPayloadAction<string>(attribute, 'formatDate', rawData, ctx);
                return String(formattedPayload);
            }
            case AttributeFormats.EXTENDED:
                return JSON.stringify(rawData.payload);
            case AttributeFormats.ENCRYPTED:
                return '*****';
        }
        return rawData.payload != null ? String(rawData.payload) : translator.t('logs.unknown_value', {lng: ctx.lang});
    };

    const getRecordIdentityLabel = async (record: IRecord, ctx: IQueryInfos): Promise<string | null> => {
        const recordIdentity = await recordDomain.getRecordIdentity(record, ctx);
        return recordIdentity.getLabel?.();
    };

    const formatLogDataValueLink = async (rawData: ILinkValue, ctx: IQueryInfos): Promise<string> => {
        try {
            // refetch record to have up to date label and whoAmI
            const record = await recordDomain.find({
                params: {
                    library: rawData.payload.library,
                    filters: [
                        {
                            field: 'id',
                            condition: AttributeCondition.EQUAL,
                            value: rawData.payload.id,
                        },
                    ],
                    retrieveInactive: true,
                    ignorePermissions: true,
                    withCount: false,
                },
                ctx,
            });

            if (record.list.length === 0) {
                throw new Error('Record not found');
            }

            return (
                (await getRecordIdentityLabel(record.list[0], ctx)) ||
                `${rawData.payload.library}/${rawData.payload.id}`
            );
        } catch (e) {
            // record may have issue with record identity computation, we just log the error and return fallback value
            logger.debug(
                `[LogApp] Error fetching record ${rawData.payload.library}${rawData.payload.id} for link value: ${e.stack}`,
            );
            return `${rawData.payload.library}/${rawData.payload.id}`;
        }
    };

    const formatLogDataValueTreeAsString = async (rawData: ITreeValue, ctx: IQueryInfos): Promise<string> => {
        try {
            const recordTree = await treeDomain.getRecordByNodeId({
                nodeId: rawData.payload.id,
                treeId: rawData.treeId,
                ctx,
            });
            if (!recordTree) {
                throw new Error('Tree node not found');
            }

            return (await getRecordIdentityLabel(recordTree, ctx)) || `${rawData.treeId}/${rawData.payload.id}`;
        } catch (e) {
            // tree or node may have been deleted, we just log the error and return null
            logger.debug(
                `[LogApp] Error fetching record ${rawData.treeId}/${rawData.payload.id} for tree value: ${e.stack}`,
            );
            return `${rawData.treeId}/${rawData.payload.id}`;
        }
    };

    return {
        formatAsString: async (
            log: Log,
            rawData: IDBPayloadData<EventAction.VALUE_DELETE | EventAction.VALUE_SAVE>,
            ctx: IQueryInfos,
        ): Promise<string | null> => {
            const attributeId = log.topic.attribute || (rawData.payload as IValue)?.attribute;
            if (!attributeId) {
                logger.debug(`[LogApp] Error getting attribute id in logs ${JSON.stringify(log)}`);
                return translator.t('logs.unknown_value', {lng: ctx.lang});
            }
            try {
                const attribute = await attributeDomain.getAttributeProperties({id: attributeId, ctx});
                switch (attribute?.type) {
                    case AttributeTypes.SIMPLE:
                    case AttributeTypes.ADVANCED:
                        return await formatLogDataValueStandardAsString(attribute, rawData, ctx);
                    case AttributeTypes.SIMPLE_LINK:
                    case AttributeTypes.ADVANCED_LINK:
                        return await formatLogDataValueLink(rawData, ctx);
                    case AttributeTypes.TREE:
                        return await formatLogDataValueTreeAsString(rawData as ITreeValue, ctx);
                    default:
                        logger.error(`[LogApp] Unknown attribute type ${attribute?.type} for attribute ${attributeId}`);
                        return translator.t('logs.unknown_value', {lng: ctx.lang});
                }
            } catch (e) {
                logger.debug(`[LogApp] Error fetching attribute ${attributeId}: ${e.stack}`);
                return translator.t('logs.unknown_value', {lng: ctx.lang});
            }
        },
    };
}
