// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from '../../utils';

export const getAttributesEmbeddedFieldsQuery = (depth: number) => {
    const query = gqlUnchecked`
        query GET_EMBEDDED_FIELDS_QUERY($attId: ID!) {
            attributes(filters: {id: $attId}) {
                list {
                    id
                    label
                    format
                    ... on StandardAttribute {
                        ${_getEmbeddedFields(depth)}
                    }
                }
            }
        }
    `;
    return query;
};

const _getEmbeddedFields = (level: number) => {
    const depth = level - 1;
    return `
        embedded_fields {
            validation_regex
            id
            format
            label
            ${level > 0 ? _getEmbeddedFields(depth) : ''}
        }
    `;
};

/**
 * Generate a query with [depth] nested embedded_fields
 * for the attribute given
 *
 * @param depth
 */
export const generateEmbeddedFields = (depth: number) => {
    const query = `
        mutation GENERATE_EMBEDDED_FIELDS_QUERY($attId: ID!) {
            saveAttribute(attribute: {id: $attId, ${_createEmbeddedFields(depth)}
            }) {
                id
            }
        }`;

    return gqlUnchecked`
        ${query}
    `;
};

const _createEmbeddedFields = (level: number) => {
    const depth = level - 1;
    return `
        embedded_fields: [
            {
                id: "field_1_${level}"
                format: text,
                label: {
                    fr: "Champ 1 - ${level}"
                    en: "Field 1 - ${level}"
                }
            },
            {
                id: "field_2_${level}"
                format: extended,
                label: {
                    fr: "Champ 2 - ${level}"
                    en: "Field 2 - ${level}"
                }
                ${level > 0 ? _createEmbeddedFields(depth) : ''}
            },
            {
                id: "field_3_${level}"
                format: extended,
                label: {
                    fr: "Champ 3 - ${level}"
                    en: "Field 3 - ${level}"
                }
            }
        ]
    `;
};
