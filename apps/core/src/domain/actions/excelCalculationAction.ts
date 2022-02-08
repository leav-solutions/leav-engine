// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, ActionsListValueType, IActionsListContext} from '../../_types/actionsList';
import {Parser} from 'hot-formula-parser';
import {IValueDomain} from 'domain/value/valueDomain';
import {IVariableFunctions} from 'domain/helpers/calculationsVariableFunctions';
import {ICalculationVariable, IVariableValue} from 'domain/helpers/calculationVariable';

interface IDeps {
    'core.domain.helpers.calculationVariable'?: ICalculationVariable;
}

type ActionsListExcelValueType = string | number | boolean | {};

export interface IActionListExcelContext extends IActionsListContext {
    value?: ActionsListExcelValueType;
}

export default function ({'core.domain.helpers.calculationVariable': calculationVariable = null}: IDeps = {}) {
    const _processReplacement = async (
        context: IActionsListContext,
        initialValue: ActionsListValueType,
        variable: string
    ): Promise<ActionsListExcelValueType> => {
        const variableValues = await calculationVariable.processVariableString(context, variable, initialValue);
        const stringValues = variableValues.map(v => {
            return typeof v.value === 'object' ? v.value.value : v.value;
        });

        return stringValues.join(' ');
    };
    const _replaceAsync = async (
        str: string,
        regex: RegExp,
        asyncFn,
        context: IActionsListContext,
        value: ActionsListValueType
    ): Promise<string> => {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            const promise = asyncFn(context, value, ...args);
            promises.push(promise);
            return '';
        });
        const data = await Promise.all(promises);
        //change record object to string
        const stringDatas = data.map(d => (typeof d === 'object' ? d.recordId : d));
        return str.replace(regex, () => stringDatas.shift());
    };
    const _replaceVariables = async (
        formula: string,
        context: IActionsListContext,
        value: ActionsListValueType
    ): Promise<string> => {
        const regExp = /{([^{}]*)}/g;
        const res = _replaceAsync(formula, regExp, _processReplacement, context, value);
        return res;
    };
    return {
        id: 'excelCalculation',
        name: 'Excel calculation',
        description: 'Performs an excel calcultation',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
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
                type: 'textarea',
                description: 'Excel formula to perform, place variables like so : {attribute_identifier}',
                required: true,
                default_value: '21*2'
            }
        ],
        action: async (value: ActionsListValueType, params: any, ctx: IActionsListContext): Promise<string> => {
            const {Formula: formula} = params;

            const finalFormula = await _replaceVariables(formula, ctx, value);
            const parser = new Parser();
            const {error, result} = parser.parse(finalFormula);
            if (error) {
                return `Excel calculation error : ${error}
                ${finalFormula}`;
            }
            const finalResult: string = `${result}`;
            return finalResult;
        }
    };
}
