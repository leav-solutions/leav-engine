// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '_ui/gqlFragments';

const viewDetailsFragment = gql`
    ${recordIdentityFragment}
    fragment ViewDetailsFilter on RecordFilter {
        field
        value
        tree {
            id
            label
        }
        condition
        operator
    }

    fragment ViewDetails on View {
        id
        display {
            size
            type
        }
        shared
        created_by {
            id
            whoAmI {
                id
                label
                library {
                    id
                }
            }
        }
        label
        description
        color
        filters {
            ...ViewDetailsFilter
        }
        sort {
            field
            order
        }
        valuesVersions {
            treeId
            treeNode {
                id
                record {
                    ...RecordIdentity
                }
            }
        }
        attributes {
            id
        }
    }
`;

export default viewDetailsFragment;
