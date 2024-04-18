// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {flow, partialRight} from 'lodash';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    const _toString = (num, d) =>
        num.toLocaleString('en', {
            minimumFractionDigits: d,
            maximumFractionDigits: d
        });

    const _formatSeparators = (num, thousSep, decSep) => {
        const newSeps = {',': thousSep, '.': decSep};
        return num.replace(/[,.]/g, m => newSeps[m]);
    };

    const _addPrefix = (n, prefix) => '' + prefix + n;
    const _addSuffix = (n, suffix) => '' + n + suffix;

    return {
        id: 'formatNumber',
        name: 'Format Number',
        description: 'Format a number',
        input_types: [ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
        params: [
            {
                name: 'decimals',
                type: 'number',
                description: 'Number of decimals',
                required: true,
                default_value: '2'
            },
            {
                name: 'thousandsSeparator',
                type: 'string',
                description: 'Thousands separator',
                required: false,
                default_value: ' '
            },
            {
                name: 'decimalsSeparator',
                type: 'string',
                description: 'Decimals separator',
                required: false,
                default_value: ','
            },
            {
                name: 'prefix',
                type: 'string',
                description: 'Number prefix',
                required: false,
                default_value: ''
            },
            {
                name: 'suffix',
                type: 'string',
                description: 'Number suffix',
                required: false,
                default_value: ''
            }
        ],
        action: (values, params) => {
            const defaultParams = {
                decimals: 2,
                thousandsSeparator: ',',
                decimalsSeparator: '.',
                prefix: '',
                suffix: ''
            };

            const userParams = {
                ...defaultParams,
                ...params
            };

            const computedValues = values.map((value) => {
                if (value.value === null) {
                    return value;
                }
                value.value = isNaN(Number(value.value))
                ? ''
                : flow(
                      partialRight(_toString, userParams.decimals),
                      partialRight(_formatSeparators, userParams.thousandsSeparator, userParams.decimalsSeparator),
                      partialRight(_addPrefix, userParams.prefix),
                      partialRight(_addSuffix, userParams.suffix)
                  )(Number(value.value));
                return value;
            });


            return {values: computedValues, errors: []};
        }
    };
}
