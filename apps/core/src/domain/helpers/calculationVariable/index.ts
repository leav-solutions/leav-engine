// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {ActionsListValueType, IActionsListContext} from '_types/actionsList';
import {IValue} from '_types/value';
import {IVariableFunctions} from '../calculationsVariableFunctions';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';

interface IDeps {
    'core.domain.helpers.calculationsVariableFunctions'?: IVariableFunctions;
}
export interface IVariableValue {
    recordId: string;
    library: string;
    value: IValue | string | number | boolean;
}

export interface ICalculationVariable {
    processVariableString: (IActionsListContext, string, ActionsListValueType) => Promise<IVariableValue[]>;
}
export default function ({'core.domain.helpers.calculationsVariableFunctions': variableFunctions = null}: IDeps = {}) {
    const processVariableString = async (
        context: IActionsListContext,
        variableString: string,
        initialValue: ActionsListValueType
    ): Promise<IVariableValue[]> => {
        let passingValue = [
            {
                recordId: context.recordId,
                library: context.library,
                value: initialValue
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
