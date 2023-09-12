// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getActionListQuery = gql`
    query GET_ACTIONS_LIST_QUERY($attId: ID!) {
        attributes(filters: {id: $attId}) {
            list {
                id
                format
                input_types {
                    saveValue
                    getValue
                    deleteValue
                }
                output_types {
                    saveValue
                    getValue
                    deleteValue
                }
                actions_list {
                    saveValue {
                        id
                        is_system
                        params {
                            name
                            value
                        }
                        error_message
                    }
                    getValue {
                        id
                        is_system
                        params {
                            name
                            value
                        }
                    }
                    deleteValue {
                        id
                        is_system
                        params {
                            name
                            value
                        }
                    }
                }
            }
        }
    }
`;
