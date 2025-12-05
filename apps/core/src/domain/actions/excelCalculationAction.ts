// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogger} from '@leav/logger';
import {type ICalculationVariable} from 'domain/helpers/calculationVariable';
import {Parser} from 'hot-formula-parser';
import {DetailedCellError, HyperFormula} from 'hyperformula';
import {type IValue} from '_types/value';
import {
    ActionsListIOTypes,
    type IActionsListFunctionResult,
    type ActionsListValueType,
    type IActionsListContext,
    type IActionsListFunction,
} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';
import {type IConfig} from '_types/config';

interface IDeps {
    'core.domain.helpers.calculationVariable': ICalculationVariable;
    config: IConfig;
    'core.utils.logger': ILogger;
}

type ActionsListExcelValueType = string | number | boolean | {};

export default function ({
    'core.domain.helpers.calculationVariable': calculationVariable,
    'core.utils.logger': logger,
    config,
}: IDeps): IActionsListFunction<{Formula: true; Description: true}> {
    const _processReplacement = async (
        context: IActionsListContext,
        initialValues: ActionsListValueType[],
        variable: string,
    ): Promise<ActionsListExcelValueType> => {
        const variableValues = await calculationVariable.processVariableString(context, variable, initialValues);
        return variableValues.flatMap(v => v.raw_payload ?? v.payload ?? []).join(' ');
    };

    const _replaceAsync = async (
        str: string,
        regex: RegExp,
        asyncFn: (...args: any[]) => Promise<any>,
        context: IActionsListContext,
        values: ActionsListValueType[],
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
        values: ActionsListValueType[],
    ): Promise<string> => {
        const regExp = /{([^{}]*)}/g;
        return _replaceAsync(formula, regExp, _processReplacement, context, values);
    };

    const _buildSameValuesResult = (values: IValue[]): IActionsListFunctionResult => ({
        values: [
            ...values,
            {
                id_value: null,
                isCalculated: true,
                modified_at: null,
                modified_by: null,
                created_at: null,
                created_by: null,
                payload: '',
                raw_payload: '',
            },
        ],
        errors: [],
    });

    const debug = config.actions.excel.debug ?? false;
    const actionWithHyperformula: IActionsListFunction<{Formula: true; Description: true}>['action'] = async (
        values,
        params,
        ctx,
    ) => {
        const {Formula: formula} = params;

        if (formula === '') {
            return _buildSameValuesResult(values);
        }

        // Prepare formula by replacing variables, adding '=' at the beginning
        const finalFormula = await _replaceVariables(
            `=${formula}`,
            ctx,
            values.map(v => v.payload),
        );

        if (finalFormula === '=') {
            return _buildSameValuesResult(values);
        }

        // Simulate a sheet with only one cell containing the formula
        const hfInstance = HyperFormula.buildFromArray([[finalFormula]], {
            licenseKey: 'gpl-v3',
        });

        const result = hfInstance.getCellValue({sheet: 0, col: 0, row: 0});

        if (result instanceof DetailedCellError) {
            debug && logger.debug(`Excel calculation with hyperformula error: ${finalFormula} => ${result.message}`);
            return {
                values,
                errors: [
                    {
                        errorType: Errors.EXCEL_CALCULATION_ERROR,
                        attributeValue: null,
                        message: `Error: ${result.message} in formula: -- ${finalFormula} --`,
                    },
                ],
            };
        }
        debug && logger.debug(`Excel calculation with hyperformula: ${finalFormula} => ${result}`);

        const finalResult: IValue = {
            id_value: null,
            isCalculated: true,
            modified_at: null,
            modified_by: null,
            created_at: null,
            created_by: null,
            payload: String(result),
            raw_payload: String(result),
        };

        return {values: [...values, finalResult], errors: []};
    };

    const actionWithHotFormulaParser: IActionsListFunction<{Formula: true; Description: true}>['action'] = async (
        values,
        params,
        ctx,
    ) => {
        const {Formula: formula} = params;

        const finalFormula = await _replaceVariables(
            formula,
            ctx,
            values.map(v => v.payload),
        );

        const parser = new Parser();

        const {error, result} = parser.parse(finalFormula);

        if (error) {
            debug && logger.debug(`Excel calculation with hot-formula-parser error: ${finalFormula} => ${error}`);
            return {
                values,
                errors: [
                    {
                        errorType: Errors.EXCEL_CALCULATION_ERROR,
                        attributeValue: null,
                        message: `Error: ${error} in formula: -- ${finalFormula} --`,
                    },
                ],
            };
        }
        debug && logger.debug(`Excel calculation with hot-formula-parser: ${finalFormula} => ${result}`);

        const finalResult: IValue = {
            id_value: null,
            isCalculated: true,
            modified_at: null,
            modified_by: null,
            created_at: null,
            created_by: null,
            payload: String(result),
            raw_payload: String(result),
        };

        return {values: [...values, finalResult], errors: []};
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
                helper_value: 'Your description',
            },
            {
                name: 'Formula',
                type: 'string',
                description: 'Excel formula to perform, place variables like so : {attribute_identifier}',
                required: true,
                helper_value: '21*2',
            },
        ],
        action: config.actions.excel.useNewHyperformula ? actionWithHyperformula : actionWithHotFormulaParser,
    };
}
