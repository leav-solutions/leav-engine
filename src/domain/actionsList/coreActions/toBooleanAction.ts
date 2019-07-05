import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        name: 'toBoolean',
        description: 'Convert value to boolean',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        output_types: [ActionsListIOTypes.BOOLEAN],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): boolean => {
            return value === 'true' ? true : value === 'false' ? false : !!value;
        }
    };
}
