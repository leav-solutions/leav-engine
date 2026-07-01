import {render, screen} from '_ui/_tests/testUtils';
import TreeField from './TreeField';
import {TreeNodeList} from './display-tree-node/TreeNodeList';
import {useManageTreeNodeSelection} from './manage-tree-node-selection/useManageTreeNodeSelection';
import {AntForm} from 'aristid-ds';
import {
    type CalculatedFlags,
    computeCalculatedFlags,
    computeInheritedFlags,
    type InheritedFlags,
} from '../shared/calculatedInheritedFlags';
import {type FormInstance} from 'antd';
import {mockFormElementTree} from '_ui/__mocks__/common/form';
import {RecordEditionContext} from '../../hooks/useRecordEditionContext';
import {mockRecord} from '_ui/__mocks__/common/record';
import {MockedLangContextProvider} from '_ui/testing';
import {initialState} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {type RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';

const mockInitialState = {...initialState};
const mockedUseFormInstance = vi.mocked(AntForm.useFormInstance);
const mockedTreeNodeList = vi.mocked(TreeNodeList);
const mockedUseManageTreeNodeSelection = vi.mocked(useManageTreeNodeSelection);
const mockedComputeCalculatedFlags = vi.mocked(computeCalculatedFlags);
const mockedComputeInheritedFlags = vi.mocked(computeInheritedFlags);

vi.mock('./display-tree-node/TreeNodeList', () => ({
    TreeNodeList: vi.fn(),
}));

vi.mock('./manage-tree-node-selection/useManageTreeNodeSelection', () => ({
    useManageTreeNodeSelection: vi.fn(),
}));

vi.mock('../shared/calculatedInheritedFlags', () => ({
    computeCalculatedFlags: vi.fn(),
    computeInheritedFlags: vi.fn(),
}));

vi.mock('../shared/useOutsideInteractionDetector', () => ({
    useOutsideInteractionDetector: vi.fn(),
}));

vi.mock('aristid-ds', async () => ({
    ...(await vi.importActual('aristid-ds')),
    AntForm: {
        Item: ({children, noStyle, ...props}: any) => (
            <div data-testid="form-item" {...props}>
                {children}
            </div>
        ),
        useFormInstance: vi.fn(),
    },
}));

vi.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
    state: mockInitialState,
    dispatch: vi.fn(),
}));

describe('TreeField', () => {
    const treeFieldDefaultProps = {
        element: {
            ...mockFormElementTree,
            settings: {
                ...mockFormElementTree.settings,
                label: {fr: 'arbre', en: 'tree'},
            },
            attribute: {
                ...(mockFormElementTree.attribute as RecordFormAttributeTreeAttributeFragment),
                multiple_values: false,
            },
        },
        readonly: false,
        isCreationForm: false,
        onValueSubmit: vi.fn(),
        onValueDelete: vi.fn(),
        onDeleteMultipleValues: vi.fn(),
        metadataEdit: false,
    };

    const recordEditionContextDefaultProps = {
        record: mockRecord,
        readOnly: true,
        elements: null,
    };

    const calculatedFlagsWithoutCalculatedValue: CalculatedFlags = {
        isCalculatedValues: false,
        isCalculatedOverrideValues: false,
        isCalculatedNotOverrideValues: false,
        calculatedValues: null,
    };

    const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
        isInheritedValues: false,
        isInheritedOverrideValues: false,
        isInheritedNotOverrideValues: false,
        inheritedValues: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        Object.assign(mockInitialState, initialState);

        mockedUseFormInstance.mockReturnValue({
            getFieldError: vi.fn().mockReturnValue([]),
        } as unknown as FormInstance);

        mockedComputeCalculatedFlags.mockReturnValue(calculatedFlagsWithoutCalculatedValue);
        mockedComputeInheritedFlags.mockReturnValue(inheritedFlagsWithoutInheritedValue);

        mockedTreeNodeList.mockReturnValue(<div data-testid="tree-node-list">Tree Node List</div>);

        mockedUseManageTreeNodeSelection.mockReturnValue({
            openModal: vi.fn(),
            removeTreeNode: vi.fn(),
            actionButtonLabel: 'Select Tree Node',
            SelectTreeNodeModal: <div data-testid="select-tree-node-modal">Select Tree Node Modal</div>,
            RemoveAllTreeNodes: <div data-testid="remove-all-tree-nodes">Remove All Tree Nodes</div>,
        } as any);
    });

    it('should render with default props', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>,
        );

        expect(screen.getByTestId('tree-node-list')).toBeInTheDocument();
        expect(screen.getByTestId('select-tree-node-modal')).toBeInTheDocument();
        expect(screen.getByTestId('remove-all-tree-nodes')).toBeInTheDocument();
        expect(screen.getByText('Select Tree Node')).toBeInTheDocument();
    });

    it('should call useManageTreeNodeSelection with default props', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>,
        );

        expect(mockedUseManageTreeNodeSelection).toHaveBeenCalled();

        const callArgs = mockedUseManageTreeNodeSelection.mock.calls[0][0];

        expect(callArgs.modaleTitle).toBe('arbre');
        expect(callArgs.attribute).toBe(treeFieldDefaultProps.element.attribute);
        expect(callArgs.backendValues).toEqual(mockFormElementTree.values);
        expect(callArgs.isReadOnly).toBe(false);
        expect(callArgs.isFieldInError).toBe(false);
    });

    it('should call useDisplayTreeNode with default props', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>,
        );

        expect(mockedTreeNodeList).toHaveBeenCalled();

        const callArgs = mockedTreeNodeList.mock.calls[0][0];

        expect(callArgs.attribute).toBe(treeFieldDefaultProps.element.attribute);
        expect(callArgs.backendValues).toEqual(mockFormElementTree.values);
        expect(typeof callArgs.removeTreeNode).toBe('function');
    });

    it('should call useManageTreeNodeSelection with isReadOnly to true', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} readonly={true} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>,
        );

        const callArgs = mockedUseManageTreeNodeSelection.mock.calls[0][0];
        expect(callArgs.isReadOnly).toBe(true);
    });

    it('should call useManageTreeNodeSelection with isFieldInError to true', () => {
        mockedUseFormInstance.mockReturnValue({
            getFieldError: vi.fn().mockReturnValue(['Test error']),
        } as unknown as FormInstance);

        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>,
        );

        const callArgs = mockedUseManageTreeNodeSelection.mock.calls[0][0];
        expect(callArgs.isFieldInError).toBe(true);
    });
});
