// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {IDateRangeValue} from '_types/value';
import {ActionsListIOTypes, ActionsListValueType, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'formatDateRange',
        name: 'Format Date Range',
        description: 'Convert range timestamps to a date',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.OBJECT],
        params: [
            {
                name: 'format',
                type: 'string',
                description: 'Date format. Available format: https://momentjs.com/docs/#/displaying/format/',
                required: true,
                default_value: 'DD/MM/YYYY HH:mm:ss'
            }
        ],
        action: (value: ActionsListValueType, params: any): IDateRangeValue<string> => {
            const dateRangeValue = value as IDateRangeValue<number>;
            if (value === null || !dateRangeValue.from || !dateRangeValue.to) {
                return null;
            }

            const format = params.format || '';

            const numberValFrom = dateRangeValue.from;
            const numberValTo = dateRangeValue.to;

            return {
                from: !isNaN(numberValFrom) ? moment.unix(numberValFrom).format(format) : '',
                to: !isNaN(numberValTo) ? moment.unix(numberValTo).format(format) : ''
            };
        }
    };
}
