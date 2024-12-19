// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICalculationVariable} from 'domain/helpers/calculationVariable';
import {Parser} from 'hot-formula-parser';
import {IUtils} from 'utils/utils';
import {IValue} from '_types/value';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';

interface IDeps {
    'core.domain.helpers.calculationVariable'?: ICalculationVariable;
    'core.utils'?: IUtils;
}

type ActionsListExcelValueType = string | number | boolean | {};

export default function ({
    'core.domain.helpers.calculationVariable': calculationVariable = null
}: IDeps = {}): IActionsListFunction<{Formula: true; Description: true}> {
    const _processReplacement = async (
        context: IActionsListContext,
        initialValues: ActionsListValueType[],
        variable: string
    ): Promise<ActionsListExcelValueType> => {
        const variableValues = await calculationVariable.processVariableString(context, variable, initialValues);
        const stringValues = variableValues.map(v =>
            v.payload === null ? '' : typeof v.payload === 'object' ? v.payload.value : v.payload
        );

        return stringValues.join(' ');
    };

    const _replaceAsync = async (
        str: string,
        regex: RegExp,
        asyncFn: (...args: any[]) => Promise<any>,
        context: IActionsListContext,
        values: ActionsListValueType[]
    ): Promise<string> => {
        if (!str) {
            return '';
        }

        const promises = [];
        str.replace(regex, (match, ...args) => {
            const promise = asyncFn(context, values, ...args);
            promises.push(promise);
            return '';
        });
        const data = await Promise.all(promises);
        // change record object to string
        const stringDatas = data.map(d => (typeof d === 'object' ? d.recordId : d));
        return str.replace(regex, () => stringDatas.shift());
    };

    const _replaceVariables = async (
        formula: string,
        context: IActionsListContext,
        values: ActionsListValueType[]
    ): Promise<string> => {
        const regExp = /{([^{}]*)}/g;
        return _replaceAsync(formula, regExp, _processReplacement, context, values);
    };

    return {
        id: 'excelCalculation',
        name: 'Excel calculation',
        description: 'Performs an excel calculation',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
        compute: true,
        params: [
            {
                name: 'Description',
                type: 'string',
                description: 'Quick description of your calculation',
                required: true,
                default_value: 'Your description'
            },
            {
                name: 'Formula',
                type: 'string',
                description: 'Excel formula to perform, place variables like so : {attribute_identifier}',
                required: true,
                default_value: '21*2'
            }
        ],
        action: async (values, params, ctx) => {
            const {Formula: formula} = params;

            const finalFormula = await _replaceVariables(
                formula,
                ctx,
                values.map(v => v.payload)
            );
            const parser = new Parser();
            const {error, result} = parser.parse(finalFormula);

            if (error) {
                return {
                    values,
                    errors: [
                        {
                            errorType: Errors.EXCEL_CALCULATION_ERROR,
                            attributeValue: null
                        }
                    ]
                };
            }

            const finalResult: IValue = {
                id_value: null,
                isCalculated: true,
                modified_at: null,
                modified_by: null,
                created_at: null,
                created_by: null,
                payload: String(result),
                raw_payload: String(result)
            };

            return {values: [...values, finalResult], errors: []};
        }
    };
}
