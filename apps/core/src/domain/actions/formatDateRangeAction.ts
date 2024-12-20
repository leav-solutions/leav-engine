// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment';
import {IDateRangeValue} from '_types/value';
import {ActionsListIOTypes, IActionsListFunction, IActionsListFunctionResult} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';
import cloneDeep from 'lodash/cloneDeep';
import {TypeGuards} from '../../utils/typeGuards';

const defaultValueLocalizedParam = `{
  "weekday": "long",
  "month": "long",
  "day": "numeric",
  "year": "numeric"
}`;

export default function (): IActionsListFunction<{localized: false; universal: false}> {
    return {
        id: 'formatDateRange',
        name: 'Format Date Range',
        description: 'Convert range timestamps to a range dates',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.OBJECT],
        compute: false,
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

            const formattedValues = cloneDeep(values).map(elementValue => {
                if (!TypeGuards.isIStandardValue(elementValue)) {
                    errors.push({
                        errorType: Errors.INVALID_VALUES,
                        attributeValue: elementValue,
                        message: 'Non standard value received in formatDateRange.'
                    });
                    return elementValue;
                }
                const dateRangeValue = elementValue.raw_payload as IDateRangeValue<number>;

                if (dateRangeValue === null || !dateRangeValue.from || !dateRangeValue.to) {
                    return {...dateRangeValue, payload: null};
                }

                const {from: numberValFrom, to: numberValTo} = dateRangeValue;

                if (isNaN(Number(numberValFrom)) || isNaN(Number(numberValTo))) {
                    return {...dateRangeValue, payload: ['', '']};
                }

                if ((localized === null || localized === undefined) && universal) {
                    return {
                        ...dateRangeValue,
                        payload: {
                            from: moment.unix(numberValFrom).format(universal),
                            to: moment.unix(numberValTo).format(universal)
                        }
                    };
                }

                let options: Intl.DateTimeFormatOptions = {};
                try {
                    options = JSON.parse(localized ?? '{}');
                } catch (e) {
                    errors.push({
                        errorType: Errors.FORMAT_ERROR,
                        attributeValue: {payload: localized},
                        message:
                            'Params "localized" of FormatDateAction are invalid JSON. Use `{}` empty option instead.'
                    });
                }

                elementValue.payload = {
                    from: new Date(numberValFrom * 1_000).toLocaleString(lang, options),
                    to: new Date(numberValTo * 1_000).toLocaleString(lang, options)
                };
                return elementValue;
            });

            return {values: formattedValues, errors};
        }
    };
}
