import {ActionsListIOTypes, ActionsListValueType, IActionsListFunction} from '../../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        name: 'maskValue',
        description: 'Mask any value by replacing with dots or empty string if no value',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType): string => {
            return value !== null && value !== '' && (typeof value !== 'object' || Object.keys(value).length)
                ? '●●●●●●●'
                : '';
        }
    };
}
