// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {checkTypeIsLink} from 'utils';
import {GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute} from '_gqlTypes/GET_ATTRIBUTES_BY_LIB';
import {
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute,
    GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute
} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {IAttribute} from '_types/types';

export default (library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list): IAttribute[] =>
    library.attributes.reduce((acc: IAttribute[], attribute) => {
        if (
            (attribute.format === null ||
                (attribute.format && Object.values(AttributeFormat).includes(attribute.format))) &&
            attribute.type &&
            Object.values(AttributeType).includes(attribute.type)
        ) {
            const newAttributes: IAttribute[] = [
                {
                    id: attribute.id,
                    type: attribute.type,
                    format: attribute.format,
                    label: attribute.label,
                    isLink: checkTypeIsLink(attribute.type),
                    isMultiple: attribute.multiple_values,
                    linkedLibrary: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                        .linked_library,
                    linkedTree: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute)
                        .linked_tree,
                    library: library.id,
                    embedded_fields: (attribute as GET_ATTRIBUTES_BY_LIB_attributes_list_StandardAttribute)
                        .embedded_fields
                }
            ];

            // case attribute is a linked attribute
            if (
                (attribute.type === AttributeType.simple_link || attribute.type === AttributeType.advanced_link) &&
                (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute).linked_library
            ) {
                const linkedLibraryId = (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                    .linked_library.id;
                const newLinkedAttributes: IAttribute[] = (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute).linked_library.attributes.map(
                    linkedAttribute => ({
                        id: linkedAttribute.id,
                        type: linkedAttribute.type,
                        format: linkedAttribute.format,
                        label: linkedAttribute.label,
                        isLink: checkTypeIsLink(linkedAttribute.type),
                        isMultiple: linkedAttribute.multiple_values,
                        linkedLibrary: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_LinkAttribute)
                            .linked_library,
                        linkedTree: (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute)
                            .linked_tree,
                        library: linkedLibraryId
                    })
                );

                newAttributes.push(...newLinkedAttributes);
            }

            if (
                attribute.type === AttributeType.tree &&
                (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute).linked_tree
            ) {
                const newLinkedAttributes: IAttribute[] = (attribute as GET_LIBRARY_DETAIL_EXTENDED_libraries_list_attributes_TreeAttribute).linked_tree.libraries
                    .map(linkedTreeLibrary => {
                        const linkedLibraryId = linkedTreeLibrary.library.id;
                        return linkedTreeLibrary.library.attributes.map(linkedAttribute => ({
                            id: linkedAttribute.id,
                            type: linkedAttribute.type,
                            format: linkedAttribute.format,
                            label: linkedAttribute.label,
                            isLink: checkTypeIsLink(linkedAttribute.type),
                            isMultiple: linkedAttribute.multiple_values,
                            library: linkedLibraryId
                        }));
                    })
                    .flat();

                newAttributes.push(...newLinkedAttributes);
            }

            return [...acc, ...newAttributes];
        }

        return acc;
    }, []);
