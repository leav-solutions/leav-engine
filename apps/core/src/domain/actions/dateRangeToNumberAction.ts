import {type IDateRangeValue} from '../../_types/value';
import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'dateRangeToNumber',
        name: 'dateRangeToNumber',
        description: 'Convert date range dates to numbers',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.OBJECT],
        compute: false,
        action: values => ({
            values: values.map(valueElement => {
                const dateRangeValue = valueElement.payload as IDateRangeValue<string>;
                return {
                    ...valueElement,
                    payload: {from: Number(dateRangeValue?.from ?? ''), to: Number(dateRangeValue?.to ?? '')},
                };
            }),
            errors: [],
        }),
    };
}
