// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type ILinkValue,
    type ISaveLinkValue,
    type ISaveStandardValue,
    type ISaveTreeValue,
    type ISaveValue,
    type IStandardBaseValue,
    type ITreeValue,
    type IValue,
} from '../../../_types/value';
import {AttributeTypes, type IAttribute} from '../../../_types/attribute';
import isEqual from 'lodash/isEqual';

export default (attribute: IAttribute, value: IValue, saveValue: ISaveValue): boolean => {
    const isValueMetadataEmpty = !value.metadata || Object.keys(value.metadata).length === 0;
    const isSaveValueMetadataEmpty = !saveValue.metadata || Object.keys(saveValue.metadata).length === 0;

    let isValueIdentical: boolean;
    if (attribute.type === AttributeTypes.SIMPLE || attribute.type === AttributeTypes.ADVANCED) {
        isValueIdentical = (value as IStandardBaseValue).payload === (saveValue as ISaveStandardValue).payload;
    } else if (attribute.type === AttributeTypes.SIMPLE_LINK || attribute.type === AttributeTypes.ADVANCED_LINK) {
        isValueIdentical = (value as ILinkValue).payload?.id === (saveValue as ISaveLinkValue).payload;
    } else if (attribute.type === AttributeTypes.TREE) {
        isValueIdentical = (value as ITreeValue).payload?.id === (saveValue as ISaveTreeValue).payload;
    }

    const isMetadataIdentical =
        (isValueMetadataEmpty && isSaveValueMetadataEmpty) || isEqual(value?.metadata, saveValue?.metadata);

    return isValueIdentical && isMetadataIdentical;
};
