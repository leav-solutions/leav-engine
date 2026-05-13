import {gql} from '@apollo/client';

export const getActionListQuery = gql`
    query GET_ACTIONS_LIST_QUERY($attId: ID!) {
        attributes(filters: {id: $attId}) {
            list {
                id
                format
                input_types {
                    saveValue
                    postSaveValue
                    getValue
                    deleteValue
                    postDeleteValue
                }
                output_types {
                    saveValue
                    postSaveValue
                    getValue
                    deleteValue
                    postDeleteValue
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
                    postSaveValue {
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
                    postDeleteValue {
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
