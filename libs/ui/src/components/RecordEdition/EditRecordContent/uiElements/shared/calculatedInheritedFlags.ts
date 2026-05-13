import {type RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';

interface IInheritedNotOverride {
    isInheritedValues: true;
    isInheritedOverrideValues: false;
    isInheritedNotOverrideValues: true;
    inheritedValues: RecordFormElementsValueStandardValue[];
}

interface IInheritedOverride {
    isInheritedValues: true;
    isInheritedOverrideValues: true;
    isInheritedNotOverrideValues: false;
    inheritedValues: RecordFormElementsValueStandardValue[];
}

interface INotInherited {
    isInheritedValues: false;
    isInheritedOverrideValues: false;
    isInheritedNotOverrideValues: false;
    inheritedValues: null;
}

export type InheritedFlags = INotInherited | IInheritedOverride | IInheritedNotOverride;

export const computeInheritedFlags = (fieldValues: RecordFormElementsValueStandardValue[]): InheritedFlags => {
    const inheritedValues = fieldValues.filter(fieldValue => fieldValue.isInherited);
    const overrideValues = fieldValues.filter(
        fieldValue => !fieldValue.isInherited && !fieldValue.isCalculated && fieldValue.payload !== null,
    );

    if (inheritedValues.length === 0) {
        return {
            inheritedValues: null,
            isInheritedValues: false,
            isInheritedOverrideValues: false,
            isInheritedNotOverrideValues: false,
        };
    }

    if (overrideValues.length === 0) {
        return {
            inheritedValues,
            isInheritedValues: true,
            isInheritedNotOverrideValues: true,
            isInheritedOverrideValues: false,
        };
    }

    return {
        inheritedValues,
        isInheritedValues: true,
        isInheritedNotOverrideValues: false,
        isInheritedOverrideValues: true,
    };
};

interface ICalculatedNotOverride {
    isCalculatedValues: true;
    isCalculatedOverrideValues: false;
    isCalculatedNotOverrideValues: true;
    calculatedValues: RecordFormElementsValueStandardValue[];
}

interface ICalculatedOverride {
    isCalculatedValues: true;
    isCalculatedOverrideValues: true;
    isCalculatedNotOverrideValues: false;
    calculatedValues: RecordFormElementsValueStandardValue[];
}

interface INotCalculated {
    isCalculatedValues: false;
    isCalculatedOverrideValues: false;
    isCalculatedNotOverrideValues: false;
    calculatedValues: null;
}

export type CalculatedFlags = INotCalculated | ICalculatedOverride | ICalculatedNotOverride;

export const computeCalculatedFlags = (fieldValues: RecordFormElementsValueStandardValue[]): CalculatedFlags => {
    const calculatedValues = fieldValues.filter(
        fieldValue => fieldValue.isCalculated !== null && fieldValue.isCalculated !== undefined,
    );
    const overrideValues = fieldValues.filter(
        fieldValue =>
            (fieldValue.isCalculated === null || fieldValue.isCalculated === undefined) &&
            (fieldValue.isInherited === null || fieldValue.isInherited === undefined) &&
            fieldValue.payload !== null,
    );

    if (calculatedValues.length === 0) {
        return {
            calculatedValues: null,
            isCalculatedValues: false,
            isCalculatedOverrideValues: false,
            isCalculatedNotOverrideValues: false,
        };
    }

    if (overrideValues.length === 0) {
        return {
            calculatedValues,
            isCalculatedValues: true,
            isCalculatedNotOverrideValues: true,
            isCalculatedOverrideValues: false,
        };
    }

    return {
        calculatedValues,
        isCalculatedValues: true,
        isCalculatedNotOverrideValues: false,
        isCalculatedOverrideValues: true,
    };
};
