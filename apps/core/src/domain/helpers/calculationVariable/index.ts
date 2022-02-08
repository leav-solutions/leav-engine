// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {ActionsListValueType, IActionsListContext} from '_types/actionsList';
import {IValue} from '_types/value';
import {IVariableFunctions} from '../calculationsVariableFunctions';

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
        const functionsStrings = variableString.split('.');

        let passingValue = [
            {
                recordId: context.recordId,
                library: context.library,
                value: initialValue
            }
        ] as IVariableValue[];

        for (const funcString of functionsStrings) {
            const openeningParenthesisPos = funcString.indexOf('(');
            const closingParenthesisPos = funcString.indexOf(')');
            const funcName = funcString.substring(0, openeningParenthesisPos);
            const paramsStr = funcString.substring(openeningParenthesisPos + 1, closingParenthesisPos);

            if (variableFunctions[funcName]) {
                passingValue = await variableFunctions[funcName].run(context, passingValue, paramsStr);
            }
            // else : this function is unknown, we do nothing, as if it was not here
        }

        return passingValue;
    };

    return {
        processVariableString
    };
}
