import {type MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {AntForm} from 'aristid-ds';
import {vi} from 'vitest';
import {
    type RecordFormAttributeTreeAttributeFragment,
    RecordPermissionsActions,
    TreeDataQueryDocument,
    TreeSelectableNodes,
} from '_ui/_gqlTypes';
import {mockFormElementTree} from '_ui/__mocks__/common/form';
import {render, screen, waitFor, within} from '_ui/_tests/testUtils';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {initialState} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {
    DEFAULT_TREE_SELECTION_DEPTH,
    type ITreeSelectionContentNode,
    treeSelectionContentQuery,
} from '_ui/hooks/useTreeSelection/_queries/treeSelectionContentQuery';
import {APICallStatus} from '../../_types';
import TreeFieldV2 from './TreeFieldV2';

const treeId = 'categories';
const libraryId = 'campaigns';
const recordId = 'record1';

/** The record edition state a mounted field lives in: an existing record of a known library. */
const editedRecordState = {
    ...initialState,
    libraryId,
    record: {id: recordId} as (typeof initialState)['record'],
};

const mockInitialState = {...editedRecordState};

vi.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
    state: mockInitialState,
    dispatch: vi.fn(),
}));

// `__typename` is required: MockedProvider adds it to the documents, the cache drops what lacks it
const _record = (id: string) => ({
    __typename: 'Record',
    id,
    whoAmI: {
        __typename: 'RecordIdentity',
        id,
        label: id,
        library: {__typename: 'Library', id: 'categories'},
    },
});

type MockContentNode = ITreeSelectionContentNode & {__typename: string};

const _node = (id: string, children: MockContentNode[] = []): MockContentNode => ({
    __typename: 'TreeNode',
    id,
    childrenCount: children.length,
    record: _record(id),
    children,
});

/** Matches any variables: it is only there to assert what the field asks the server for. */
const contentVariableMatcher = vi.fn(() => true);

const _contentMock = (content: MockContentNode[]): MockedResponse => ({
    request: {query: treeSelectionContentQuery(DEFAULT_TREE_SELECTION_DEPTH)},
    variableMatcher: contentVariableMatcher,
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {data: {treeContent: content}},
});

const contentMock = _contentMock([_node('branch', [_node('leaf1')]), _node('otherLeaf')]);

const treeDataMock: MockedResponse = {
    request: {query: TreeDataQueryDocument, variables: {treeId}},
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
        data: {
            trees: {
                __typename: 'TreesList',
                list: [{__typename: 'Tree', id: treeId, label: {fr: 'Catégories'}}],
            },
        },
    },
};

const mocks = [contentMock, treeDataMock];

const attributeId = mockFormElementTree.attribute.id;

/** `label` is only passed to tell the label of a saved value apart from the id of its node. */
const _backendValue = (nodeId: string, idValue: string, label?: string) =>
    ({
        id_value: idValue,
        created_at: null,
        modified_at: null,
        treeValue: {
            id: nodeId,
            record: label ? {..._record(nodeId), whoAmI: {..._record(nodeId).whoAmI, label}} : _record(nodeId),
        },
    }) as unknown as RecordFormElementsValueTreeValue;

const _element = ({
    multipleValues = false,
    required = false,
    treeSelectionConf = null,
    values = [],
}: {
    multipleValues?: boolean;
    required?: boolean;
    treeSelectionConf?: RecordFormAttributeTreeAttributeFragment['tree_selection_conf'];
    values?: RecordFormElementsValueTreeValue[];
} = {}) => ({
    ...mockFormElementTree,
    settings: {...mockFormElementTree.settings, label: {fr: 'Catégorie'}},
    attribute: {
        ...(mockFormElementTree.attribute as RecordFormAttributeTreeAttributeFragment),
        linked_tree: {id: treeId, label: {fr: 'Catégories'}},
        multiple_values: multipleValues,
        required,
        tree_selection_conf: treeSelectionConf,
    },
    values,
});

/** Lets a test control exactly when a mocked `onValueSubmit` resolves. */
const _deferred = <T,>() => {
    let resolve: (value: T) => void;
    const promise = new Promise<T>(res => {
        resolve = res;
    });
    return {promise, resolve: resolve!};
};

const _submitSuccess = (nodeId: string, idValue: string) => ({
    status: APICallStatus.SUCCESS,
    values: [
        {
            id_value: idValue,
            version: null,
            metadata: null,
            treeValue: {id: nodeId, record: _record(nodeId)},
        },
    ],
});

