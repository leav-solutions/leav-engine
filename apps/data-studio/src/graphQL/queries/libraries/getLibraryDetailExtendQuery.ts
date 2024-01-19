// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlUnchecked} from 'utils';
import {AttributeFormat, AttributeType, LibraryBehavior, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {
    AttributeConditionType,
    ISystemTranslation,
    OperatorFilter,
    OrderSearch,
    TreeConditionFilter
} from '../../../_types/types';
import {getEmbeddedFields} from '../attributes/getAttributeWithEmbeddedFields';

export interface ILibraryDetailExtendedFilter {
    field?: string;
    value?: string;
    condition?: AttributeConditionType | TreeConditionFilter;
    operator?: OperatorFilter;
}

export interface ILibraryDetailExtendedDefaultView {
    id: string;
    label: string;
    description?: string;
    display: {size: ViewSizes; type: ViewTypes};
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

export interface ILibraryDetailExtendedAttributeParentLinkedLibrary {
    id: string;
    label: ISystemTranslation;
    attributes: ILibraryDetailExtendedAttributeChild[];
}

export interface ILibraryDetailExtendedAttributeParentLinkedTree {
    id: string;
    label: ISystemTranslation;
    libraries: Array<{
        library: ILibraryDetailExtendedAttributeParentLinkedTreeLibrary;
    }>;
}

export interface ILibraryDetailExtendedAttributeParentLinkedTreeLibrary {
    id: string;
    label: ISystemTranslation;
    attributes: ILibraryDetailExtendedAttributeChild[];
}

interface ILibraryDetailExtendedAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat;
    label: ISystemTranslation;
    multiple_values: boolean;
    system: boolean;
    readonly: boolean;
}

export type ILibraryDetailExtendedAttributeChild = ILibraryDetailExtendedAttribute;

export interface ILibraryDetailExtendedAttributeParent extends ILibraryDetailExtendedAttribute {
    linked_library?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
    linked_tree?: ILibraryDetailExtendedAttributeParentLinkedTree;
}

export interface ILibraryDetailExtended {
    id: string;
    system: boolean;
    behavior: LibraryBehavior;
    label: ISystemTranslation;
    attributes: ILibraryDetailExtendedAttributeParent[];
    defaultView?: ILibraryDetailExtendedDefaultView;
}

export interface IGetLibraryDetailExtendedQuery {
    libraries: {
        list: ILibraryDetailExtended[];
    };
}

export interface IGetLibraryDetailExtendedVariables {
    libId: string[];
}

export const getLibraryDetailExtendedQuery = (depthEmbeddedFields: number) => gqlUnchecked`
    query GET_LIBRARY_DETAIL_EXTENDED($libId: [ID!]) {
        libraries(filters: {id: $libId}) {
            list {
                id
                system
                label
                behavior
                linkedTrees {
                    id
                    label
                    permissions {
                        access_tree
                    }
                }
                attributes {
                    type
                    format
                    label
                    multiple_values
                    system
                    readonly
                    ... on StandardAttribute {
                        id
                        ${getEmbeddedFields(depthEmbeddedFields)}
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
                                system
                                readonly
                                ... on StandardAttribute {
                                    id
                                    ${getEmbeddedFields(depthEmbeddedFields)}
                                }
                                ... on LinkAttribute {
                                    id
                                }
                                ... on TreeAttribute {
                                    id
                                    linked_tree {
                                        id
                                        label
                                    }
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
                                    label
                                    attributes {
                                        id
                                        type
                                        format
                                        label
                                        multiple_values
                                        system
                                        readonly
                                        ... on StandardAttribute {
                                            id
                                            ${getEmbeddedFields(depthEmbeddedFields)}
                                        }
                                        ... on LinkAttribute {
                                            id
                                        }
                                        ... on TreeAttribute {
                                            id
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
                defaultView {
                    id
                    description
                    label
                    display {
                        size
                        type
                    }
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
                permissions {
                    access_library
                    access_record
                    create_record
                    edit_record
                    delete_record
                }
            }
        }
    }
`;
