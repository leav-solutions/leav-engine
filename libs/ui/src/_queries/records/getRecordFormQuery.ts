import {gql} from '@apollo/client';
import {valueDetailsFragment} from '../values/valueDetailsFragment';
import {recordFormAttributeFragment} from './recordFormAttributeFragment';

export const getRecordFormQuery = gql`
    ${valueDetailsFragment}
    ${recordFormAttributeFragment}

    fragment JoinLibraryContext on FormElementJoinLibraryContext {
        mandatoryAttribute {
            ...RecordFormAttribute
        }
    }

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
        joinLibraryContext {
            ...JoinLibraryContext
        }
    }

    fragment StandardValuesListFragment on StandardValuesListConf {
        ... on StandardStringValuesListConf {
            enable
            allowFreeEntry
            allowListUpdate
            values
        }

        ... on StandardDateRangeValuesListConf {
            enable
            allowFreeEntry
            allowListUpdate
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
            sidePanel {
                enable
                isOpenByDefault
            }
        }
    }
`;
