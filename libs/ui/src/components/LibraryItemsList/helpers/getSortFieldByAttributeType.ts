// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeType} from '_ui/_gqlTypes';
import {infosCol} from '../constants';

export const getSortFieldByAttributeType = (attributeId: string, type: AttributeType) => {
    attributeId = infosCol === attributeId ? 'id' : attributeId;

    switch (type) {
        case AttributeType.tree:
        case AttributeType.simple_link:
            const subFieldByDefault = 'id';
            return `${attributeId}.${subFieldByDefault}`;
        case AttributeType.advanced_link:
        default:
            return attributeId;
    }
};
