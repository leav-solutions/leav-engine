// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {attributeDetailsFragment} from 'queries/attributes/attributeFragments';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const libraryDetailsFragment = gql`
    ${attributeDetailsFragment}
    ${recordIdentityFragment}
    fragment LibraryDetails on Library {
        id
        system
        label
        behavior
        attributes {
            ...AttributeDetails
        }
        fullTextAttributes {
            id
            label
        }
        permissions_conf {
            permissionTreeAttributes {
                id
                ... on TreeAttribute {
                    linked_tree {
                        id
                    }
                }
                label(lang: $lang)
            }
            relation
        }
        recordIdentityConf {
            label
            color
            preview
            treeColorPreview
        }
        defaultView {
            id
        }
        permissions {
            admin_library
            access_library
            access_record
            create_record
            edit_record
            delete_record
        }
        icon {
            ...RecordIdentity
        }
    }
`;
