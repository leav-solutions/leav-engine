// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TypeGuards} from './typeGuards';
import {LinkCellValues, SimpleCellValues, TreeCellValues} from './types';

const _getInheritedValues = (values: SimpleCellValues | LinkCellValues | TreeCellValues) => {
    if (TypeGuards.isSimpleCellValues(values)) {
        return values.filter(value => value?.isInherited);
    }

    if (TypeGuards.isLinkCellValues(values)) {
        return values.filter(value => value?.isInherited);
    }

    if (TypeGuards.isTreeCellValues(values)) {
        return values.filter(value => value?.isInherited);
    }

    return [];
};

const _getNotInheritedOrOverrideValues = (values: SimpleCellValues | LinkCellValues | TreeCellValues) => {
    if (TypeGuards.isSimpleCellValues(values)) {
        return values.filter(value => value && !value.isInherited && value.value !== null);
    }

    if (TypeGuards.isLinkCellValues(values)) {
        return values.filter(value => value && !value.isInherited && value.linkValue !== null);
    }

    if (TypeGuards.isTreeCellValues(values)) {
        return values.filter(value => value && !value.isInherited && value.treeValue !== null);
    }

    return [];
};

export const getValuesToDisplayInCell = (
    values: SimpleCellValues | LinkCellValues | TreeCellValues
): SimpleCellValues | LinkCellValues | TreeCellValues => {
    const notInheritedOrOverrideValues = _getNotInheritedOrOverrideValues(values);

    if (notInheritedOrOverrideValues.length > 0) {
        return notInheritedOrOverrideValues;
    }

    const inheritedValues = _getInheritedValues(values);

    if (inheritedValues.length > 0) {
        return inheritedValues;
    }

    return [];
};
