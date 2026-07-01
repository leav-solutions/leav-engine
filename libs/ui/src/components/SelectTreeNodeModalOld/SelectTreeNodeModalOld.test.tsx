import userEvent from '@testing-library/user-event';
import {render, screen} from '../../_tests/testUtils';
import {SelectTreeNodeModalOld} from './SelectTreeNodeModalOld';
import ReactModal from 'react-modal';

vi.mock('_ui/components/SelectTreeNode', () => ({
    SelectTreeNode: () => <div>SelectTreeNode</div>,
}));

describe('SelectTreeNodeModalOld', () => {
    test('Should modal with SelectTreeNode inside', async () => {
        const onSubmit = vi.fn();

        ReactModal.setAppElement(document.createElement('div'));

        render(<SelectTreeNodeModalOld treeId="treeId" isVisible onSubmit={onSubmit} onClose={vi.fn()} />);

        expect(screen.getByText('SelectTreeNode')).toBeVisible();

        const applyBtn = screen.getByRole('button', {name: 'global.apply'});

        expect(applyBtn).toBeVisible();

        await userEvent.click(applyBtn);

        expect(onSubmit).toBeCalled();
    });
});
