// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {IDateRangeValue} from '_types/value';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction<{auto: true; format: false}> {
    return {
        id: 'formatDateRange',
        name: 'Format Date Range',
        description: 'Convert range timestamps to a range dates',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.OBJECT],
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
        action: (values, {auto, format}, {lang}) => {
            const computedValues = values.map(elementValue => {
                const dateRangeValue = elementValue.value as IDateRangeValue<number>;

                if (elementValue.value === null || !dateRangeValue.from || !dateRangeValue.to) {
                    return {value: null};
                }

                const numberValFrom = dateRangeValue.from;
                const numberValTo = dateRangeValue.to;

                elementValue.value = {
                    from: isNaN(numberValFrom)
                        ? ''
                        : auto === 'true'
                          ? new Date(numberValFrom * 1_000).toLocaleString(lang)
                          : moment.unix(numberValFrom).format(format ?? ''),
                    to: isNaN(numberValTo)
                        ? ''
                        : auto === 'true'
                          ? new Date(numberValTo * 1_000).toLocaleString(lang)
                          : moment.unix(numberValTo).format(format ?? '')
                };
                return elementValue;
            });

            return {values: computedValues, errors: []};
        }
    };
}
