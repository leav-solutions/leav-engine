// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getAttributeFromKey, localizedTranslation} from 'utils';
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {IAttribute, IField, ILang, IParentAttributeData} from '_types/types';

export default (
    fieldKey: string,
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list,
    attributes: IAttribute[],
    lang: ILang
): IField => {
    let parentAttributeData: IParentAttributeData | undefined;
    const splitKey = fieldKey.split('.');
    const attribute = getAttributeFromKey(fieldKey, library.id, attributes);
    let recordLibrary = null;

    // For attributes through tree attribute, key is [parent attribute].[record library].[attribute]
    if (splitKey.length === 3) {
        const parentAttributeId = splitKey[0];
        const parentAttribute = attributes.find(att => parentAttributeId === att.id && library.id === att.library);

        if (parentAttribute) {
            parentAttributeData = {
                id: parentAttribute.id,
                type: parentAttribute.type
            };

            recordLibrary = splitKey[1];
        }
    }

    if (!attribute) {
        return null;
    }

    const label = typeof attribute.label === 'string' ? attribute.label : localizedTranslation(attribute.label, lang);

    const field: IField = {
        key: fieldKey,
        id: attribute.id,
        library: attribute.library,
        label,
        format: attribute.format,
        type: attribute.type,
        multipleValues: attribute.isMultiple,
        parentAttributeData,
        recordLibrary
    };

    return field;
};
