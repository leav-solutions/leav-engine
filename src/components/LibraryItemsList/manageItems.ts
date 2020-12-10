// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGetRecordsFromLibraryQueryElement} from '../../queries/records/getRecordsFromLibraryQueryTypes';
import {AttributeType, IItemsColumn} from '../../_types/types';
import {getItemKeyFromColumn, localizedLabel} from './../../utils/utils';

interface IManageItemsProps {
    items: IGetRecordsFromLibraryQueryElement[];
    lang: any;
    columns: IItemsColumn[];
}

export const manageItems = ({items, lang, columns}: IManageItemsProps) => {
    const resultItems = items.map(item => {
        return {
            ...{
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
            ...columns.reduce(
                (acc, col) => {
                    const key: string = getItemKeyFromColumn(col);

                    if (col?.originAttributeData && item[col.originAttributeData.id]) {
                        if (col.originAttributeData.type === AttributeType.tree) {
                            // linked tree
                            let value = item[col.originAttributeData.id].map(tree => tree.record[col.id]);

                            if (Array.isArray(value)) {
                                value = value.shift();
                            }

                            acc[key] = value;
                        } else {
                            // linked attribute
                            acc[key] = item[col.originAttributeData.id][col.id];
                        }
                    } else if (item.whoAmI.library.id === col.library && item[col.id]) {
                        // basic case
                        acc[key] = item[col.id];
                    }
                    return acc;
                },
                {
                    infos: item.whoAmI
                }
            )
        };
    });

    return resultItems;
};
