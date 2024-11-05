// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {ISystemTranslation} from '../../../_types/types';

export interface IGetTreeAttributesQueryAttribute {
    type: AttributeType;
    format: AttributeFormat;
    label: ISystemTranslation;
    multiple_values: boolean;
    id: string;
    linked_library?: string;
    linked_tree?: string;
}

export interface IGetTreeAttributesQueryLibrary {
    id: string;
    attributes: IGetTreeAttributesQueryAttribute[];
}

export interface IGetTreeAttributesQueryListElement {
    id: string;
    libraries: IGetTreeAttributesQueryLibrary[];
}

export interface IGetTreeAttributesQuery {
    trees: {
        list: IGetTreeAttributesQueryListElement[];
    };
}

export interface IGetTreeAttributesVariables {
    treeId: string;
}

export const getTreeAttributesQuery = gql`
    query GET_TREE_ATTRIBUTES_QUERY($treeId: [ID!]) {
        trees(filters: {id: $treeId}) {
            list {
                id
                libraries {
                    library {
                        id
                        label
                        attributes {
                            id
                            type
                            format
                            label
                            multiple_values
                            ... on StandardAttribute {
                                embedded_fields {
                                    id
                                    format
                                    label
                                }
                            }
                            ... on LinkAttribute {
                                linked_library {
                                    id
                                }
                            }
                            ... on TreeAttribute {
                                linked_tree {
                                    id
                                    label
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;
