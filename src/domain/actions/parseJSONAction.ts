import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        id: 'parseJSON',
        name: 'Parse JSON',
        description: 'Parse a JSON string',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.OBJECT],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            return JSON.parse('' + value);
        }
    };
}
