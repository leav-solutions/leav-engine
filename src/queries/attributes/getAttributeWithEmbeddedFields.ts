import gql from 'graphql-tag';

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
    return gql`
        query GET_ATTRIBUTE_WITH_EMBEDDED_FIELDS($libId: ID!) {
            attributes(filters: {id: $libId}) {
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
