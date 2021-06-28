// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toJSON',
        name: 'To JSON',
        description: 'Convert value to a JSON string',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            if (value === null) {
                return null;
            }

            return JSON.stringify(value);
        }
    };
}
