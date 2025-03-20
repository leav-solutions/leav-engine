// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValue, EmptyValue} from '_types/value';
import {EMPTY_VALUE} from '../../../infra/value/valueRepo';

export default (value: IValue): value is IValue & {payload: EmptyValue} =>
    typeof value.payload === 'string' && value.payload.toLowerCase() === EMPTY_VALUE;
