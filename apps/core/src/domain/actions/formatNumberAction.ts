// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {flow, partialRight} from 'lodash';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction<{
    decimals: true;
    thousandsSeparator: false;
    decimalsSeparator: false;
    prefix: false;
    suffix: false;
}> {
    const _toString = (num: number, d: number): string =>
        num.toLocaleString('en', {
            minimumFractionDigits: d,
            maximumFractionDigits: d
        });

    const _formatSeparators = (num: string, thousSep: string, decSep: string): string => {
        const newSeps = {',': thousSep, '.': decSep};
        return num.replace(/[,.]/g, m => newSeps[m]);
    };

    const _addPrefix = (n: string, prefix: string): string => '' + prefix + n;
    const _addSuffix = (n: string, suffix: string): string => '' + n + suffix;

    return {
        id: 'formatNumber',
        name: 'Format Number',
        description: 'Format a number',
        input_types: [ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
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

            const computedValues = values.map(elementValue => {
                if (elementValue.payload === null) {
                    return elementValue;
                }
                elementValue.payload = isNaN(Number(elementValue.payload))
                    ? ''
                    : flow(
                          partialRight(_toString, userParams.decimals),
                          partialRight(_formatSeparators, userParams.thousandsSeparator, userParams.decimalsSeparator),
                          partialRight(_addPrefix, userParams.prefix),
                          partialRight(_addSuffix, userParams.suffix)
                      )(Number(elementValue.payload));
                return elementValue;
            });

            return {values: computedValues, errors: []};
        }
    };
}
