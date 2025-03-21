// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import TreeNodeItem from './TreeNodeItem';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {KitApp} from 'aristid-ds';
import userEvent from '@testing-library/user-event';

describe('TreeNodeItem', () => {
    const mockOnClickToDelete = jest.fn();

    const label = 'Node Label';
    const ancestors = [
        {record: {whoAmI: {label: 'Ancestor 1'}}},
        {record: {whoAmI: {label: 'Ancestor 2'}}}
    ] as RecordFormElementsValueTreeValue['treeValue']['ancestors'];
    const canDelete = true;

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
    });

    it('should display the label', () => {
        render(<TreeNodeItem label={label} ancestors={[]} />);

        expect(screen.getByText('Node Label')).toBeInTheDocument();
    });

    it('should display the label and ancestors', () => {
        render(<TreeNodeItem label={label} ancestors={ancestors} />);

        expect(screen.getByText('Node Label')).toBeInTheDocument();
        expect(screen.getByText('Ancestor 1')).toBeInTheDocument();
        expect(screen.getByText('Ancestor 2')).toBeInTheDocument();
    });

    it('should display the delete button when canDelete is true', () => {
        render(<TreeNodeItem canDelete={canDelete} />);

        expect(screen.getByRole('button', {name: 'global.delete'})).toBeInTheDocument();
    });

    it('should not display the delete button when canDelete is false', () => {
        render(<TreeNodeItem canDelete={!canDelete} />);

        expect(screen.queryByRole('button', {name: 'global.delete'})).not.toBeInTheDocument();
    });

    it('should calls onClickToDelete when delete action is clicked', async () => {
        render(<TreeNodeItem canDelete={canDelete} onClickToDelete={mockOnClickToDelete} />);

        const deleteButton = screen.getByRole('button', {name: 'global.delete'});

        await user.click(deleteButton);

        expect(mockOnClickToDelete).toHaveBeenCalled();
    });
});
