import gql from 'graphql-tag';
import {GET_LIBRARIES_libraries_list, GET_LIBRARIES_libraries_list_attributes} from '../../_gqlTypes/GET_LIBRARIES';
import {valueDetailsFragment} from '../values/valueDetailsFragment';
import {recordIdentityFragment} from './recordIdentityFragment';

const _getAttributeValueQuery = (attribute: GET_LIBRARIES_libraries_list_attributes) => {
    const fieldName = attribute.id;

    const fullQuery = `${fieldName}: property(attribute: "${fieldName}") { ...ValueDetails }`;
    return fullQuery;
};

export function getRecordDataQuery(
    library: GET_LIBRARIES_libraries_list,
    attributes: GET_LIBRARIES_libraries_list_attributes[]
) {
    return gql`
        ${recordIdentityFragment}
        ${valueDetailsFragment}

        query ${`RECORD_DATA_${library.id}`}($id: String!, $version: [ValueVersionInput], $lang: [AvailableLanguage!]) {
            record: ${library.gqlNames.query}(filters: {field: id, value: $id}, version: $version) {
                list {
                    ...RecordIdentity
                    ${attributes.map(_getAttributeValueQuery)}
                }
            }
        }
    `;
}
