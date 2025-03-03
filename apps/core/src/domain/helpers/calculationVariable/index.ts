// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {ActionsListValueType, IActionsListContext} from '_types/actionsList';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {IVariableFunctions} from '../calculationsVariableFunctions';
import {ITreeNode} from '../../../_types/tree';

interface IDeps {
    'core.domain.helpers.calculationsVariableFunctions': IVariableFunctions;
}

export interface IVariableValue {
    recordId: string;
    library: string;
    payload: string | number | boolean | ITreeNode | Record<string, any>;
    raw_payload?: string | number | boolean | Record<string, any>;
}

export interface ICalculationVariable {
    processVariableString: (
        context: IActionsListContext,
        variables: string,
        initialValues: ActionsListValueType[]
    ) => Promise<IVariableValue[]>;
}

export default function ({'core.domain.helpers.calculationsVariableFunctions': variableFunctions}: IDeps) {
    const processVariableString: ICalculationVariable['processVariableString'] = async (
        context,
        variableString,
        initialValues
    ) => {
        let passingValue = [
            {
                recordId: context.recordId,
                library: context.library,
                payload: initialValues
            }
        ] as IVariableValue[];

        const functionsStrings = variableString.split('.').filter(fStr => fStr.length);

        for (const funcString of functionsStrings) {
            const openeningParenthesisPos = funcString.indexOf('(');
            const closingParenthesisPos = funcString.indexOf(')');
            const funcName = funcString.substring(0, openeningParenthesisPos);
            const paramsStr = funcString.substring(openeningParenthesisPos + 1, closingParenthesisPos);

            if (variableFunctions[funcName]) {
                passingValue = await variableFunctions[funcName].run(context, passingValue, paramsStr);
            } else {
                throw new ValidationError({
                    target: {
                        msg: Errors.INVALID_VARIABLE_FUNCTION,
                        vars: {functionName: funcName}
                    }
                });
            }
        }

        return passingValue;
    };

    return {
        processVariableString
    };
}