const _renderField = ({
    element = _element(),
    onValueSubmit = vi.fn(),
    onValueDelete = vi.fn(),
    onDeleteMultipleValues = vi.fn(),
    treeMocks = mocks,
    readonly = false,
}: {
    element?: ReturnType<typeof _element>;
    onValueSubmit?: any;
    onValueDelete?: any;
    onDeleteMultipleValues?: any;
    treeMocks?: MockedResponse[];
    readonly?: boolean;
} = {}) =>
    render(
        <AntForm>
            <TreeFieldV2
                element={element as any}
                readonly={readonly}
                isFormCreationMode={false}
                onValueSubmit={onValueSubmit}
                onValueDelete={onValueDelete}
                onDeleteMultipleValues={onDeleteMultipleValues}
            />
        </AntForm>,
        {mocks: treeMocks},
    );

/** antd also announces the active node in an `aria-live` region: only the tree titles are targeted. */
const _findNode = async (label: string) => {
    const matches = await screen.findAllByText(label);
    return matches.find(match => match.classList.contains('ant-select-tree-title'));
};

const _displayedNodes = () =>
    Array.from(document.querySelectorAll('.ant-select-tree-title')).map(node => node.textContent);

const _openDropdown = async () => {
    await userEvent.click(screen.getByRole('combobox'));
    return _findNode('branch');
};

/**
 * With the group buttons on, the title of a node is a `ReactNode`: `getByText` no longer matches the
 * `.ant-select-tree-title` itself, so it is looked up by text content.
 */
const _findRichNode = async (label: string) =>
    waitFor(() => {
        const found = Array.from(document.querySelectorAll('.ant-select-tree-title')).find(node =>
            node.textContent?.startsWith(label),
        );

        expect(found).toBeDefined();

        return found as HTMLElement;
    });

