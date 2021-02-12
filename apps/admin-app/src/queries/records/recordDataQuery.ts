// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from '../../utils';
import {GET_LIB_BY_ID_libraries_list, GET_LIB_BY_ID_libraries_list_attributes} from '../../_gqlTypes/GET_LIB_BY_ID';
import {AttributeFormat} from '../../_gqlTypes/globalTypes';
import {valueDetailsExtendedFragment, valueDetailsFragment} from '../values/valueDetailsFragment';
import {recordIdentityFragment} from './recordIdentityFragment';

const _getAttributeValueQuery = (attribute: GET_LIB_BY_ID_libraries_list_attributes) => {
    const fieldName = attribute.id;

    let fullQuery: string;
    switch (attribute.format) {
        case AttributeFormat.extended:
            fullQuery = `${fieldName}: property(attribute: "${fieldName}") { ...ValueDetailsExtended }`;
            break;
        case AttributeFormat.text:
        default:
            fullQuery = `${fieldName}: property(attribute: "${fieldName}") { ...ValueDetails }`;
            break;
    }
    return fullQuery;
};

export function getRecordDataQuery(
    library: GET_LIB_BY_ID_libraries_list,
    attributes: GET_LIB_BY_ID_libraries_list_attributes[]
) {
    const detailsExtendedFragment = attributes.find(a => a.format === AttributeFormat.extended)
        ? valueDetailsExtendedFragment
        : '';

    return gqlUnchecked`
        ${recordIdentityFragment}
        ${valueDetailsFragment}
        ${detailsExtendedFragment}

        query ${`RECORD_DATA_${library.id}`}($id: String!, $version: [ValueVersionInput], $lang: [AvailableLanguage!]) {
            record: ${library.gqlNames.query}(filters: {field: "id", value: $id}, version: $version) {
                list {
                    ...RecordIdentity
                    ${attributes.map(_getAttributeValueQuery)}
                }
            }
        }
    `;
}
