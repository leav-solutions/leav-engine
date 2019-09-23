import gql from 'graphql-tag';
import {GET_LIBRARIES_libraries_list, GET_LIBRARIES_libraries_list_attributes} from '../../_gqlTypes/GET_LIBRARIES';
import {AttributeType} from '../../_gqlTypes/globalTypes';
import {recordIdentityFragment} from './recordIdentityFragment';

const _getAttributeValueQuery = (attribute: GET_LIBRARIES_libraries_list_attributes) => {
    const fieldName = attribute.id;

    if (attribute.id === 'id') {
        return fieldName;
    }

    let subfieldsQuery;
    switch (attribute.type) {
        case AttributeType.simple:
        case AttributeType.advanced:
            subfieldsQuery = `
                value
                id_value
            `;
            break;
        case AttributeType.simple_link:
        case AttributeType.advanced_link:
            subfieldsQuery = `
                id_value
                value {
                    ...RecordIdentity
                }
            `;
            break;
        case AttributeType.tree:
            subfieldsQuery = `
                id_value
                value {
                    record {
                        ...RecordIdentity
                    }
                    ancestors {
                        record {
                            ...RecordIdentity
                        }
                    }
                }
            `;
            break;
    }

    const fullQuery = `${fieldName} { ${subfieldsQuery} }`;
    return fullQuery;
};

export function getRecordDataQuery(
    library: GET_LIBRARIES_libraries_list,
    attributes: GET_LIBRARIES_libraries_list_attributes[]
) {
    return gql`
        ${recordIdentityFragment}
        query ${`RECORD_DATA_${library.id}`}($id: String!, $version: [ValueVersionInput], $lang: [AvailableLanguage!]) {
            record: ${library.gqlNames.query}(filters: {field: id, value: $id}, version: $version) {
                list {
                    id
                    ...RecordIdentity
                    ${attributes.map(_getAttributeValueQuery)}
                }
            }
        }
    `;
}
