// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type WithTypename} from '@leav/utils';
import {AttributeType} from '_ui/_gqlTypes';
import {
    type RecordFormElementsValueTreeValue,
    type RecordFormElementAttribute,
    type RecordFormElementsValue,
    type RecordFormElementsValueLinkValue,
} from '_ui/hooks/useGetRecordForm';

export const hasTypename = <T>(value: any): value is WithTypename<T> => '__typename' in value;

export const isRecordFormElementsValueLinkValue = (
    value: RecordFormElementsValue,
    attribute: RecordFormElementAttribute,
): value is RecordFormElementsValueLinkValue =>
    attribute.type === AttributeType.simple_link ||
    (attribute.type === AttributeType.advanced_link && attribute.multiple_values === false);

export const isRecordFormElementsValueLinkValues = (
    values: RecordFormElementsValue[],
    attribute: RecordFormElementAttribute,
): values is RecordFormElementsValueLinkValue[] =>
    attribute.type === AttributeType.advanced_link && attribute.multiple_values === true;

export const isRecordFormElementsValuesTreeValue = (
    value: RecordFormElementsValue,
    attribute: RecordFormElementAttribute,
): value is RecordFormElementsValueTreeValue =>
    attribute.type === AttributeType.tree && attribute.multiple_values === false;

export const isRecordFormElementsValuesTreeValues = (
    values: RecordFormElementsValue[],
    attribute: RecordFormElementAttribute,
): values is RecordFormElementsValueTreeValue[] =>
    attribute.type === AttributeType.tree && attribute.multiple_values === true;
