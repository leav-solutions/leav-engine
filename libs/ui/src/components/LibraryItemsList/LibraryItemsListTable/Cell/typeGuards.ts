// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    RecordFormElementsValueLinkValue,
    RecordFormElementsValueStandardValue,
    RecordFormElementsValueTreeValue
} from '_ui/hooks/useGetRecordForm';
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
        values.length > 0 && TypeGuards.isTreeCellValue(values[0]),
    isRecordFormElementsValueStandardValue: (
        value:
            | RecordFormElementsValueStandardValue
            | RecordFormElementsValueLinkValue
            | RecordFormElementsValueTreeValue
    ): value is RecordFormElementsValueStandardValue => value && 'value' in value,
    isRecordFormElementsValuesLinkValue: (
        value:
            | RecordFormElementsValueStandardValue
            | RecordFormElementsValueLinkValue
            | RecordFormElementsValueTreeValue
    ): value is RecordFormElementsValueLinkValue => value && 'linkValue' in value,
    isRecordFormElementsValuesTreeValue: (
        value:
            | RecordFormElementsValueStandardValue
            | RecordFormElementsValueLinkValue
            | RecordFormElementsValueTreeValue
    ): value is RecordFormElementsValueTreeValue => value && 'treeValue' in value
};
