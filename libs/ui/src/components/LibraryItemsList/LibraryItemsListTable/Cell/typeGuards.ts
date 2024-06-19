// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LinkCellValue, LinkCellValues, SimpleCellValue, SimpleCellValues, TreeCellValue, TreeCellValues} from './types';

export const TypeGuards = {
    isSimpleCellValues: (values: SimpleCellValues | LinkCellValues | TreeCellValues): values is SimpleCellValues =>
        values.length > 0 && 'value' in values[0],
    isLinkCellValue: (value: SimpleCellValue | LinkCellValue | TreeCellValue): value is LinkCellValue =>
        'linkValue' in value,
    isLinkCellValues: (values: SimpleCellValues | LinkCellValues | TreeCellValues): values is LinkCellValues =>
        values.length > 0 && TypeGuards.isLinkCellValue(values[0]),
    isTreeCellValue: (value: SimpleCellValue | LinkCellValue | TreeCellValue): value is TreeCellValue =>
        'treeValue' in value,
    isTreeCellValues: (values: SimpleCellValues | LinkCellValues | TreeCellValues): values is TreeCellValues =>
        values.length > 0 && TypeGuards.isTreeCellValue(values[0])
};
