import {logger} from '@leav/logger';
import {type IValueDomain} from '../value/valueDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {type ITreeDomain} from '../tree/treeDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import {AttributeCondition, type IRecord} from '../../_types/record';
import {type IValue} from '../../_types/value';
import {type ITreeNode} from '../../_types/tree';
import {type IConfig} from '../../_types/config';
import jexl from './jexlExtended';
import {
    type JexlContext,
    type JexlContextByType,
    JexlContextType,
    type JexlRecordContext,
    type JexlRootContext,
    type JexlTreeNodeContext,
    type JexlUserContext,
    type JexlValueContext,
} from './types';
import {Errors} from '../../_types/errors';
import ValidationError from '../../errors/ValidationError';

interface IDeps {
    'core.domain.value': IValueDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.tree': ITreeDomain;
    config: IConfig;
}

const JEXL_CONTEXT_KEY = '$';

export interface IJexlDomain {
    eval<Return = unknown, Ctx extends JexlContext = JexlContext>(expression: string, context?: Ctx): Promise<Return>;
    validate(expression: string): Promise<void>;

    // Functions to prepare contexts for Jexl evaluation
    buildRootContext: <T>(contextData: T, ctx: IQueryInfos) => JexlRootContext<T>;
    buildRecordContext: (record: IRecord, ctx: IQueryInfos) => JexlRecordContext;
    buildTreeNodeContext: (treeNode: ITreeNode, ctx: IQueryInfos) => JexlTreeNodeContext;
    buildValuesContext: (values: IValue[], ctx: IQueryInfos) => JexlValueContext[];
}

