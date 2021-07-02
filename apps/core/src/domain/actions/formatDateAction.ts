// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {ActionsListIOTypes, ActionsListValueType, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'formatDate',
        name: 'Format Date',
        description: 'Convert timestamp to a date',
        input_types: [ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
        params: [
            {
                name: 'format',
                type: 'string',
                description: 'Date format. Available format: https://momentjs.com/docs/#/displaying/format/',
                required: true,
                default_value: 'DD/MM/YYYY HH:mm:ss'
            }
        ],
        action: (value: ActionsListValueType, params: any): string => {
            if (value === null) {
                return null;
            }

            const format = params.format || '';
            const numberVal = Number(value);

            return !isNaN(numberVal) ? moment.unix(numberVal).format(format) : '';
        }
    };
}
