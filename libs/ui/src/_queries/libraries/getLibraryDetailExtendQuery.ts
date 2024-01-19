// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SystemTranslation} from '_ui/types/scalars';
import {AttributeConditionType, TreeConditionFilter} from '_ui/types/search';
import {
    AttributeFormat,
    AttributeType,
    LibraryBehavior,
    RecordFilterInput,
    RecordFilterOperator,
    SortOrder,
    ViewSizes,
    ViewTypes
} from '_ui/_gqlTypes';
import {gqlUnchecked} from '_ui/_utils';
import {getEmbeddedFields} from '../attributes/getAttributeWithEmbeddedFields';

export interface ILibraryDetailExtendedFilter {
    field?: string;
    value?: string;
    condition?: AttributeConditionType | TreeConditionFilter;
    operator?: RecordFilterOperator;
}

export interface ILibraryDetailExtendedDefaultView {
    id: string;
    label: SystemTranslation;
    description?: SystemTranslation;
    display: {size: ViewSizes; type: ViewTypes};
    shared: boolean;
    filters?: RecordFilterInput[];
    color: string;
    sort: {
        field: string;
        order: SortOrder;
    };
    settings?: Array<{
        name: string;
        value: any;
    }>;
}

export interface ILibraryDetailExtendedAttributeParentLinkedLibrary {
    id: string;
    label: SystemTranslation;
    attributes: ILibraryDetailExtendedAttributeChild[];
}

export interface ILibraryDetailExtendedAttributeParentLinkedTree {
    id: string;
    label: SystemTranslation;
    libraries: Array<{
        library: ILibraryDetailExtendedAttributeParentLinkedTreeLibrary;
    }>;
}

export interface ILibraryDetailExtendedAttributeParentLinkedTreeLibrary {
    id: string;
    label: SystemTranslation;
    attributes: ILibraryDetailExtendedAttributeChild[];
}

export interface ILibraryDetailExtendedAttribute {
    id: string;
    type: AttributeType;
    format?: AttributeFormat;
    label?: SystemTranslation;
    multiple_values?: boolean;
    system: boolean;
    readonly: boolean;
}

export interface ILibraryDetailExtendedAttributeStandard extends ILibraryDetailExtendedAttribute {
    embedded_fields?: ILibraryDetailExtendedAttributeStandard[];
}

export interface ILibraryDetailExtendedAttributeLink extends ILibraryDetailExtendedAttribute {
    linked_library?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
}

export interface ILibraryDetailExtendedAttributeTree extends ILibraryDetailExtendedAttribute {
    linked_tree?: ILibraryDetailExtendedAttributeParentLinkedTree;
}

export type ILibraryDetailExtendedAttributeChild = ILibraryDetailExtendedAttribute;

export interface ILibraryDetailExtendedAttributeParent extends ILibraryDetailExtendedAttribute {
    linked_library?: ILibraryDetailExtendedAttributeParentLinkedLibrary;
    linked_tree?: ILibraryDetailExtendedAttributeParentLinkedTree;
}

export interface ILibraryDetailExtendedPermissions {
    access_library: boolean;
    access_record: boolean;
    create_record: boolean;
    edit_record: boolean;
    delete_record: boolean;
}

export interface ILibraryDetailExtendedLinkedTree {
    id: string;
    label: SystemTranslation;
    permissions: {
        access_tree: boolean;
    };
}

export interface ILibraryDetailExtended {
    id: string;
    system: boolean;
    behavior: LibraryBehavior;
    label: SystemTranslation;
    linkedTrees?: ILibraryDetailExtendedLinkedTree[];
    attributes: ILibraryDetailExtendedAttributeParent[];
    defaultView?: ILibraryDetailExtendedDefaultView;
    permissions?: ILibraryDetailExtendedPermissions;
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