describe('TreeFieldV2', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.assign(mockInitialState, editedRecordState);
    });

    test('Loads the tree on the first opening only, with the permission filters of its own attribute', async () => {
        _renderField();

        // A form holding several tree attributes would fire as many queries on mount otherwise
        await screen.findByRole('combobox');
        expect(contentVariableMatcher).not.toHaveBeenCalled();

        await _openDropdown();

        expect(contentVariableMatcher).toHaveBeenCalledTimes(1);
        expect(contentVariableMatcher).toHaveBeenCalledWith(
            expect.objectContaining({
                childrenAsRecordValuePermissionFilter: {
                    libraryId,
                    attributeId,
                    action: RecordPermissionsActions.create_record,
                },
                dependentValuesPermissionFilter: {libraryId, attributeId, recordId},
            }),
        );

        // Latched: the tree is not fetched again on the next openings
        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(screen.getByRole('combobox'));

        expect(contentVariableMatcher).toHaveBeenCalledTimes(1);
    });

    test('Displays the label of the saved values, not their node id, while the tree is not loaded', async () => {
        _renderField({element: _element({values: [_backendValue('branch', 'value1', 'Ma branche')]})});

        // The label comes from the record form, no need to wait for the tree
        expect(await screen.findByTitle('Ma branche')).toBeVisible();
        expect(contentVariableMatcher).not.toHaveBeenCalled();
        expect(screen.queryByText('branch')).not.toBeInTheDocument();
    });

    test('Sends no dependent values filter when the record does not exist yet', async () => {
        mockInitialState.record = null;

        _renderField();

        await _openDropdown();

        expect(_displayedNodes()).toEqual(['branch', 'otherLeaf']);
        expect(contentVariableMatcher).toHaveBeenCalledWith(
            expect.objectContaining({dependentValuesPermissionFilter: undefined}),
        );
    });

    test('Offers the nodes of the tree, without the pseudo root standing for the tree', async () => {
        _renderField();

        await _openDropdown();

        // Not expanded by default, and no pseudo root named after the tree
        expect(_displayedNodes()).toEqual(['branch', 'otherLeaf']);
    });

    test('Unfolds the whole hierarchy when the attribute is configured with defaultExpanded', async () => {
        _renderField({element: _element({treeSelectionConf: {defaultExpanded: true}})});

        await _openDropdown();

        expect(await _findNode('leaf1')).toBeVisible();
    });

    test('Saves the picked node on a mono-valued attribute', async () => {
        const onValueSubmit = vi.fn().mockResolvedValue(_submitSuccess('branch', 'value1'));
        _renderField({onValueSubmit});

        await userEvent.click(await _openDropdown());

        await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(1));
        expect(onValueSubmit).toHaveBeenCalledWith(
            [expect.objectContaining({idValue: null, value: expect.objectContaining({id: 'branch'})})],
            null,
        );
    });

    /** The closed value slot — as opposed to the dropdown popup, which repeats the same node titles. */
    const _selectedValueContent = (container: HTMLElement) => container.querySelector('.ant-select-content');

    test('Displays the clicked node right away, before the submit mutation resolves (LEAVC-996)', async () => {
        const deferred = _deferred<ReturnType<typeof _submitSuccess>>();
        const onValueSubmit = vi.fn().mockReturnValue(deferred.promise);
        const {container} = _renderField({onValueSubmit});

        await userEvent.click(await _openDropdown());

        // The mutation is still pending: the field is fully controlled, so without an optimistic
        // value it would show nothing (mono) or the value would revert to the empty backend state
        expect(onValueSubmit).toHaveBeenCalledTimes(1);
        await waitFor(() => expect(_selectedValueContent(container)).toHaveTextContent('branch'));

        deferred.resolve(_submitSuccess('branch', 'value1'));
        await waitFor(() => expect(_selectedValueContent(container)).toHaveTextContent('branch'));
    });

    test('Reverts to the previously saved node when the submit mutation fails (LEAVC-996)', async () => {
        const onValueSubmit = vi.fn().mockResolvedValue({
            status: APICallStatus.ERROR,
            errors: [{input: 'otherLeaf', message: 'Value not allowed'}],
        });
        const {container} = _renderField({
            element: _element({values: [_backendValue('branch', 'value1')]}),
            onValueSubmit,
        });

        await _openDropdown();
        await userEvent.click(await _findNode('otherLeaf'));

        await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(1));
        // Back to the previously saved node, not stuck showing the rejected pick
        await waitFor(() => expect(_selectedValueContent(container)).toHaveTextContent('branch'));
    });

    test('Overrides the current value instead of adding one on a mono-valued attribute', async () => {
        const onValueSubmit = vi.fn().mockResolvedValue(_submitSuccess('otherLeaf', 'value1'));
        _renderField({
            element: _element({values: [_backendValue('branch', 'value1')]}),
            onValueSubmit,
        });

        await _openDropdown();
        await userEvent.click(await _findNode('otherLeaf'));

        await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(1));
        expect(onValueSubmit).toHaveBeenCalledWith(
            [expect.objectContaining({idValue: 'value1', value: expect.objectContaining({id: 'otherLeaf'})})],
            null,
        );
    });

    test('Deletes the value when the mono-valued field is cleared', async () => {
        const onValueDelete = vi.fn().mockResolvedValue({status: APICallStatus.SUCCESS});
        const {container} = _renderField({
            element: _element({values: [_backendValue('branch', 'value1')]}),
            onValueDelete,
        });

        await screen.findByTitle('branch');
        await userEvent.click(container.querySelector('.ant-select-clear'));

        await waitFor(() => expect(onValueDelete).toHaveBeenCalledWith({id_value: 'value1'}, attributeId));
    });

    test('Saves each newly checked node on a multi-valued attribute', async () => {
        const onValueSubmit = vi
            .fn()
            .mockResolvedValueOnce(_submitSuccess('branch', 'value1'))
            .mockResolvedValueOnce(_submitSuccess('otherLeaf', 'value2'));
        _renderField({element: _element({multipleValues: true}), onValueSubmit});

        await userEvent.click(await _openDropdown());
        await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(1));

        await userEvent.click(await _findNode('otherLeaf'));
        await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(2));

        expect(onValueSubmit.mock.calls.map(([values]) => values[0].value.id)).toEqual(['branch', 'otherLeaf']);
        // Selecting a node never drags its subtree along
        expect(onValueSubmit.mock.calls.every(([values]) => values.length === 1)).toBe(true);
    });

    test('Deletes the value of a node unchecked on a multi-valued attribute', async () => {
        const onValueDelete = vi.fn().mockResolvedValue({status: APICallStatus.SUCCESS});
        _renderField({
            element: _element({
                multipleValues: true,
                values: [_backendValue('branch', 'value1'), _backendValue('otherLeaf', 'value2')],
            }),
            onValueDelete,
        });

        await _openDropdown();
        await userEvent.click(await _findNode('otherLeaf'));

        await waitFor(() => expect(onValueDelete).toHaveBeenCalledTimes(1));
        expect(onValueDelete).toHaveBeenCalledWith({id_value: 'value2'}, attributeId);
    });

    test('Deletes the values cleared on a multi-valued attribute without the tree being loaded', async () => {
        const onDeleteMultipleValues = vi.fn().mockResolvedValue({status: APICallStatus.SUCCESS});
        const {container} = _renderField({
            element: _element({
                multipleValues: true,
                values: [_backendValue('branch', 'value1'), _backendValue('otherLeaf', 'value2')],
            }),
            onDeleteMultipleValues,
        });

        // The tags of the saved values are rendered from the record form, before any tree node is known
        expect(await screen.findByText('branch')).toBeVisible();
        await userEvent.click(container.querySelector('.ant-select-clear'));

        await waitFor(() => expect(onDeleteMultipleValues).toHaveBeenCalledTimes(1));
        expect(contentVariableMatcher).not.toHaveBeenCalled();
    });

    test('Displays the error returned by the API', async () => {
        const onValueSubmit = vi.fn().mockResolvedValue({
            status: APICallStatus.ERROR,
            errors: [{input: 'branch', message: 'Value not allowed'}],
        });
        _renderField({onValueSubmit});

        await userEvent.click(await _openDropdown());

        expect(await screen.findByText('branch: Value not allowed')).toBeVisible();
    });

    test('Renders a single-level tree as a plain list, with no dedicated code path (LEAVC-962)', async () => {
        const onValueSubmit = vi.fn().mockResolvedValue(_submitSuccess('red', 'value1'));
        _renderField({onValueSubmit, treeMocks: [_contentMock([_node('red'), _node('blue')]), treeDataMock]});

        await userEvent.click(screen.getByRole('combobox'));
        await screen.findAllByText('red');

        expect(_displayedNodes()).toEqual(['red', 'blue']);
        expect(document.querySelectorAll('.ant-select-tree-switcher-noop')).toHaveLength(2);

        await userEvent.click(await _findNode('red'));
        await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(1));
    });

    test('Reports a required field left empty on an already existing record', async () => {
        _renderField({element: _element({required: true})});

        expect(await screen.findByText('errors.standard_field_required')).toBeVisible();
    });

    test('Only lets the leaves be picked with a leaves_only configuration', async () => {
        const onValueSubmit = vi.fn().mockResolvedValue(_submitSuccess('leaf1', 'value1'));
        _renderField({
            element: _element({
                treeSelectionConf: {selectableNodes: TreeSelectableNodes.leaves_only, defaultExpanded: true},
            }),
            onValueSubmit,
        });

        await userEvent.click(await _openDropdown());
        expect(onValueSubmit).not.toHaveBeenCalled();

        await userEvent.click(await _findNode('leaf1'));
        await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(1));
        expect(onValueSubmit.mock.calls[0][0][0].value.id).toBe('leaf1');
    });

    test('Filters the dropdown on the node label, not on its id (LEAVC-996)', async () => {
        const node = _node('nodeId123');
        node.record = {
            ...node.record,
            whoAmI: {...node.record.whoAmI, label: 'Fraise'},
        };
        _renderField({treeMocks: [_contentMock([node]), treeDataMock]});

        await userEvent.click(screen.getByRole('combobox'));
        await screen.findAllByText('Fraise');

        await userEvent.type(screen.getByRole('combobox'), 'Fraise');
        expect(_displayedNodes()).toEqual(['Fraise']);

        await userEvent.clear(screen.getByRole('combobox'));
        await userEvent.type(screen.getByRole('combobox'), 'nodeId123');
        expect(_displayedNodes()).toEqual([]);
    });

    test('Removes the checkbox of the nodes leaves_only forbids on a multi-valued attribute', async () => {
        const onValueSubmit = vi.fn().mockResolvedValue(_submitSuccess('leaf1', 'value1'));
        _renderField({
            element: _element({
                multipleValues: true,
                treeSelectionConf: {selectableNodes: TreeSelectableNodes.leaves_only, defaultExpanded: true},
            }),
            onValueSubmit,
        });

        await _openDropdown();
        await _findNode('leaf1');

        // Only the 2 leaves can be checked, not `branch`
        expect(document.querySelectorAll('.ant-select-tree-checkbox')).toHaveLength(2);

        await userEvent.click(await _findNode('branch'));
        expect(onValueSubmit).not.toHaveBeenCalled();
    });

    /** Antd hides a node whose children are all checked unless `showCheckedStrategy` says otherwise. */
    test('Keeps the tag of a node whose children are all selected (LEAVC-996)', async () => {
        const fullBranchMocks = [
            _contentMock([_node('branch', [_node('leaf1'), _node('leaf2')]), _node('otherLeaf')]),
            treeDataMock,
        ];
        const {container} = _renderField({
            element: _element({
                multipleValues: true,
                treeSelectionConf: {defaultExpanded: true},
                values: [
                    _backendValue('branch', 'value1'),
                    _backendValue('leaf1', 'value2'),
                    _backendValue('leaf2', 'value3'),
                ],
            }),
            treeMocks: fullBranchMocks,
        });

        const _tagLabels = () =>
            Array.from(container.querySelectorAll('.ant-select-content .kit-id-card-description')).map(
                tag => tag.textContent,
            );

        // Before the tree is loaded antd knows no hierarchy, so this only pins the starting state
        await waitFor(() => expect(_tagLabels()).toHaveLength(3));

        // Opening loads the tree: antd now knows `branch` holds `leaf1` and `leaf2`
        await _openDropdown();

        await waitFor(() => expect(_tagLabels()).toEqual(expect.arrayContaining(['branch', 'leaf1', 'leaf2'])));
        expect(_tagLabels()).toHaveLength(3);
    });

    describe('Group selection buttons', () => {
        /** `branch` needs more than one child for a group selection to prove anything. */
        const groupMocks = [
            _contentMock([_node('branch', [_node('leaf1'), _node('leaf2')]), _node('otherLeaf')]),
            treeDataMock,
        ];

        const groupConf = {
            defaultExpanded: true,
            showSelectChildrenButton: true,
            showSelectDescendantsButton: true,
        };

        /**
         * The buttons are revealed by a `:hover` on antd's own row, so what a test can pin is the DOM
         * contract that rule needs: they must sit inside the row of their node. Rendering them in a box
         * narrower than the row is exactly what made them unreachable in the first place.
         */
        test('Renders both buttons inside the row of their own node', async () => {
            _renderField({
                element: _element({multipleValues: true, treeSelectionConf: groupConf}),
                treeMocks: groupMocks,
            });

            await _openDropdown();

            const branchRow = (await _findRichNode('branch')).closest('.ant-select-tree-node-content-wrapper');

            expect(branchRow).not.toBeNull();
            expect(branchRow).toContainElement(screen.getByRole('button', {name: /select_children/}));
            expect(branchRow).toContainElement(screen.getByRole('button', {name: /select_descendants/}));
        });

        test('Hides the buttons when the configuration does not ask for them', async () => {
            _renderField({
                element: _element({multipleValues: true, treeSelectionConf: {defaultExpanded: true}}),
                treeMocks: groupMocks,
            });

            await _openDropdown();
            await _findRichNode('branch');

            expect(screen.queryByRole('button', {name: /select_children/})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /select_descendants/})).not.toBeInTheDocument();
        });

        test('Hides the buttons on a mono-valued attribute, where a group has no meaning', async () => {
            _renderField({element: _element({treeSelectionConf: groupConf}), treeMocks: groupMocks});

            await _openDropdown();
            await _findRichNode('branch');

            expect(screen.queryByRole('button', {name: /select_children/})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /select_descendants/})).not.toBeInTheDocument();
        });

        test('Hides the buttons on a read-only field', async () => {
            _renderField({
                element: _element({multipleValues: true, treeSelectionConf: groupConf}),
                treeMocks: groupMocks,
                readonly: true,
            });

            const combobox = screen.queryByRole('combobox');

            if (combobox) {
                await userEvent.click(combobox);
            }

            expect(screen.queryByRole('button', {name: /select_children/})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /select_descendants/})).not.toBeInTheDocument();
        });

        test('Submits every selectable child in one pass, and selecting a node does not fire on the button', async () => {
            const onValueSubmit = vi
                .fn()
                .mockResolvedValueOnce(_submitSuccess('leaf1', 'value1'))
                .mockResolvedValueOnce(_submitSuccess('leaf2', 'value2'));
            _renderField({
                element: _element({multipleValues: true, treeSelectionConf: groupConf}),
                treeMocks: groupMocks,
                onValueSubmit,
            });

            await _openDropdown();
            await userEvent.click(screen.getByRole('button', {name: /select_children/}));

            await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(2));
            // `branch` itself is not selected: the click on the button never reaches the node
            expect(onValueSubmit.mock.calls.map(([values]) => values[0].value.id)).toEqual(['leaf1', 'leaf2']);
        });

        test('Unselects the children already selected, leaving the other values alone', async () => {
            const onValueDelete = vi.fn().mockResolvedValue({status: APICallStatus.SUCCESS});
            _renderField({
                element: _element({
                    multipleValues: true,
                    treeSelectionConf: groupConf,
                    values: [
                        _backendValue('leaf1', 'value1'),
                        _backendValue('leaf2', 'value2'),
                        _backendValue('otherLeaf', 'value3'),
                    ],
                }),
                treeMocks: groupMocks,
                onValueDelete,
            });

            await _openDropdown();
            await userEvent.click(screen.getByRole('button', {name: /unselect_children/}));

            await waitFor(() => expect(onValueDelete).toHaveBeenCalledTimes(2));
            expect(onValueDelete.mock.calls.map(([{id_value}]) => id_value)).toEqual(['value1', 'value2']);
        });

        /** `deepBranch > midBranch > deepLeaf`: only `deepLeaf` is selectable in `leaves_only`. */
        const deepMocks = [
            _contentMock([_node('deepBranch', [_node('midBranch', [_node('deepLeaf')])]), _node('otherLeaf')]),
            treeDataMock,
        ];

        test('Offers no children button in leaves_only when every child is a branch', async () => {
            const onValueSubmit = vi.fn().mockResolvedValue(_submitSuccess('deepLeaf', 'value1'));
            _renderField({
                element: _element({
                    multipleValues: true,
                    treeSelectionConf: {...groupConf, selectableNodes: TreeSelectableNodes.leaves_only},
                }),
                treeMocks: deepMocks,
                onValueSubmit,
            });

            await userEvent.click(screen.getByRole('combobox'));

            // Scoped to the row of `deepBranch`: `midBranch` does have a selectable child, so it renders
            // its own children button
            const deepBranchRow = within(
                (await _findRichNode('deepBranch')).closest('.ant-select-tree-node-content-wrapper') as HTMLElement,
            );

            // Its only child, `midBranch`, is not selectable: there is nothing to select
            expect(deepBranchRow.queryByRole('button', {name: /select_children/})).not.toBeInTheDocument();

            // Its descendants hold one leaf, which is the only thing the button selects
            await userEvent.click(deepBranchRow.getByRole('button', {name: /select_descendants/}));

            await waitFor(() => expect(onValueSubmit).toHaveBeenCalledTimes(1));
            expect(onValueSubmit.mock.calls[0][0][0].value.id).toBe('deepLeaf');
        });

        test('Keeps the tags plain text, never the rich title (treeNodeLabelProp)', async () => {
            const {container} = _renderField({
                element: _element({
                    multipleValues: true,
                    treeSelectionConf: groupConf,
                    // `leaf1` being selected makes the rich title of `branch` carry a "1" count badge,
                    // so its text differs from the plain label of the very same node
                    values: [_backendValue('branch', 'value1'), _backendValue('leaf1', 'value2')],
                }),
                treeMocks: groupMocks,
            });

            await userEvent.click(screen.getByRole('combobox'));

            // Positive control: the dropdown does render the rich title, count badge included
            expect((await _findRichNode('branch')).textContent).toMatch(/^branch1/);

            const tagLabels = Array.from(
                container.querySelectorAll('.ant-select-content .kit-id-card-description'),
            ).map(tag => tag.textContent);

            expect(tagLabels).toEqual(['branch', 'leaf1']);
        });

        test('Keeps filtering the dropdown on the node label once the title is a ReactNode', async () => {
            const node = _node('nodeId123');
            node.record = {...node.record, whoAmI: {...node.record.whoAmI, label: 'Fraise'}};
            _renderField({
                element: _element({multipleValues: true, treeSelectionConf: groupConf}),
                treeMocks: [_contentMock([node]), treeDataMock],
            });

            await userEvent.click(screen.getByRole('combobox'));
            await _findRichNode('Fraise');

            await userEvent.type(screen.getByRole('combobox'), 'Fraise');
            expect(_displayedNodes()).toEqual(['Fraise']);

            await userEvent.clear(screen.getByRole('combobox'));
            await userEvent.type(screen.getByRole('combobox'), 'nodeId123');
            expect(_displayedNodes()).toEqual([]);
        });
    });
});
