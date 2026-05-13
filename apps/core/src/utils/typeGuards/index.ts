import {type IVariableValue} from '../../domain/helpers/calculations/calculationVariable';
import {type IStandardValue, type IValue} from '../../_types/value';

export const TypeGuards = {
    isVariableIValue: (value: IVariableValue['payload']): value is IValue => typeof value === 'object',
    isIStandardValue: (value: IValue): value is IStandardValue => 'raw_payload' in value,
};
