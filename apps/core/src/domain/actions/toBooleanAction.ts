// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        id: 'toBoolean',
        name: 'To Boolean',
        description: 'Convert value to boolean',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        output_types: [ActionsListIOTypes.BOOLEAN],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): boolean => {
            return value === 'true' ? true : value === 'false' ? false : !!value;
        }
    };
}
