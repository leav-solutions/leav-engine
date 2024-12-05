// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen} from '../../_tests/testUtils';
import SelectTreeNodeModal from './SelectTreeNodeModal';
import ReactModal from 'react-modal';

jest.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: () => <div>SelectTreeNode</div>
}));

describe('SelectTreeNodeModal', () => {
    test('Should modal with SelectTreeNode inside', async () => {
        const onSubmit = jest.fn();

        ReactModal.setAppElement(document.createElement('div'));

        render(
            <SelectTreeNodeModal
                tree={{id: 'treeId', label: {fr: 'tree'}}}
                isVisible
                onSubmit={onSubmit}
                onClose={jest.fn()}
            />
        );

        expect(screen.getByText('SelectTreeNode')).toBeVisible();

        const applyBtn = screen.getByRole('button', {name: 'global.apply'});

        expect(applyBtn).toBeVisible();

        await userEvent.click(applyBtn);

        expect(onSubmit).toBeCalled();
    });
});
