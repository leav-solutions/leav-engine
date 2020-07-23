import {IRecordRepo} from 'infra/record/recordRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import moment from 'moment';
import {IQueryInfos} from '_types/queryInfos';
import {IAttribute} from '../../../_types/attribute';
import {IValue} from '../../../_types/value';
import doesValueExist from './doesValueExist';

export default async (
    library: string,
    recordId: string,
    attribute: IAttribute,
    value: IValue,
    deps: {
        valueRepo: IValueRepo;
        recordRepo: IRecordRepo;
    },
    ctx: IQueryInfos
): Promise<IValue> => {
    const valueExists = doesValueExist(value, attribute);

    const valueToSave = {
        ...value,
        modified_at: moment().unix()
    };

    if (!valueExists) {
        valueToSave.created_at = moment().unix();
    }

    const savedVal = valueExists
        ? await deps.valueRepo.updateValue({library, recordId, attribute, value: valueToSave, ctx})
        : await deps.valueRepo.createValue({library, recordId, attribute, value: valueToSave, ctx});

    return {...savedVal, attribute: attribute.id};
};
