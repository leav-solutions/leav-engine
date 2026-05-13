import {logger} from '@leav/logger';
import {type IValueDomain} from '../value/valueDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IRecord} from '../../_types/record';
import {type IValue} from '../../_types/value';
import {type ITreeNode} from '../../_types/tree';
import jexl from './jexlExtended';
import {
    type JexlContext,
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
}

export interface IJexlDomain {
    eval<Return = unknown, Ctx extends JexlContext = JexlContext>(expression: string, context?: Ctx): Promise<Return>;
    validate(expression: string): Promise<void>;

    // Functions to prepare contexts for Jexl evaluation
    buildRootContext: <T>(contextData: T, ctx: IQueryInfos) => JexlRootContext<T>;
    buildRecordContext: (record: IRecord, ctx: IQueryInfos) => JexlRecordContext;
    buildTreeNodeContext: (treeNode: ITreeNode, ctx: IQueryInfos) => JexlTreeNodeContext;
    buildValuesContext: (values: IValue[], ctx: IQueryInfos) => JexlValueContext[];
}

export default function ({'core.domain.value': valueDomain}: IDeps): IJexlDomain {
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
            logger.error(
                `Error fetching values for attribute ${attributePath} in getValues transform for record ${valueRecord.library}/${valueRecord.id}: ${error.stack}`,
            );
            throw error;
        }
    };

    jexl.addTransform('getValues', _getValues);
    jexl.addFunction('getValues', _getValues);

    function buildRecordContext(record: IRecord, ctx: IQueryInfos): JexlRecordContext {
        return {
            ...record,
            __jexlContextType: JexlContextType.RECORD,
            __getJexlQueryCtx: () => ctx,
        };
    }

    function buildTreeNodeContext(treeNode: ITreeNode, ctx: IQueryInfos): JexlTreeNodeContext {
        return {
            ...treeNode,
            __jexlContextType: JexlContextType.TREE_NODE,
            __getJexlQueryCtx: () => ctx,
        };
    }
    function buildUserContext(ctx: IQueryInfos): JexlUserContext {
        return {
            __jexlContextType: JexlContextType.USER,
            record: buildRecordContext({id: ctx.userId, library: 'users'}, ctx),
            lang: ctx.lang,
            __getJexlQueryCtx: () => ctx,
        };
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
        return {
            ...contextData,
            currentUser: buildUserContext(ctx),
            __jexlContextType: JexlContextType.ROOT,
            __getJexlQueryCtx: () => ctx,
        };
    }

    return {
        eval: (expression, context) =>
            // Maybe introduce caching of compiled expressions if performance is an issue
            jexl.eval(expression, context),
        validate: async expression => {
            try {
                await jexl.compile(expression);
            } catch (error) {
                throw new ValidationError(
                    {
                        formula: {
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
