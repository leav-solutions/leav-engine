import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../../_types/actionsList';
import * as moment from 'moment';

export default function(): IActionsListFunction {
    return {
        name: 'formatDate',
        description: 'Convert timestamp to a date',
        inputTypes: [ActionsListIOTypes.NUMBER],
        outputTypes: [ActionsListIOTypes.STRING],
        params: [
            {
                name: 'format',
                type: 'string',
                description: 'Date format. Available format: https://momentjs.com/docs/#/displaying/format/'
            }
        ],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            const format = params.format || '';
            const numberVal = Number(value);

            return !isNaN(numberVal) ? moment.unix(numberVal).format(format) : '';
        }
    };
}
