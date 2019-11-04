import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        name: 'parseJSON',
        description: 'Parse a JSON string',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.OBJECT],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            return JSON.parse('' + value);
        }
    };
}
