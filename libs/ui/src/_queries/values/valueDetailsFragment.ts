// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../../gqlFragments';
import {valuesVersionDetailsFragment} from './valuesVersionFragment';

export const valueDetailsFragment = gql`
    ${recordIdentityFragment}
    ${valuesVersionDetailsFragment}
    fragment ValueDetails on GenericValue {
        id_value
        modified_at
        modified_by {
            ...RecordIdentity
        }
        created_at
        created_by {
            ...RecordIdentity
        }
        version {
            ...ValuesVersionDetails
        }
        attribute {
            id
            format
            type
            system
        }
        metadata {
            name
            value {
                id_value
                modified_at
                modified_by {
                    ...RecordIdentity
                }
                created_at
                created_by {
                    ...RecordIdentity
                }
                version {
                    ...ValuesVersionDetails
                }
                value
                raw_value
            }
        }

        ... on Value {
            value
            raw_value
        }

        ... on LinkValue {
            linkValue: value {
                ...RecordIdentity
            }
        }

        ... on TreeValue {
            treeValue: value {
                id
                record {
                    ...RecordIdentity
                }

                ancestors {
                    record {
                        ...RecordIdentity
                    }
                }
            }
        }
    }
`;
