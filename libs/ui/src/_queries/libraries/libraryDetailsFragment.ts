// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments';

export const libraryDetailsFragment = gql`
    ${recordIdentityFragment}

    fragment LibraryLinkAttributeDetails on LinkAttribute {
        linked_library {
            id
            behavior
        }
    }

    fragment LibraryAttributes on Attribute {
        id
        label
        system
        type
        format
        ...LibraryLinkAttributeDetails
    }

    fragment LibraryPreviewsSettings on LibraryPreviewsSettings {
        label
        description
        system
        versions {
            background
            density
            sizes {
                name
                size
            }
        }
    }

    fragment LibraryDetails on Library {
        id
        label
        behavior
        system
        label
        fullTextAttributes {
            id
            label
        }
        attributes {
            ...LibraryAttributes
        }
        permissions_conf {
            permissionTreeAttributes {
                id
                ... on TreeAttribute {
                    linked_tree {
                        id
                    }
                }
                label
            }
            relation
        }
        recordIdentityConf {
            label
            subLabel
            color
            preview
            treeColorPreview
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
        previewsSettings {
            ...LibraryPreviewsSettings
        }
    }
`;
