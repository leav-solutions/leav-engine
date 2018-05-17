import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        name: 'toNumber',
        description: 'Convert value to number',
        inputTypes: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        outputTypes: [ActionsListIOTypes.NUMBER],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): number => {
            return Number(value);
        }
    };
}
