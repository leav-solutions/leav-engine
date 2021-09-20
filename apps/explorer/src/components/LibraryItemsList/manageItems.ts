// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetRecordsFromLibraryQueryElement} from 'graphQL/queries/records/getRecordsFromLibraryQueryTypes';
import {isArray} from 'lodash';
import objectPath from 'object-path';
import {AttributeFormat, AttributeType, IField, IItem} from '../../_types/types';

const _extractValueFromParent = (field: IField, linkValue: any) => {
    const linkedElement = field.parentAttributeData.type === AttributeType.tree ? linkValue.record : linkValue;
    return linkedElement[field.id];
};

const manageFields = (fields: IField[], item: IGetRecordsFromLibraryQueryElement) => {
    return fields.reduce((acc, field) => {
        const key: string = field.key;

        if (field.format === AttributeFormat.extended) {
            const [attributeId, ...path] = key.split('.');

            try {
                // If we ask for the whole extended attribute, just return the json
                if (!path.length) {
                    acc[key] = item[attributeId];
                    return acc;
                }

                // If we ask for a specific field, parse json and return value
                const attributeExtendedContent = JSON.parse(item[attributeId]);
                if (attributeExtendedContent) {
                    acc[key] = objectPath.get(attributeExtendedContent, path);
                    return acc;
                }
            } catch (e) {
                console.error(e);

                acc[key] = 'error';
                return acc;
            }
        }

        switch (field.type) {
            case AttributeType.simple_link:
            case AttributeType.advanced_link:
                if (field?.parentAttributeData && item[field.parentAttributeData.id]) {
                    let value = item[field.parentAttributeData.id][field.id];

                    if (isArray(item[field.parentAttributeData.id])) {
                        value = item[field.parentAttributeData.id].map(tree => tree.record[field.id]);
                    }

                    if (Array.isArray(value)) {
                        value = value.shift();
                    }

                    acc[key] = value;
                } else {
                    acc[key] = item[field.id];
                }
                return acc;
            case AttributeType.tree:
                if (field?.parentAttributeData && item[field.parentAttributeData.id]) {
                    acc[key] = item[field.parentAttributeData.id][field.id];
                } else {
                    acc[key] = item[field.id];
                }

                return acc;
            case AttributeType.simple:
            case AttributeType.advanced:
            default:
                // Simple field, not via link or tree attribute
                if (!field?.parentAttributeData) {
                    acc[key] = item[field.id];
                    return acc;
                }

                // Attribute via link or tree, but no value
                if (!item[field.parentAttributeData.id]) {
                    acc[key] = null;
                    return acc;
                }

                // Parent attribute has multiple values, value is an array
                if (isArray(item[field.parentAttributeData.id])) {
                    acc[key] = item[field.parentAttributeData.id].map(linkValue => {
                        return _extractValueFromParent(field, linkValue);
                    });
                    return acc;
                }

                // Parent attribute has not multiple values, value is not an array
                const linkValue = item[field.parentAttributeData.id];
                acc[key] = _extractValueFromParent(field, linkValue);

                return acc;
        }
    }, {});
};

interface IManageItemsProps {
    items: IGetRecordsFromLibraryQueryElement[];
    fields: IField[];
}

/**
 * Convert search result to a list of items usable by LibraryItemsList
 */
export const manageItems = ({items, fields}: IManageItemsProps): IItem[] => {
    const resultItems: IItem[] = items.map((item, index) => {
        const itemFields = manageFields(fields, item);

        const resultItem: IItem = {
            index: index + 1,
            whoAmI: {...item.whoAmI},
            fields: itemFields
        };

        return resultItem;
    });

    return resultItems;
};
