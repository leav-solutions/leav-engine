// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDateRangeValue} from '_types/value';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'dateRangeToNumber',
        name: 'dateRangeToNumber',
        description: 'Convert date range dates to numbers',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.OBJECT],
        action: values => ({
            values: values.map(valueElement => {
                const dateRangeValue = valueElement.value as IDateRangeValue<string>;
                return {
                    ...valueElement,
                    value: {from: Number(dateRangeValue.from ?? ''), to: Number(dateRangeValue.to ?? '')}
                };
            }),
            errors: []
        })
    };
}
