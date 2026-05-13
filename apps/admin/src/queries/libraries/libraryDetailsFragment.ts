import {gql} from '@apollo/client';
import {attributeDetailsFragment} from '../attributes/attributeFragments';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const libraryDetailsFragment = gql`
    ${attributeDetailsFragment}
    ${recordIdentityFragment}
    fragment LibraryDetails on Library {
        id
        system
        label
        behavior
        mandatoryAttribute {
            id
            label
        }
        attributes {
            ...AttributeDetails
        }
        fullTextAttributes {
            id
            label
        }
        settings
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
            subLabel
            color
            preview
            treeColorPreview
            parentContext
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
