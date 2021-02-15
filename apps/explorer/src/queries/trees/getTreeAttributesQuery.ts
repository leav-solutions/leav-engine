// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {AttributeFormat, AttributeType, ILabel} from '../../_types/types';

export interface IGetTreeAttributesQueryAttribute {
    type: AttributeType;
    format: AttributeFormat;
    label: ILabel;
    multiple_values: boolean;
    id: string;
    linked_library?: string;
    linked_tree?: string;
}

export interface IGetTreeAttributesQueryLibrary {
    id: string;
    gqlNames: {
        type: string;
    };
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
    query GET_TREE_ATTRIBUTES_QUERY($treeId: ID!) {
        trees(filters: {id: $treeId}) {
            list {
                id
                libraries {
                    library {
                        id
                        label
                        gqlNames {
                            type
                        }
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
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;
