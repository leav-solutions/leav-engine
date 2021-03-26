// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {
    AttributeFormat,
    AttributeType,
    ConditionFilter,
    ILabel,
    OperatorFilter,
    OrderSearch,
    ViewType
} from '../../../_types/types';

export interface ILibraryDetailExtendedFilter {
    field?: string;
    value?: string;
    condition?: ConditionFilter;
    operator?: OperatorFilter;
}

export interface ILibraryDetailExtendedDefaultView {
    id: string;
    label: string;
    description?: string;
    type: ViewType;
    shared: boolean;
    filters?: ILibraryDetailExtendedFilter[];
    color: string;
    sort: {
        field: string;
        order: OrderSearch;
    };
    settings?: Array<{
        name: string;
        value: any;
    }>;
}

export interface ILibraryDetailExtendedGqlNames {
    query: string;
    type: string;
    filter: string;
    searchableFields: string;
}

export interface ILibraryDetailExtendedAttributeParentLinkedLibrary {
    id: string;
    attributes: ILibraryDetailExtendedAttributeChild[];
}

export interface ILibraryDetailExtendedAttributeParentLinkedTree {
    id: string;
    libraries: Array<{
        library: {
            id: string;
            attributes: ILibraryDetailExtendedAttributeChild[];
        };
    }>;
}

interface ILibraryDetailExtendedAttribute {
    type: AttributeType;
    format: AttributeFormat;
    label: ILabel;
    multiple_values: boolean;
    id: string;
}

export type ILibraryDetailExtendedAttributeChild = ILibraryDetailExtendedAttribute;

export interface ILibraryDetailExtendedAttributeParent extends ILibraryDetailExtendedAttribute {
    linked_library?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
    linked_tree?: ILibraryDetailExtendedAttributeParentLinkedTree;
}

export interface ILibraryDetailExtended {
    id: string;
    system: boolean;
    label: ILabel;
    attributes: ILibraryDetailExtendedAttributeParent[];
    gqlNames: ILibraryDetailExtendedGqlNames;
    defaultView?: ILibraryDetailExtendedDefaultView;
}

export interface IGetLibraryDetailExtendedQuery {
    libraries: {
        list: ILibraryDetailExtended[];
    };
}

export interface IGetLibraryDetailExtendedVariables {
    libId: string;
}

export const getLibraryDetailExtendedQuery = gql`
    query GET_LIBRARY_DETAIL($libId: ID) {
        libraries(filters: {id: $libId}) {
            list {
                id
                system
                label
                attributes {
                    type
                    format
                    label
                    multiple_values
                    ... on StandardAttribute {
                        id
                    }
                    ... on LinkAttribute {
                        id
                        linked_library {
                            id
                            label
                            attributes {
                                type
                                format
                                label
                                multiple_values
                                ... on StandardAttribute {
                                    id
                                }
                                ... on LinkAttribute {
                                    id
                                }
                                ... on TreeAttribute {
                                    id
                                }
                            }
                            __typename
                        }
                        __typename
                    }
                    ... on TreeAttribute {
                        id
                        linked_tree {
                            id
                            label
                            libraries {
                                library {
                                    id
                                    attributes {
                                        id
                                        type
                                        format
                                        label
                                        multiple_values
                                        ... on StandardAttribute {
                                            id
                                        }
                                        ... on LinkAttribute {
                                            id
                                        }
                                        ... on TreeAttribute {
                                            id
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                gqlNames {
                    query
                    type
                    filter
                    searchableFields
                }
                defaultView {
                    id
                    label
                    type
                    shared
                    filters {
                        field
                        value
                        condition
                        operator
                    }
                    color
                    sort {
                        field
                        order
                    }
                    settings {
                        name
                        value
                    }
                }
            }
        }
    }
`;
