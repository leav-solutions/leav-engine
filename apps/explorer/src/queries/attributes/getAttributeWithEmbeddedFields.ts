// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';

const getEmbeddedFields = (depth = 0) => {
    return `
        embedded_fields {
            id
            format
            ${depth > 0 ? getEmbeddedFields(depth - 1) : ''}
        }
    `;
};

export const getAttributeWithEmbeddedFields = (depth: number) => {
    return gqlUnchecked`
        query GET_ATTRIBUTE_WITH_EMBEDDED_FIELDS($attributeId: ID!) {
            attributes(filters: {id: $attributeId}) {
                list {
                    id
                    format
                    label
                    ... on StandardAttribute {
                        ${getEmbeddedFields(depth)}
                    }
                }
            }
        }
    `;
};
