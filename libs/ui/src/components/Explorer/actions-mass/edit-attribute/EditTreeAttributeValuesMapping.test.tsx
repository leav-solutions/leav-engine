// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {EditTreeAttributeValuesMapping} from './EditTreeAttributeValuesMapping';
import {type AttributeDetailsTreeAttributeFragment, AttributeType} from '_ui/_gqlTypes';
import {type TreeAttributeNodeValue} from './useListTreeAttributeValuesHook';

jest.mock('./EditTreeAttributeValueLine', () => ({
    EditTreeAttributeValueLine: ({valueOccurrenceNodeId, valueOccurrenceCount}) => (
        <div data-testid={`edit-tree-attribute-value-line-${valueOccurrenceNodeId}-count-${valueOccurrenceCount}`}>
            {valueOccurrenceNodeId || 'Undefined'}
        </div>
    ),
}));

jest.mock('./useListTreeAttributeValuesHook', () => ({
    useListTreeAttributeValuesHook: () => [{id: 'node-1'}, {id: 'node-2'}, {id: 'node-3'}] as TreeAttributeNodeValue[],
}));

const mockSelectedAttribute = {
    id: 'attr-1',
    type: AttributeType.tree,
} as AttributeDetailsTreeAttributeFragment;

describe('EditTreeAttributeValuesMapping', () => {
    it('renders a line for each occurrence', () => {
        const setAttributeMapping = jest.fn();

        const mockValuesOccurrences = {
            occurrences: [
                {value: {id: 'node-1'}, count: 42},
                {value: {id: 'node-2'}, count: 43},
            ],
            noValueCount: 0,
        };
        render(
            <EditTreeAttributeValuesMapping
                selectedAttribute={mockSelectedAttribute}
                valuesOccurrences={mockValuesOccurrences}
                setAttributeMapping={setAttributeMapping}
            />,
        );

        expect(screen.getByTestId('edit-tree-attribute-value-line-node-1-count-42')).toBeInTheDocument();
        expect(screen.getByTestId('edit-tree-attribute-value-line-node-2-count-43')).toBeInTheDocument();
        expect(screen.queryByText(/Undefined/)).not.toBeInTheDocument();
    });

    it('renders a line for undefined values if noValueCount > 0', () => {
        const setAttributeMapping = jest.fn();

        const mockValuesOccurrencesWithNoValue = {
            occurrences: [{value: {id: 'node-1'}, count: 44}],
            noValueCount: 3,
        };
        render(
            <EditTreeAttributeValuesMapping
                selectedAttribute={mockSelectedAttribute}
                valuesOccurrences={mockValuesOccurrencesWithNoValue}
                setAttributeMapping={setAttributeMapping}
            />,
        );

        expect(screen.getByTestId('edit-tree-attribute-value-line-node-1-count-44')).toBeInTheDocument();
        expect(screen.getByTestId('edit-tree-attribute-value-line-null-count-3')).toBeInTheDocument();
        expect(screen.queryByText(/Undefined/)).toBeInTheDocument();
    });
});
