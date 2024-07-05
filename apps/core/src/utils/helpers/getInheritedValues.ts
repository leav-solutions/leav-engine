// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValue} from '_types/value';

const _getInheritedValues = (values: IValue[]) => values.filter(value => value && value.isInherited);

const _getNotInheritedOrOverrideValues = (values: IValue[]) =>
    values.filter(value => value && !value.isInherited && value.value !== null);

export const getInheritedValues = (values: IValue[]): IValue[] => {
    const notInheritedOrOverrideValues = _getNotInheritedOrOverrideValues(values);

    if (notInheritedOrOverrideValues.length > 0) {
        return notInheritedOrOverrideValues;
    }

    const inheritedValues = _getInheritedValues(values);

    if (inheritedValues.length > 0) {
        return inheritedValues;
    }

    return values;
};
