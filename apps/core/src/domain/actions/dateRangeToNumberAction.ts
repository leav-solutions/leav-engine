// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDateRangeValue} from '_types/value';
import {ActionsListIOTypes, ActionsListValueType, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'dateRangeToNumber',
        name: 'dateRangeToNumber',
        description: 'Convert date range dates to numbers',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.OBJECT],
        action: (value: ActionsListValueType): IDateRangeValue<number> => {
            const test = 1;

            const dateRangeValue = value as IDateRangeValue<string>;
            return {from: Number(dateRangeValue.from ?? ''), to: Number(dateRangeValue.to ?? '')};
        }
    };
}
