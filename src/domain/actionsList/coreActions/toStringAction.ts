import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        name: 'toString',
        description: 'Convert value to string',
        inputTypes: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        outputTypes: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            return '' + value;
        }
    };
}
