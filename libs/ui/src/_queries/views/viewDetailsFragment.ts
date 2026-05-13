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
        withEmptyValues
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
