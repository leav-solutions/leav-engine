// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {valueDetailsFragment} from '../values/valueDetailsFragment';
import {recordFormAttributeFragment} from './recordFormAttributeFragment';

export const getRecordFormQuery = gql`
    ${valueDetailsFragment}
    ${recordFormAttributeFragment}

    fragment RecordFormElement on FormElementWithValues {
        id
        containerId
        uiElementType
        type
        valueError
        values {
            ...ValueDetails
        }
        attribute {
            ...RecordFormAttribute
        }
        settings {
            key
            value
        }
    }

    fragment StandardValuesListFragment on StandardValuesListConf {
        ... on StandardStringValuesListConf {
            enable
            allowFreeEntry
            values
        }

        ... on StandardDateRangeValuesListConf {
            enable
            allowFreeEntry
            dateRangeValues: values {
                from
                to
            }
        }
    }

    query RECORD_FORM($libraryId: String!, $formId: String!, $recordId: String, $version: [ValueVersionInput!]) {
        recordForm(recordId: $recordId, libraryId: $libraryId, formId: $formId, version: $version) {
            id
            recordId
            library {
                id
            }
            dependencyAttributes {
                id
            }
            elements {
                ...RecordFormElement
            }
        }
    }
`;
