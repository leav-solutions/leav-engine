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
        inputTypes: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        outputTypes: [ActionsListIOTypes.BOOLEAN],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): boolean => {
            return value === 'true' ? true : value === 'false' ? false : !!value;
        }
    };
}
