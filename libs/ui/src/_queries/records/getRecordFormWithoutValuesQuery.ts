// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {valueDetailsFragment} from '../values/valueDetailsFragment';
import {recordFormAttributeFragment} from './recordFormAttributeFragment';

export const getRecordFormWithoutValuesQuery = gql`
    ${recordFormAttributeFragment}

    fragment RecordFormElementWithoutValues on FormElementWithValues {
        id
        containerId
        uiElementType
        type
        valueError
        attribute {
            ...RecordFormAttribute
        }
        settings {
            key
            value
        }
    }

    query RECORD_FORM_WITHOUT_VALUES(
        $libraryId: String!
        $formId: String!
        $recordId: String
        $version: [ValueVersionInput!]
    ) {
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
                ...RecordFormElementWithoutValues
            }
            sidePanel {
                enable
                isOpenByDefault
            }
        }
    }
`;
