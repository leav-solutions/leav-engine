// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction<{auto: true; format: false}> {
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
                description:
                    'Date format. Available format: https://momentjs.com/docs/#/displaying/format/. If "auto" is flagged to true, this parameter is ignored.',
                required: false,
                default_value: 'DD/MM/YYYY HH:mm:ss'
            }
        ],
        action: (values, params, ctx) => {
            const format = params.format;
            const auto = params.auto === 'true';

            const computedValues = values.map(elementValue => {
                if (elementValue.value === null) {
                    return elementValue;
                }
                const numberVal = Number(elementValue.value);

                let newValue = '';

                if (!isNaN(numberVal)) {
                    newValue = auto
                        ? new Date(numberVal * 1_000).toLocaleString(ctx.lang)
                        : moment.unix(numberVal).format(format);
                }
                elementValue.value = newValue;
                return elementValue;
            });

            return {values: computedValues, errors: []};
        }
    };
}
