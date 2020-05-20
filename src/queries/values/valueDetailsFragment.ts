import gql from 'graphql-tag';

export const valueDetailsFragment = gql`
    fragment ValueDetails on GenericValue {
        id_value
        created_at
        modified_at
        version
        metadata

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

export const valueDetailsExtendedFragment = gql`
    fragment ValueDetailsExtended on GenericValue {
        id_value
        created_at
        modified_at
        version
        metadata

        ... on Value {
            id_value
        }

        ... on LinkValue {
            linkValue: value {
                ...RecordIdentity
            }
        }

        ... on TreeValue {
            treeValue: value {
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
