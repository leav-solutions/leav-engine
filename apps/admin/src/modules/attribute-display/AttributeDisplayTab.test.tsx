import userEvent from '@testing-library/user-event';
import {type MockedResponse} from '@apollo/client/testing';
import {
    mockAttrAdvLink,
    mockAttrSimple,
    mockAttrSimpleLink,
    mockAttrSimpleWithOpenValuesList,
    mockAttrSimpleWithValuesList,
    mockAttrTree,
    mockAttrTreeMultival,
} from '../../__mocks__/attributes';
import {
    type AttributeDetailsLinkAttributeFragment,
    type AttributeDetailsTreeAttributeFragment,
    MultiDisplayOption,
    SaveAttributeDocument,
    TreeSelectableNodes,
    type TreeSelectionConfInput,
} from '../../_gqlTypes';
import {render, screen, waitFor, within} from '../../_tests/testUtils';
import {AttributeDisplayTab} from './AttributeDisplayTab';
import {treeSelectionNodesQuery} from './get-tree-selection-nodes/treeSelectionNodesQuery';

const defaultConf: Required<TreeSelectionConfInput> = {
    selectableNodes: TreeSelectableNodes.all_nodes,
    defaultExpanded: false,
    displayRootNode: null,
    maxDepth: null,
    showSelectChildrenButton: false,
    showSelectDescendantsButton: false,
};

const treeNodesMock: MockedResponse = {
    request: {
        query: treeSelectionNodesQuery(),
        variables: {treeId: mockAttrTree.linked_tree.id},
    },
    result: {
        data: {
            treeContent: [
                {
                    __typename: 'TreeNode',
                    id: 'node_a',
                    childrenCount: 1,
                    record: {
                        __typename: 'Record',
                        id: 'record_a',
                        whoAmI: {
                            __typename: 'RecordIdentity',
                            id: 'record_a',
                            label: 'Node A',
                            library: {__typename: 'Library', id: 'test_lib'},
                        },
                    },
                    children: [
                        {
                            __typename: 'TreeNode',
                            id: 'node_a_1',
                            childrenCount: 0,
                            record: {
                                __typename: 'Record',
                                id: 'record_a_1',
                                whoAmI: {
                                    __typename: 'RecordIdentity',
                                    id: 'record_a_1',
                                    label: 'Node A1',
                                    library: {__typename: 'Library', id: 'test_lib'},
                                },
                            },
                            children: [],
                        },
                    ],
                },
            ],
        },
    },
};

/**
 * Mocked responses only match on exact variables, so a matched mock proves the whole configuration
 * was sent under `attrData: {id, tree_selection_conf}` and nothing else.
 */
const saveConfMock = (conf: Required<TreeSelectionConfInput>, onCalled: () => void): MockedResponse => ({
    request: {
        query: SaveAttributeDocument,
        variables: {attrData: {id: mockAttrTree.id, tree_selection_conf: conf}},
    },
    result: () => {
        onCalled();
        return {
            data: {
                saveAttribute: {...mockAttrTree, __typename: 'TreeAttribute', tree_selection_conf: conf},
            },
        };
    },
});

/** The Form section only ever applies to a tree attribute. */
const _renderTab = (
    attribute: AttributeDetailsLinkAttributeFragment | AttributeDetailsTreeAttributeFragment,
    {apolloMocks = [treeNodesMock]}: {apolloMocks?: MockedResponse[]} = {},
) => render(<AttributeDisplayTab attribute={attribute} />, {apolloMocks});

/**
 * Both sections hold a combobox — the display option here, the root node in the Form section — so
 * an assertion on either has to be scoped to its own section.
 */
const _explorerSection = () =>
    screen.getByText('attributes.display.section_explorer').closest('section') as HTMLElement;

