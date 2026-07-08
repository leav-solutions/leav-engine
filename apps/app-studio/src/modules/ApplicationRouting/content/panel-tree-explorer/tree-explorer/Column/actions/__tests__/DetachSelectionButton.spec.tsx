import * as leavUi from '@leav/ui';
import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import * as generated from '../../../../../../../../__generated__';
import * as useRefreshTreeContentHook from '../../../hooks/useRefreshTreeContent';
import * as useTreeExplorerStateHook from '../../../store/useTreeExplorerState';
import {DetachSelectionButton} from '../DetachSelectionButton';

describe('DetachSelectionButton', () => {
    const detachFromTreeMock = vi.fn().mockResolvedValue({});
    const openConfirmModalMock = vi.fn();
    const resetSelectionMock = vi.fn();
    const setPathMock = vi.fn();
    const onMessagesMock = vi.fn();

    const selectedNode = {id: 'record-1', nodeId: 'node-1', library: 'my_lib', label: 'My element'};

    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(useTreeExplorerStateHook, 'useTreeExplorerState').mockReturnValue({
            activeTree: {id: 'my_tree'},
            path: [],
            selection: {selected: [selectedNode], parent: null},
            setPath: setPathMock,
            setSelection: vi.fn(),
            resetSelection: resetSelectionMock,
        } as unknown as ReturnType<typeof useTreeExplorerStateHook.useTreeExplorerState>);

        vi.spyOn(generated, 'useRemoveTreeElementMutation').mockReturnValue([
            detachFromTreeMock,
        ] as unknown as ReturnType<typeof generated.useRemoveTreeElementMutation>);

        vi.spyOn(useRefreshTreeContentHook, 'useRefreshTreeContent').mockReturnValue({
            refreshTreeContent: vi.fn(),
        } as unknown as ReturnType<typeof useRefreshTreeContentHook.useRefreshTreeContent>);

        vi.spyOn(leavUi, 'useConfirmModal').mockReturnValue({openConfirmModal: openConfirmModalMock});
    });

    it('opens a dangerous confirmation modal before detaching, then detaches on confirm', async () => {
        render(<DetachSelectionButton onMessages={onMessagesMock} />);

        await userEvent.click(screen.getByRole('button', {name: 'detach-selection'}));

        expect(detachFromTreeMock).not.toHaveBeenCalled();
        expect(openConfirmModalMock).toHaveBeenCalledWith(
            expect.objectContaining({dangerConfirm: true, onOk: expect.any(Function)}),
        );

        await openConfirmModalMock.mock.calls[0][0].onOk();

        expect(detachFromTreeMock).toHaveBeenCalledWith({
            variables: {treeId: 'my_tree', nodeId: 'node-1'},
        });
    });
});
