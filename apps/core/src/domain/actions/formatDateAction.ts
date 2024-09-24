// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {ActionsListIOTypes, IActionsListFunction, IActionsListFunctionResult} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';

const defaultValueLocalizedParam = `{
  "weekday": "long",
  "month": "long",
  "day": "numeric",
  "year": "numeric"
}`;

export default function (): IActionsListFunction<{localized: false; universal: false}> {
    return {
        id: 'formatDate',
        name: 'Format Date',
        description: 'Convert timestamp to a date',
        input_types: [ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
        params: [
            {
                name: 'localized',
                type: 'string',
                description:
                    'Adapt format to current language. Available options: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString#options.',
                required: false,
                default_value: defaultValueLocalizedParam
            },
            {
                name: 'universal',
                type: 'string',
                description:
                    'Date format for every languages. If "localized" parameter is defined, this parameter is ignored. Available formats: https://momentjs.com/docs/#/displaying/format/.',
                required: false,
                default_value: 'DD/MM/YYYY HH:mm:ss'
            }
        ],
        action: (values, {localized, universal}, {lang}) => {
            const errors: IActionsListFunctionResult['errors'] = [];

            const formattedValues = values.map(elementValue => {
                if ('raw_value' in elementValue) {
                    elementValue.payload = elementValue.raw_value;
                }
                if (elementValue.payload === null) {
                    return elementValue;
                }
                const numberVal = Number(elementValue.payload);

                if (isNaN(numberVal)) {
                    elementValue.payload = '';
                    return elementValue;
                }

                if ((localized === null || localized === undefined) && universal) {
                    elementValue.payload = moment.unix(numberVal).format(universal); // TODO: replace moment by dayjs
                    return elementValue;
                }

                let options: Intl.DateTimeFormatOptions = {};
                try {
                    options = JSON.parse(localized ?? {});
                } catch (e) {
                    // TODO: rise error to inform user without break app
                    errors.push({
                        errorType: Errors.FORMAT_ERROR,
                        attributeValue: {payload: localized},
                        message:
                            'Params "localized" of FormatDateAction are invalid JSON. Use `{}` empty option instead.'
                    });
                }

                elementValue.payload = new Date(numberVal * 1_000).toLocaleString(lang, options);
                return elementValue;
            });

            return {values: formattedValues, errors: []};
        }
    };
}
