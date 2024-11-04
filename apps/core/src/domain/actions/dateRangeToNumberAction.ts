// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
                const dateRangeValue = valueElement.payload as IDateRangeValue<string>;
                return {
                    ...valueElement,
                    payload: {from: Number(dateRangeValue.from ?? ''), to: Number(dateRangeValue.to ?? '')}
                };
            }),
            errors: []
        })
    };
}
