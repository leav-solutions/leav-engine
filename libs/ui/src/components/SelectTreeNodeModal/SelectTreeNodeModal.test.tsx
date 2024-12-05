// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen, waitFor} from '../../_tests/testUtils';
import SelectTreeNodeModal from './SelectTreeNodeModal';

jest.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: () => <div>SelectTreeNode</div>
}));

describe('SelectTreeNodeModal', () => {
    test('Should render', async () => {
        const onSubmit = jest.fn();

        render(
            <SelectTreeNodeModal
                tree={{id: 'treeId', label: {fr: 'tree'}}}
                isVisible
                onSubmit={onSubmit}
                onClose={jest.fn()}
            />
        );

        expect(screen.getByText('SelectTreeNode')).toBeInTheDocument();

        const applyBtn = screen.getByRole('button', {name: 'global.apply'});

        expect(applyBtn).toBeInTheDocument();

        userEvent.click(applyBtn);

        await waitFor(() => expect(onSubmit).toBeCalled());
    });
});
