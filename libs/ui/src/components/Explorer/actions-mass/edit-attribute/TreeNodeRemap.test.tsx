import userEvent from '@testing-library/user-event';
import {render, screen} from '_ui/_tests/testUtils';
import {TreeNodeRemap} from './TreeNodeRemap';
import {DO_NOT_CHANGE, type MassEditTargetNode, type MassEditTreeNode} from './_types';

const doNotChangeLabel = 'explorer.massAction.editAttribute_value_do_not_change';

const candidateNodes: MassEditTargetNode[] = [
    {id: 'node_2', label: 'Node two'},
    {id: 'node_3', label: 'Node three'},
];

describe('TreeNodeRemap', () => {
    const setAttributeMapping = vi.fn();

    const _renderTreeNodeRemap = (currentNode: MassEditTreeNode = {id: 'node_1', label: 'Node one'}) =>
        render(
            <TreeNodeRemap
                currentNode={currentNode}
                occurrenceCount={3}
                candidateNodes={candidateNodes}
                setAttributeMapping={setAttributeMapping}
            />,
        );

    const _selectOption = async (label: string) => {
        await userEvent.click(screen.getByRole('combobox'));
        await userEvent.click(screen.getAllByText(label).pop());
    };

    const _getOptionLabels = () =>
        Array.from(document.querySelectorAll('.ant-select-item-option')).map(option => option.textContent);

    beforeEach(() => {
        setAttributeMapping.mockClear();
    });

    test('should default to "do not change"', () => {
        _renderTreeNodeRemap();

        expect(screen.getByText(doNotChangeLabel)).toBeVisible();
        expect(setAttributeMapping).not.toHaveBeenCalled();
    });

    test('should offer "do not change" plus the candidate nodes, and nothing else', async () => {
        _renderTreeNodeRemap();

        await userEvent.click(screen.getByRole('combobox'));

        expect(_getOptionLabels()).toEqual([doNotChangeLabel, 'Node two', 'Node three']);
    });

    test('should map the group to the selected node', async () => {
        _renderTreeNodeRemap();

        await _selectOption('Node two');

        expect(setAttributeMapping).toHaveBeenCalledWith({
            before: 'node_1',
            after: 'node_2',
            occurrenceCount: 3,
        });
    });

    test('should keep the group unchanged instead of clearing it when going back to "do not change"', async () => {
        _renderTreeNodeRemap();

        await _selectOption('Node two');
        await _selectOption(doNotChangeLabel);

        // `after: null` would mean « clear the value » for saveValueBulk — never send it here (LEAVC-1105).
        expect(setAttributeMapping).toHaveBeenLastCalledWith({
            before: 'node_1',
            after: DO_NOT_CHANGE,
            occurrenceCount: 3,
        });
    });

    test('should report a null "before" for the undefined group', async () => {
        _renderTreeNodeRemap({id: null, label: 'explorer.massAction.editAttribute_value_undefined'});

        await _selectOption('Node two');

        expect(setAttributeMapping).toHaveBeenCalledWith({
            before: null,
            after: 'node_2',
            occurrenceCount: 3,
        });
    });
});
