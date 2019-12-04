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
                        name
                        is_system
                        params {
                            name
                            value
                        }
                    }
                    getValue {
                        name
                        is_system
                        params {
                            name
                            value
                        }
                    }
                    deleteValue {
                        name
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