describe('AttributeDisplayTab', () => {
    test('Display the six settings with their default values', async () => {
        _renderTab(mockAttrTree);

        expect(screen.getByText('attributes.display.selectable_nodes_all_nodes')).toBeInTheDocument();
        expect(screen.getByText('attributes.display.default_expanded_closed')).toBeInTheDocument();
        expect(screen.getByText('attributes.display.display_root_node')).toBeInTheDocument();
        expect(screen.getByText('attributes.display.max_depth')).toBeInTheDocument();
        // showSelectChildrenButton, showSelectDescendantsButton, and the column split switch
        expect(screen.getAllByText('admin.no')).toHaveLength(3);

        // 4 tree_selection_conf switches + the column split switch (mockAttrTree is eligible: type tree)
        const switches = screen.getAllByRole('switch');
        expect(switches).toHaveLength(5);
        switches.forEach(switchElement => expect(switchElement).not.toBeChecked());
    });

    test('Reflect the stored configuration', async () => {
        const attribute = {
            ...mockAttrTree,
            tree_selection_conf: {
                selectableNodes: TreeSelectableNodes.leaves_only,
                defaultExpanded: true,
                displayRootNode: 'node_a',
                maxDepth: 3,
                showSelectChildrenButton: true,
                showSelectDescendantsButton: false,
            },
        };

        _renderTab(attribute);

        expect(screen.getByText('attributes.display.selectable_nodes_leaves_only')).toBeInTheDocument();
        expect(screen.getByText('attributes.display.default_expanded_open')).toBeInTheDocument();
        expect(screen.getByRole('spinbutton')).toHaveValue('3');
        expect(screen.getByText('admin.yes')).toBeInTheDocument();
        // showSelectDescendantsButton and the (still unchanged) column split switch
        expect(screen.getAllByText('admin.no')).toHaveLength(2);
        await waitFor(() => expect(screen.getByText('Node A')).toBeInTheDocument());
    });

    test('Save the whole configuration when a switch is toggled', async () => {
        let saveCalled = false;
        _renderTab(mockAttrTree, {
            apolloMocks: [
                treeNodesMock,
                saveConfMock({...defaultConf, selectableNodes: TreeSelectableNodes.leaves_only}, () => {
                    saveCalled = true;
                }),
            ],
        });

        await userEvent.click(screen.getByRole('switch', {name: 'attributes.display.selectable_nodes'}));

        expect(screen.getByText('attributes.display.selectable_nodes_leaves_only')).toBeInTheDocument();
        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Save the depth on blur only, not on each keystroke', async () => {
        let saveCalled = false;
        _renderTab(mockAttrTree, {
            apolloMocks: [
                treeNodesMock,
                saveConfMock({...defaultConf, maxDepth: 12}, () => {
                    saveCalled = true;
                }),
            ],
        });

        const depthInput = screen.getByRole('spinbutton');

        // Typing "12" goes through the intermediate value 1: no mock matches it, so a mutation
        // fired on keystroke would leave `saveCalled` false at the end
        await userEvent.type(depthInput, '12');
        expect(saveCalled).toBe(false);

        await userEvent.tab();
        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Revert the displayed value when the save fails', async () => {
        _renderTab(mockAttrTree, {
            apolloMocks: [
                treeNodesMock,
                {
                    request: {
                        query: SaveAttributeDocument,
                        variables: {
                            attrData: {
                                id: mockAttrTree.id,
                                tree_selection_conf: {...defaultConf, defaultExpanded: true},
                            },
                        },
                    },
                    error: new Error('Save failed'),
                },
            ],
        });

        await userEvent.click(screen.getByRole('switch', {name: 'attributes.display.default_expanded'}));

        await waitFor(() => expect(screen.getByText('attributes.display.default_expanded_closed')).toBeInTheDocument());
        expect(screen.getByRole('switch', {name: 'attributes.display.default_expanded'})).not.toBeChecked();
    });

    test('Show both sections on a multi-valued tree attribute', async () => {
        _renderTab(mockAttrTreeMultival);

        expect(screen.getByText('attributes.display.section_explorer')).toBeInTheDocument();
        expect(screen.getByText('attributes.display.section_form')).toBeInTheDocument();
        // Nothing stored on the attribute falls back to the option the rendering already defaults to
        expect(screen.getByText('attributes.multi_display_options.avatar')).toBeInTheDocument();
    });

    test('Show the Explorer section on a mono-valued tree attribute', async () => {
        _renderTab(mockAttrTree);

        expect(screen.getByText('attributes.display.section_explorer')).toBeInTheDocument();
        expect(screen.getByText('attributes.display.section_form')).toBeInTheDocument();
    });

    test('Offer only the identity card and the tag on a mono-valued attribute', async () => {
        _renderTab(mockAttrTree);

        // Nothing stored on the attribute falls back to `avatar`, labelled as identity card in mono
        expect(screen.getByText('attributes.multi_display_options.avatar_mono')).toBeInTheDocument();

        await userEvent.click(within(_explorerSection()).getByRole('combobox'));

        expect(await screen.findByText('attributes.multi_display_options.tag')).toBeInTheDocument();
        expect(screen.queryByText('attributes.multi_display_options.avatar')).not.toBeInTheDocument();
        expect(screen.queryByText('attributes.multi_display_options.badge_qty')).not.toBeInTheDocument();
    });

    test('Offer the avatar group and the quantity badge on a multi-valued attribute', async () => {
        _renderTab(mockAttrTreeMultival);

        await userEvent.click(within(_explorerSection()).getByRole('combobox'));

        expect(screen.getAllByText('attributes.multi_display_options.avatar').length).toBeGreaterThan(0);
        expect(await screen.findByText('attributes.multi_display_options.badge_qty')).toBeInTheDocument();
        expect(screen.queryByText('attributes.multi_display_options.avatar_mono')).not.toBeInTheDocument();
    });

    test.each([
        ['a simple_link attribute', mockAttrSimpleLink],
        ['an advanced_link attribute', mockAttrAdvLink],
    ])('Save multi_link_display_option for %s', async (_label, attribute) => {
        let saveCalled = false;
        _renderTab(attribute, {
            apolloMocks: [
                {
                    request: {
                        query: SaveAttributeDocument,
                        variables: {
                            attrData: {id: attribute.id, multi_link_display_option: MultiDisplayOption.tag},
                        },
                    },
                    result: () => {
                        saveCalled = true;
                        return {
                            data: {
                                saveAttribute: {
                                    ...attribute,
                                    __typename: 'LinkAttribute',
                                    multi_link_display_option: MultiDisplayOption.tag,
                                },
                            },
                        };
                    },
                },
            ],
        });

        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(await screen.findByText('attributes.multi_display_options.tag'));

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    test('Hide the Form section on a link attribute', async () => {
        _renderTab(mockAttrAdvLink);

        expect(screen.getByText('attributes.display.section_explorer')).toBeInTheDocument();
        expect(screen.queryByText('attributes.display.section_form')).not.toBeInTheDocument();
    });

    test('Save the display option as a root field of the attribute, not inside tree_selection_conf', async () => {
        let saveCalled = false;
        _renderTab(mockAttrTreeMultival, {
            apolloMocks: [
                treeNodesMock,
                {
                    request: {
                        query: SaveAttributeDocument,
                        variables: {
                            attrData: {
                                id: mockAttrTreeMultival.id,
                                multi_tree_display_option: MultiDisplayOption.tag,
                            },
                        },
                    },
                    result: () => {
                        saveCalled = true;
                        return {
                            data: {
                                saveAttribute: {
                                    ...mockAttrTreeMultival,
                                    __typename: 'TreeAttribute',
                                    multi_tree_display_option: MultiDisplayOption.tag,
                                },
                            },
                        };
                    },
                },
            ],
        });

        await userEvent.click(within(_explorerSection()).getByRole('combobox'));
        await userEvent.click(await screen.findByText('attributes.multi_display_options.tag'));

        await waitFor(() => expect(saveCalled).toBe(true));
    });

    describe('Column split)', () => {
        test('Not shown on an attribute that is neither a tree nor a closed values list', async () => {
            _renderTab(mockAttrSimple, {apolloMocks: []});

            expect(screen.queryByText('attributes.display.column_split')).not.toBeInTheDocument();
        });

        test('Not shown on an attribute with an open (free entry) values list', async () => {
            _renderTab(mockAttrSimpleWithOpenValuesList, {apolloMocks: []});

            expect(screen.queryByText('attributes.display.column_split')).not.toBeInTheDocument();
        });

        test('Shown, unchecked by default, on an attribute with a closed values list', async () => {
            _renderTab(mockAttrSimpleWithValuesList, {apolloMocks: []});

            expect(screen.getByText('attributes.display.column_split')).toBeInTheDocument();
            expect(screen.getByRole('switch')).not.toBeChecked();
            expect(screen.getByText('admin.no')).toBeInTheDocument();
        });

        test('Shown on a tree attribute', async () => {
            _renderTab(mockAttrTree);

            expect(screen.getByText('attributes.display.column_split')).toBeInTheDocument();
        });

        test('Save on toggle', async () => {
            let saveCalled = false;
            _renderTab(mockAttrSimpleWithValuesList, {
                apolloMocks: [
                    {
                        request: {
                            query: SaveAttributeDocument,
                            variables: {
                                attrData: {id: mockAttrSimpleWithValuesList.id, column_split_enabled: true},
                            },
                        },
                        result: () => {
                            saveCalled = true;
                            return {
                                data: {
                                    saveAttribute: {
                                        ...mockAttrSimpleWithValuesList,
                                        __typename: 'StandardAttribute',
                                        column_split_enabled: true,
                                    },
                                },
                            };
                        },
                    },
                ],
            });

            await userEvent.click(screen.getByRole('switch'));

            await waitFor(() => expect(saveCalled).toBe(true));
            expect(screen.getByRole('switch')).toBeChecked();
            expect(screen.getByText('admin.yes')).toBeInTheDocument();
        });

        test('Revert the switch when the save fails', async () => {
            _renderTab(mockAttrSimpleWithValuesList, {
                apolloMocks: [
                    {
                        request: {
                            query: SaveAttributeDocument,
                            variables: {
                                attrData: {id: mockAttrSimpleWithValuesList.id, column_split_enabled: true},
                            },
                        },
                        error: new Error('Save failed'),
                    },
                ],
            });

            await userEvent.click(screen.getByRole('switch'));

            await waitFor(() => expect(screen.getByRole('switch')).not.toBeChecked());
            expect(screen.getByText('admin.no')).toBeInTheDocument();
        });
    });
});
