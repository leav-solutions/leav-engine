// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISelectedAttribute} from '_ui/types/attributes';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';

export const getFieldsKeyFromAttribute = (attribute: ISelectedAttribute) => {
    if (attribute?.format === AttributeFormat.extended && attribute.path) {
        return `${attribute.path}`;
    } else if (attribute.parentAttributeData) {
        return attribute.parentAttributeData.type === AttributeType.tree
            ? `${attribute.parentAttributeData.id}.${attribute.library}.${attribute.id}`
            : `${attribute.parentAttributeData.id}.${attribute.id}`;
    }

    return `${attribute.id}`;
};
