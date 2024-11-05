// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValue} from '_types/value';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';

export default (value: IValue, attributeProps: IAttribute): boolean =>
    !!(value.id_value && attributeProps.type !== AttributeTypes.SIMPLE);
