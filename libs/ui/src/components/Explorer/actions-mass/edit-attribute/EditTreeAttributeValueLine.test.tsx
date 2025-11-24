// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EditTreeAttributeValueLine} from './EditTreeAttributeValueLine';
import {type AttributeDetailsTreeAttributeFragment, AttributeType} from '_ui/_gqlTypes';
import {type TreeAttributeNodeValue} from './useListTreeAttributeValuesHook';
import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';

const mockTreeNodeValues: TreeAttributeNodeValue[] = [
    {
        id: 'node-1',
        record: {whoAmI: {label: 'Node 1', color: '#ff0000'}},
    },
    {
        id: 'node-2',
        record: {whoAmI: {label: 'Node 2', color: '#00ff00'}},
    },
] as TreeAttributeNodeValue[];

const mockAttribute = {
    id: 'attr-1',
    type: AttributeType.tree,
    required: false,
} as AttributeDetailsTreeAttributeFragment;

describe('EditTreeAttributeValueLine', () => {
    it('renders correctly with valueOccurrenceNodeId, select node-2', async () => {
        const setAttributeMapping = jest.fn();
        render(
            <EditTreeAttributeValueLine
                treeNodeValues={mockTreeNodeValues}
                selectedAttribute={mockAttribute}
                valueOccurrenceNodeId="node-1"
                valueOccurrenceCount={2}
                setAttributeMapping={setAttributeMapping}
            />,
        );
        expect(screen.getByText('Node 1')).toBeInTheDocument();
        expect(screen.getByText('explorer.massAction.editAttribute_value_occurrences_to_edit|2')).toBeInTheDocument();

        const valueSelect = screen.getByRole('combobox');
        await userEvent.click(valueSelect);

        // Vérifie les options du select (ne doit pas contenir "undefined")
        const valueOptions = screen.getAllByRole('option');
        expect(valueOptions).toHaveLength(2);
        expect(valueOptions.map(opt => opt.textContent)).toContain('node-2');
        expect(valueOptions.map(opt => opt.textContent)).toContain('__null__');

        // Simulate select change
        await userEvent.click(screen.getByText('Node 2'));
        expect(setAttributeMapping).toHaveBeenCalledWith('node-1', 'node-2');
    });

    it('renders correctly with valueOccurrenceNodeId, select __null__', async () => {
        const setAttributeMapping = jest.fn();
        render(
            <EditTreeAttributeValueLine
                treeNodeValues={mockTreeNodeValues}
                selectedAttribute={mockAttribute}
                valueOccurrenceNodeId="node-1"
                valueOccurrenceCount={2}
                setAttributeMapping={setAttributeMapping}
            />,
        );

        const valueSelect = screen.getByRole('combobox');
        await userEvent.click(valueSelect);

        // Simulate select change
        await userEvent.click(screen.getByText('explorer.massAction.editAttribute_value_undefined'));
        expect(setAttributeMapping).toHaveBeenCalledWith('node-1', null);
    });

    it('renders does not show undefined option when attribute is required', async () => {
        const setAttributeMapping = jest.fn();
        const requiredAttribute = {
            ...mockAttribute,
            required: true,
        };
        render(
            <EditTreeAttributeValueLine
                treeNodeValues={mockTreeNodeValues}
                selectedAttribute={requiredAttribute}
                valueOccurrenceNodeId="node-1"
                valueOccurrenceCount={1}
                setAttributeMapping={setAttributeMapping}
            />,
        );

        const valueSelect = screen.getByRole('combobox');
        await userEvent.click(valueSelect);

        // Les options du select ne doivent pas contenir "undefined"
        const valueOptions = screen.getAllByRole('option');
        expect(valueOptions).toHaveLength(1);
        expect(valueOptions.map(opt => opt.textContent)).toContain('node-2');
    });

    it('renders correctly without valueOccurrenceNodeId, for undefined values', async () => {
        const setAttributeMapping = jest.fn();
        render(
            <EditTreeAttributeValueLine
                treeNodeValues={mockTreeNodeValues}
                selectedAttribute={mockAttribute}
                valueOccurrenceNodeId={null}
                valueOccurrenceCount={42}
                setAttributeMapping={setAttributeMapping}
            />,
        );
        expect(screen.getByText('explorer.massAction.editAttribute_value_undefined')).toBeInTheDocument();
        expect(screen.getByText('explorer.massAction.editAttribute_value_occurrences_to_edit|42')).toBeInTheDocument();

        const valueSelect = screen.getByRole('combobox');
        await userEvent.click(valueSelect);

        const valueOptions = screen.getAllByRole('option');
        expect(valueOptions).toHaveLength(2);
        expect(valueOptions.map(opt => opt.textContent)).toContain('node-1');
        expect(valueOptions.map(opt => opt.textContent)).toContain('node-2');

        // Simulate select change to node-2
        await userEvent.click(screen.getByText('Node 2'));
        expect(setAttributeMapping).toHaveBeenCalledWith(null, 'node-2');
    });
});
