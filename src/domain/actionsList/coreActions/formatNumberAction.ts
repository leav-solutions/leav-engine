import {flow, partialRight} from 'lodash';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../../_types/actionsList';

export default function(): IActionsListFunction {
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
        name: 'formatNumber',
        description: 'Format a number',
        input_types: [ActionsListIOTypes.NUMBER],
        output_types: [ActionsListIOTypes.STRING],
        params: [
            {
                name: 'decimals',
                type: 'number',
                description: 'Number of decimals'
            },
            {
                name: 'thousandsSeparator',
                type: 'string',
                description: 'Thousands separator'
            },
            {
                name: 'decimalSeparator',
                type: 'string',
                description: 'Decimals separator'
            },
            {
                name: 'prefix',
                type: 'string',
                description: 'Number prefix'
            },
            {
                name: 'suffix',
                type: 'string',
                description: 'Number suffix'
            }
        ],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): string => {
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

            return isNaN(Number(value))
                ? ''
                : flow(
                      partialRight(_toString, userParams.decimals),
                      partialRight(_formatSeparators, userParams.thousandsSeparator, userParams.decimalsSeparator),
                      partialRight(_addPrefix, userParams.prefix),
                      partialRight(_addSuffix, userParams.suffix)
                  )(Number(value));
        }
    };
}
