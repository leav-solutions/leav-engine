// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IVariableValue} from '../../domain/helpers/calculations/calculationVariable';
import {type IStandardValue, type IValue} from '../../_types/value';

export const TypeGuards = {
    isVariableIValue: (value: IVariableValue['payload']): value is IValue => typeof value === 'object',
    isIStandardValue: (value: IValue): value is IStandardValue => 'raw_payload' in value,
};
