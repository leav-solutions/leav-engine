// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isArray} from 'lodash';
import objectPath from 'object-path';
import {ISearchFullTextResult} from '../../queries/searchFullText/searchFullText';
import {AttributeFormat, AttributeType, IField, IItem} from '../../_types/types';
import {localizedLabel} from './../../utils/utils';

const manageFields = (fields: IField[], item: ISearchFullTextResult) => {
    return fields.reduce((acc, field) => {
        const key: string = field.key;

        if (field.format === AttributeFormat.extended) {
            const [, , attributeId, ...path] = key.split('.');

            let attributeExtendedContent: object;

            try {
                attributeExtendedContent = JSON.parse(item[attributeId]);
                if (attributeExtendedContent) {
                    const value = objectPath.get(attributeExtendedContent, path);
                    acc[key] = value;
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
                if (field?.parentAttributeData) {
                    if (item[field.parentAttributeData.id]) {
                        if (isArray(item[field.parentAttributeData.id])) {
                            acc[key] = item[field.parentAttributeData.id][0].record[field.id];
                        } else {
                            acc[key] = item[field.parentAttributeData.id][field.id];
                        }
                    }
                } else {
                    acc[key] = item[field.id];
                }
                return acc;
        }
    }, {});
};

interface IManageItemsProps {
    items: ISearchFullTextResult[];
    lang: any;
    fields: IField[];
}

export const manageItems = ({items, lang, fields}: IManageItemsProps): IItem[] => {
    const resultItems: IItem[] = items.map((item, index) => {
        const itemFields = manageFields(fields, item);

        const resultItem: IItem = {
            index: index + 1,
            whoAmI: {
                id: item.whoAmI.id,
                label:
                    typeof item.whoAmI.label === 'string' ? item.whoAmI.label : localizedLabel(item.whoAmI.label, lang),
                color: item.whoAmI.color,
                preview: item.whoAmI.preview,
                library: {
                    id: item.whoAmI.library.id,
                    label: item.whoAmI.library.label
                }
            },
            fields: itemFields
        };

        return resultItem;
    });

    return resultItems;
};
