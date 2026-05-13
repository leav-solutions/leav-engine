import {type IValue, type EmptyValue} from '../../../_types/value';
import {EMPTY_VALUE} from '../../../infra/value/valueRepo';

export default (value: IValue): value is IValue & {payload: EmptyValue} =>
    typeof value.payload === 'string' && value.payload.toLowerCase() === EMPTY_VALUE;
