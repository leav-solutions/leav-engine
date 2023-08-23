// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'formatDate',
        name: 'Format Date',
        description: 'Convert timestamp to a date',
        input_types: [ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
        params: [
            {
                name: 'auto',
                type: 'boolean',
                description: 'Adapt format to current language',
                required: true,
                default_value: 'false'
            },
            {
                name: 'format',
                type: 'string',
                description: 'Date format. Available format: https://momentjs.com/docs/#/displaying/format/',
                required: false,
                default_value: 'DD/MM/YYYY HH:mm:ss'
            }
        ],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
            if (value === null) {
                return null;
            }

            const format = params.format;
            const auto = params.auto === 'true';
            const numberVal = Number(value);

            let newValue = '';

            if (!isNaN(numberVal)) {
                newValue = auto
                    ? new Date(numberVal * 1000).toLocaleString(ctx.lang)
                    : moment.unix(numberVal).format(format);
            }

            return newValue;
        }
    };
}
