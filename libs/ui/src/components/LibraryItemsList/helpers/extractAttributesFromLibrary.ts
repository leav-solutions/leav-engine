// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isTypeLink} from '@leav/utils';
import {IAttribute} from '_ui/types/search';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {
    ILibraryDetailExtended,
    ILibraryDetailExtendedAttributeLink,
    ILibraryDetailExtendedAttributeStandard,
    ILibraryDetailExtendedAttributeTree
} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';

export default (library: ILibraryDetailExtended): IAttribute[] =>
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
                    isLink: isTypeLink(attribute.type),
                    isMultiple: attribute.multiple_values,
                    linkedLibrary: (attribute as ILibraryDetailExtendedAttributeLink).linked_library,
                    linkedTree: (attribute as ILibraryDetailExtendedAttributeTree).linked_tree,
                    library: library.id,
                    embedded_fields: (attribute as ILibraryDetailExtendedAttributeStandard).embedded_fields
                }
            ];

            // case attribute is a linked attribute
            if (
                (attribute.type === AttributeType.simple_link || attribute.type === AttributeType.advanced_link) &&
                (attribute as ILibraryDetailExtendedAttributeLink).linked_library
            ) {
                const linkedLibraryId = (attribute as ILibraryDetailExtendedAttributeLink).linked_library.id;
                const newLinkedAttributes: IAttribute[] = (attribute as ILibraryDetailExtendedAttributeLink).linked_library.attributes.map(
                    linkedAttribute => ({
                        id: linkedAttribute.id,
                        type: linkedAttribute.type,
                        format: linkedAttribute.format,
                        label: linkedAttribute.label,
                        isLink: isTypeLink(linkedAttribute.type),
                        isMultiple: linkedAttribute.multiple_values,
                        linkedLibrary: (attribute as ILibraryDetailExtendedAttributeLink).linked_library,
                        linkedTree: (attribute as ILibraryDetailExtendedAttributeTree).linked_tree,
                        library: linkedLibraryId
                    })
                );

                newAttributes.push(...newLinkedAttributes);
            }

            if (
                attribute.type === AttributeType.tree &&
                (attribute as ILibraryDetailExtendedAttributeTree).linked_tree
            ) {
                const newLinkedAttributes: IAttribute[] = (attribute as ILibraryDetailExtendedAttributeTree).linked_tree.libraries
                    .map(linkedTreeLibrary => {
                        const linkedLibraryId = linkedTreeLibrary.library.id;
                        return linkedTreeLibrary.library.attributes.map(linkedAttribute => ({
                            id: linkedAttribute.id,
                            type: linkedAttribute.type,
                            format: linkedAttribute.format,
                            label: linkedAttribute.label,
                            isLink: isTypeLink(linkedAttribute.type),
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
