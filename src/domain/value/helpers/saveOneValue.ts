import {IRecordRepo} from 'infra/record/recordRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import moment from 'moment';
import {IAttribute} from '../../../_types/attribute';
import {IValue} from '../../../_types/value';
import doesValueExist from './doesValueExist';

export default async (
    library: string,
    recordId: number,
    attributeProps: IAttribute,
    value: IValue,
    deps: {
        valueRepo: IValueRepo;
        recordRepo: IRecordRepo;
    }
): Promise<IValue> => {
    const valueExists = doesValueExist(value, attributeProps);

    const valueToSave = {
        ...value,
        modified_at: moment().unix()
    };

    if (!valueExists) {
        valueToSave.created_at = moment().unix();
    }

    const savedVal = valueExists
        ? await deps.valueRepo.updateValue(library, recordId, attributeProps, valueToSave)
        : await deps.valueRepo.createValue(library, recordId, attributeProps, valueToSave);

    return {...savedVal, attribute: attributeProps.id};
};
