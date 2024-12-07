// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';

interface IInheritedNotOverride {
    isInheritedValue: true;
    isInheritedOverrideValue: false;
    isInheritedNotOverrideValue: true;
    inheritedValue: RecordFormElementsValueStandardValue;
}

interface IInheritedOverride {
    isInheritedValue: true;
    isInheritedOverrideValue: true;
    isInheritedNotOverrideValue: false;
    inheritedValue: RecordFormElementsValueStandardValue;
}

interface INotInherited {
    isInheritedValue: false;
    isInheritedOverrideValue: false;
    isInheritedNotOverrideValue: false;
    inheritedValue: null;
}

export type InheritedFlags = INotInherited | IInheritedOverride | IInheritedNotOverride;

export const computeInheritedFlags = (fieldValues: RecordFormElementsValueStandardValue[]): InheritedFlags => {
    const inheritedValue = fieldValues.find(fieldValue => fieldValue.isInherited);
    const overrideValue = fieldValues.find(fieldValue => !fieldValue.isInherited && !fieldValue.isCalculated);

    if (inheritedValue === undefined) {
        return {
            inheritedValue: null,
            isInheritedValue: false,
            isInheritedOverrideValue: false,
            isInheritedNotOverrideValue: false
        };
    }

    const isInheritedValue = true;

    if (!overrideValue || overrideValue.payload === null) {
        return {
            inheritedValue,
            isInheritedValue,
            isInheritedNotOverrideValue: true,
            isInheritedOverrideValue: false
        };
    }

    return {
        inheritedValue,
        isInheritedValue,
        isInheritedNotOverrideValue: false,
        isInheritedOverrideValue: true
    };
};

interface ICalculatedNotOverride {
    isCalculatedValue: true;
    isCalculatedOverrideValue: false;
    isCalculatedNotOverrideValue: true;
    calculatedValue: RecordFormElementsValueStandardValue;
}

interface ICalculatedOverride {
    isCalculatedValue: true;
    isCalculatedOverrideValue: true;
    isCalculatedNotOverrideValue: false;
    calculatedValue: RecordFormElementsValueStandardValue;
}

interface INotCalculated {
    isCalculatedValue: false;
    isCalculatedOverrideValue: false;
    isCalculatedNotOverrideValue: false;
    calculatedValue: null;
}

export type CalculatedFlags = INotCalculated | ICalculatedOverride | ICalculatedNotOverride;

export const computeCalculatedFlags = (fieldValues: RecordFormElementsValueStandardValue[]): CalculatedFlags => {
    const calculatedValue = fieldValues.find(fieldValue => fieldValue.isCalculated);
    const overrideValue = fieldValues.find(fieldValue => !fieldValue.isCalculated && !fieldValue.isInherited);

    if (calculatedValue === undefined) {
        return {
            calculatedValue: null,
            isCalculatedValue: false,
            isCalculatedOverrideValue: false,
            isCalculatedNotOverrideValue: false
        };
    }

    const isCalculatedValue = true;

    if (!overrideValue || overrideValue.payload === null) {
        return {
            calculatedValue,
            isCalculatedValue,
            isCalculatedNotOverrideValue: true,
            isCalculatedOverrideValue: false
        };
    }

    return {
        calculatedValue,
        isCalculatedValue,
        isCalculatedNotOverrideValue: false,
        isCalculatedOverrideValue: true
    };
};
