// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const valueDetailsFragment = gql`
    fragment ValueDetails on GenericValue {
        id_value
        created_at
        modified_at
        version {
            treeId
            treeNode {
                id
                record {
                    id
                    whoAmI {
                        id
                        label
                        library {
                            id
                        }
                    }
                }
            }
        }
        metadata {
            name
            value {
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
        version {
            treeId
            treeNode {
                id
                record {
                    id
                    whoAmI {
                        id
                        label
                        library {
                            id
                        }
                    }
                }
            }
        }
        metadata {
            name
            value {
                value
                raw_value
            }
        }

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
