// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