export default function ({
    'core.domain.value': valueDomain,
    'core.domain.record': recordDomain,
    'core.domain.tree': treeDomain,
    config,
}: IDeps): IJexlDomain {
    const debug = config.actions.jexl.debug ?? false;

    const _getValues = async (
        value: JexlRecordContext | JexlTreeNodeContext,
        attributePath: string,
    ): Promise<JexlValueContext[]> => {
        if (
            value == null ||
            (value.__jexlContextType !== JexlContextType.TREE_NODE &&
                value.__jexlContextType !== JexlContextType.RECORD)
        ) {
            throw new Error('getValues transform can only be used on record or tree node');
        }

        const valueRecord: IRecord = value.__jexlContextType === JexlContextType.TREE_NODE ? value.record : value;
        const ctx = value.__getJexlQueryCtx();

        try {
            // TODO use attributePath as path instead of attribute id !
            const values = await valueDomain.getValues({
                attribute: attributePath,
                recordId: valueRecord.id,
                library: valueRecord.library,
                ctx,
            });
            return buildValuesContext(values, ctx);
        } catch (error) {
            debug &&
                logger.debug(
                    `Error fetching values for attribute ${attributePath} in getValues transform for record ${valueRecord.library}/${valueRecord.id}: ${error.stack}`,
                );
            throw error;
        }
    };

    jexl.addTransform('getValues', _getValues);
    jexl.addFunction('getValues', _getValues);

    const _getRecord = async (
        rootContext: JexlRootContext,
        libraryId: string,
        recordId: string,
    ): Promise<JexlRecordContext> => {
        if (rootContext == null || rootContext.__jexlContextType !== JexlContextType.ROOT) {
            throw new Error('getRecord function can only be used on root context');
        }

        const ctx = rootContext.__getJexlQueryCtx();

        try {
            const record = await recordDomain
                .find({
                    params: {
                        library: libraryId,
                        filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: recordId}],
                        pagination: {limit: 1, offset: 0},
                    },
                    ctx,
                })
                .then(res => res.list[0]);

            if (record == null) {
                throw new Error(`Record with id ${recordId} not found in library ${libraryId}`);
            }

            return buildRecordContext(record, ctx);
        } catch (error) {
            debug &&
                logger.debug(
                    `Error fetching record for getRecord function for record ${libraryId}/${recordId}: ${error.stack}`,
                );
            throw error;
        }
    };

    jexl.addTransform('getRecord', _getRecord);
    jexl.addFunction('getRecord', _getRecord);

    const _toNode = async (recordContext: JexlRecordContext, treeId: string): Promise<JexlTreeNodeContext> => {
        if (recordContext == null || recordContext.__jexlContextType !== JexlContextType.RECORD) {
            throw new Error('toNode transform can only be used on record context');
        }

        const ctx = recordContext.__getJexlQueryCtx();

        try {
            const treeNodeId = await treeDomain
                .getNodesByRecord({
                    treeId,
                    record: {
                        id: recordContext.id,
                        library: recordContext.library,
                    },
                    ctx,
                })
                .then(nodeIds => nodeIds[0]); // Consider only single node case for now

            if (treeNodeId == null) {
                throw new Error(
                    `No tree node found in tree ${treeId} for record ${recordContext.library}/${recordContext.id}`,
                );
            }
            return buildTreeNodeContext(
                {
                    id: treeNodeId,
                    record: {
                        id: recordContext.id,
                        library: recordContext.library,
                    },
                },
                ctx,
            );
        } catch (error) {
            debug &&
                logger.debug(
                    `Error fetching tree node for toNode transform for record ${recordContext.library}/${recordContext.id} in tree ${treeId}: ${error.stack}`,
                );
            throw error;
        }
    };

    jexl.addTransform('toNode', _toNode);
    jexl.addFunction('toNode', _toNode);

    function addJexlContext<Type extends JexlContextType>(
        jexlContext: Omit<JexlContext, '__jexlContextType' | '__getJexlQueryCtx'>,
        type: Type,
        ctx: IQueryInfos,
    ): JexlContextByType[Type] {
        // Define non-enumerable properties to avoid serializing them when context is a return value of a jexl expression
        // and to avoid conflicts with user-defined properties in jexl expressions, readonly and non-configurable to prevent accidental modifications
        Object.defineProperty(jexlContext, '__jexlContextType', {
            value: type,
            enumerable: false,
            writable: false,
            configurable: false,
        });
        Object.defineProperty(jexlContext, '__getJexlQueryCtx', {
            value: () => ctx,
            enumerable: false,
            writable: false,
            configurable: false,
        });

        return jexlContext as JexlContextByType[Type];
    }

    function buildRecordContext(record: IRecord, ctx: IQueryInfos): JexlRecordContext {
        return addJexlContext({...record}, JexlContextType.RECORD, ctx);
    }

    function buildTreeNodeContext(treeNode: ITreeNode, ctx: IQueryInfos): JexlTreeNodeContext {
        return addJexlContext({...treeNode}, JexlContextType.TREE_NODE, ctx);
    }
    function buildUserContext(ctx: IQueryInfos): JexlUserContext {
        return addJexlContext(
            {
                record: buildRecordContext({id: ctx.userId, library: 'users'}, ctx),
                lang: ctx.lang,
            },
            JexlContextType.USER,
            ctx,
        );
    }

    const _isRecordPayload = (payload: IValue['payload']): payload is IRecord =>
        typeof payload === 'object' && 'id' in payload && 'library' in payload;

    const _isTreeNodePayload = (payload: IValue['payload']): payload is ITreeNode =>
        typeof payload === 'object' && 'id' in payload && 'record' in payload && _isRecordPayload(payload.record);

    function buildValuesContext(values: IValue[], ctx: IQueryInfos): JexlValueContext[] {
        return values.map(v => {
            if (_isTreeNodePayload(v.payload)) {
                return buildTreeNodeContext(v.payload, ctx);
            } else if (_isRecordPayload(v.payload)) {
                return buildRecordContext(v.payload, ctx);
            }
            return v.payload;
        });
    }

    function buildRootContext<T>(contextData: T, ctx: IQueryInfos): JexlRootContext<T> {
        return addJexlContext(
            {
                ...contextData,
                currentUser: buildUserContext(ctx),
            },
            JexlContextType.ROOT,
            ctx,
        ) as JexlRootContext<T>;
    }

    return {
        eval: (expression, context) =>
            // Maybe introduce caching of compiled expressions if performance is an issue
            jexl.eval(expression, {
                [JEXL_CONTEXT_KEY]: context,
            }),
        validate: async expression => {
            try {
                await jexl.compile(expression);
            } catch (error) {
                throw new ValidationError(
                    {
                        expression: {
                            msg: Errors.INVALID_JEXL_EXPRESSION,
                            vars: {
                                error: error.message,
                            },
                        },
                    },
                    error.message,
                );
            }
        },

        buildRecordContext,
        buildTreeNodeContext,
        buildValuesContext,
        buildRootContext,
    };
}
