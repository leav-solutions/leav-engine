// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ArgumentNode,
    FieldNode,
    FragmentDefinitionNode,
    FragmentSpreadNode,
    GraphQLResolveInfo,
    InlineFragmentNode,
    Kind,
    NameNode,
    SelectionSetNode,
    StringValueNode
} from 'graphql';
import graphqlApp from './graphqlApp';

describe('GraphqlApp', () => {
    describe('getQueryFields', () => {
        const gqlApp = graphqlApp();

        const mockInfo: GraphQLResolveInfo = {
            fieldName: null,
            fieldNodes: null,
            returnType: null,
            parentType: null,
            path: null,
            schema: null,
            fragments: null,
            rootValue: null,
            operation: null,
            variableValues: null
        };

        const mockFieldNode: FieldNode = {
            kind: Kind.FIELD,
            name: null,
            selectionSet: null
        };

        const mockNameNode: NameNode = {
            kind: Kind.NAME,
            value: null
        };

        const mockInlineFragment: InlineFragmentNode = {
            kind: Kind.INLINE_FRAGMENT,
            selectionSet: null
        };

        const mockFragmentSpread: FragmentSpreadNode = {
            kind: Kind.FRAGMENT_SPREAD,
            name: {...mockNameNode, value: 'frag spread name'}
        };

        const mockFragmentDef: FragmentDefinitionNode = {
            kind: Kind.FRAGMENT_DEFINITION,
            name: {...mockNameNode, value: 'frag name'},
            typeCondition: null,
            selectionSet: null
        };

        const mockSelectionSet: SelectionSetNode = {
            kind: Kind.SELECTION_SET,
            selections: null
        };

        const mockArgumentNode: ArgumentNode = {
            kind: Kind.ARGUMENT,
            name: null,
            value: null
        };

        const mockValueNode: StringValueNode = {
            kind: Kind.STRING,
            value: null
        };

        test('should handle simple fields', () => {
            // query: { products { label, id }}
            const info = {
                ...mockInfo,
                fieldNodes: [
                    {
                        ...mockFieldNode,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'label'}
                                },
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'id'}
                                }
                            ]
                        }
                    }
                ]
            };

            const res = gqlApp.getQueryFields(info);
            expect(res).toEqual([
                {
                    name: 'label',
                    fields: [],
                    arguments: {}
                },
                {
                    name: 'id',
                    fields: [],
                    arguments: {}
                }
            ]);
        });

        test('should purge some system fields', () => {
            const info = {
                ...mockInfo,
                fieldNodes: [
                    {
                        ...mockFieldNode,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: '__typename'}
                                },
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'id'}
                                }
                            ]
                        }
                    }
                ]
            };

            const res = gqlApp.getQueryFields(info);
            expect(res).toEqual([
                {
                    name: 'id',
                    fields: [],
                    arguments: {}
                }
            ]);
        });

        test('should handle fields arguments', () => {
            // query: { products { label, id }}
            const info = {
                ...mockInfo,
                fieldNodes: [
                    {
                        ...mockFieldNode,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'label'},
                                    selectionSet: null,
                                    arguments: [
                                        {
                                            ...mockArgumentNode,
                                            name: {
                                                ...mockNameNode,
                                                value: 'unit'
                                            },
                                            value: {
                                                ...mockValueNode,
                                                value: 'meter'
                                            }
                                        },
                                        {
                                            ...mockArgumentNode,
                                            name: {
                                                ...mockNameNode,
                                                value: 'precision'
                                            },
                                            value: {
                                                ...mockValueNode,
                                                value: '2'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            };

            const res = gqlApp.getQueryFields(info);
            expect(res).toEqual([
                {
                    name: 'label',
                    fields: [],
                    arguments: {
                        unit: 'meter',
                        precision: '2'
                    }
                }
            ]);
        });

        test('should handle nested fields', () => {
            // query: { products { label, id, upsell { label, price, crosssell { label, price } } } }
            const info = {
                ...mockInfo,
                fieldNodes: [
                    {
                        ...mockFieldNode,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'label'}
                                },
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'id'}
                                },
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'upsell'},
                                    selectionSet: {
                                        ...mockSelectionSet,
                                        selections: [
                                            {
                                                ...mockFieldNode,
                                                name: {...mockNameNode, value: 'label'}
                                            },
                                            {
                                                ...mockFieldNode,
                                                name: {...mockNameNode, value: 'price'}
                                            },
                                            {
                                                ...mockFieldNode,
                                                name: {...mockNameNode, value: 'crosssell'},
                                                selectionSet: {
                                                    ...mockSelectionSet,
                                                    selections: [
                                                        {
                                                            ...mockFieldNode,
                                                            name: {...mockNameNode, value: 'label'}
                                                        },
                                                        {
                                                            ...mockFieldNode,
                                                            name: {...mockNameNode, value: 'price'}
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            };

            const res = gqlApp.getQueryFields(info);

            expect(res).toEqual([
                {
                    name: 'label',
                    fields: [],
                    arguments: {}
                },
                {
                    name: 'id',
                    fields: [],
                    arguments: {}
                },
                {
                    name: 'upsell',
                    arguments: {},
                    fields: [
                        {
                            name: 'label',
                            fields: [],
                            arguments: {}
                        },
                        {
                            name: 'price',
                            fields: [],
                            arguments: {}
                        },
                        {
                            name: 'crosssell',
                            arguments: {},
                            fields: [
                                {
                                    name: 'label',
                                    fields: [],
                                    arguments: {}
                                },
                                {
                                    name: 'price',
                                    fields: [],
                                    arguments: {}
                                }
                            ]
                        }
                    ]
                }
            ]);
        });

        test('should handle fragments', () => {
            const info = {
                ...mockInfo,
                fieldNodes: [
                    {
                        ...mockFieldNode,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'label'},
                                    selectionSet: null
                                },
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'id'},
                                    selectionSet: null
                                },
                                {
                                    ...mockFragmentSpread,
                                    name: {
                                        ...mockNameNode,
                                        value: 'firstFragment'
                                    }
                                },
                                {
                                    ...mockFragmentSpread,
                                    name: {
                                        ...mockNameNode,
                                        value: 'otherFragment'
                                    }
                                }
                            ]
                        }
                    }
                ],
                fragments: {
                    firstFragment: {
                        ...mockFragmentDef,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'label'},
                                    selectionSet: null
                                }
                            ]
                        }
                    },
                    otherFragment: {
                        ...mockFragmentDef,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: '_key'},
                                    selectionSet: null
                                }
                            ]
                        }
                    }
                }
            };

            const res = gqlApp.getQueryFields(info);
            expect(res).toEqual([
                {
                    name: 'label',
                    fields: [],
                    arguments: {}
                },
                {
                    name: 'id',
                    fields: [],
                    arguments: {}
                },
                {
                    name: 'label',
                    fields: [],
                    arguments: {}
                },
                {
                    name: '_key',
                    fields: [],
                    arguments: {}
                }
            ]);
        });

        test('should handle nested fragments', () => {
            const info = {
                ...mockInfo,
                fieldNodes: [
                    {
                        ...mockFieldNode,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFragmentSpread,
                                    name: {...mockNameNode, value: 'firstFragment'}
                                },
                                {
                                    ...mockFragmentSpread,
                                    name: {...mockNameNode, value: 'otherFragment'}
                                }
                            ]
                        }
                    }
                ],
                fragments: {
                    firstFragment: {
                        ...mockFragmentDef,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'label'}
                                }
                            ]
                        }
                    },
                    otherFragment: {
                        ...mockFragmentDef,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: '_key'}
                                },
                                {
                                    ...mockFragmentSpread,
                                    name: {...mockNameNode, value: 'nestedFragment'}
                                }
                            ]
                        }
                    },
                    nestedFragment: {
                        ...mockFragmentDef,
                        selectionSet: {
                            ...mockSelectionSet,
                            selections: [
                                {
                                    ...mockFieldNode,
                                    name: {...mockNameNode, value: 'nestedFragField'}
                                }
                            ]
                        }
                    }
                }
            };

            const res = gqlApp.getQueryFields(info);
            expect(res).toEqual([
                {
                    name: 'label',
                    fields: [],
                    arguments: {}
                },
                {
                    name: '_key',
                    fields: [],
                    arguments: {}
                },
                {
                    name: 'nestedFragField',
                    fields: [],
                    arguments: {}
                }
            ]);
        });
    });
});
