// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IVariableValue} from 'domain/helpers/calculationVariable';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IActionsListContext} from '_types/actionsList';
import {TypeGuards} from '../../../utils';
import {IDateRangeValue} from '../../../_types/value';

interface IDeps {
    'core.domain.record': IRecordDomain;
    'core.domain.attribute': IAttributeDomain;
}

interface IVariableFunction {
    run: (context: IActionsListContext, inputValue: any, ...params: any[]) => Promise<IVariableValue[]>;
    after: string[];
}

export interface IVariableFunctions {
    [key: string]: IVariableFunction;
}

export default function ({
    'core.domain.record': recordDomain,
    'core.domain.attribute': attributeDomain
}: IDeps): IVariableFunctions {
    const first = async (context: IActionsListContext, inputValue: IVariableValue[]): Promise<IVariableValue[]> => [
        {
            ...inputValue[0]
        }
    ];
    const input = first;
    const last = async (context: IActionsListContext, inputValue: IVariableValue[]): Promise<IVariableValue[]> => [
        {
            ...inputValue[inputValue.length - 1]
        }
    ];

    const fromDate = async (context: IActionsListContext, inputValue: IVariableValue[]): Promise<IVariableValue[]> =>
        inputValue.map(variableValue => ({
            ...variableValue,
            payload: (variableValue.raw_payload as IDateRangeValue).from
        }));

    const toDate = async (context: IActionsListContext, inputValue: IVariableValue[]): Promise<IVariableValue[]> =>
        inputValue.map(variableValue => ({
            ...variableValue,
            payload: (variableValue.raw_payload as IDateRangeValue).to
        }));

    const sum = async (context: IActionsListContext, inputValue: IVariableValue[]): Promise<IVariableValue[]> => [
        {
            ...inputValue[0],
            payload: inputValue.reduce((acc, v) => {
                const value = typeof v.payload === 'object' ? v.payload.value : v.payload;
                return acc + parseFloat(value);
            }, 0)
        }
    ];

    const avg = async (context: IActionsListContext, inputValue: IVariableValue[]): Promise<IVariableValue[]> => [
        {
            ...inputValue[0],
            payload:
                inputValue.reduce((acc, v) => {
                    const value = typeof v.payload === 'object' ? v.payload.value : v.payload;
                    return acc + parseFloat(value);
                }, 0) / inputValue.length
        }
    ];

    const concat = async (
        context: IActionsListContext,
        inputValue: IVariableValue[],
        separator: string
    ): Promise<IVariableValue[]> => [
        {
            ...inputValue[0],
            payload: inputValue.map(v => v.payload).join(separator)
        }
    ];

    const dedup = async (context: IActionsListContext, inputValue: IVariableValue[]): Promise<IVariableValue[]> => {
        const seen = {};
        return inputValue.filter(function (v) {
            const stringRepresentation = JSON.stringify(v.payload);
            return seen.hasOwnProperty(stringRepresentation) ? false : (seen[stringRepresentation] = true);
        });
    };

    const getValue = async (
        context: IActionsListContext,
        inputValue: IVariableValue[],
        attributeKey: string
    ): Promise<IVariableValue[]> =>
        Promise.all(
            inputValue.map(async ({library, recordId}) => {
                let values = await recordDomain.getRecordFieldValue({
                    library,
                    record: {
                        id: recordId,
                        library
                    },
                    attributeId: attributeKey,
                    ctx: context
                });

                if (!Array.isArray(values)) {
                    values = [values];
                }

                let currReturnValue: IVariableValue[] = [];

                if (values.length) {
                    const properties = await attributeDomain.getAttributeProperties({id: attributeKey, ctx: context});

                    if (properties?.linked_library) {
                        currReturnValue = values
                            .map(v =>
                                !!v?.payload
                                    ? {
                                          library: properties?.linked_library,
                                          recordId: v.payload.id,
                                          payload: v.payload.id
                                      }
                                    : null
                            )
                            .filter(v => !!v);
                    } else {
                        currReturnValue = values.map(v => ({
                            library,
                            recordId,
                            payload: v?.payload ?? null,
                            raw_payload: TypeGuards.isIStandardValue(v) ? v?.raw_payload : null
                        }));
                    }
                }

                return currReturnValue;
            })
        ).then(tmp =>
            tmp.reduce((acc, v) => {
                acc = [...acc, ...v];
                return acc;
            }, [])
        );

    return {
        input: {
            run: input,
            after: []
        },
        first: {
            run: first,
            after: []
        },
        last: {
            run: last,
            after: []
        },
        sum: {
            run: sum,
            after: []
        },
        avg: {
            run: avg,
            after: []
        },
        concat: {
            run: concat,
            after: []
        },
        dedup: {
            run: dedup,
            after: []
        },
        getValue: {
            run: getValue,
            after: []
        },
        fromDate: {
            run: fromDate,
            after: []
        },
        toDate: {
            run: toDate,
            after: []
        }
    };
}
