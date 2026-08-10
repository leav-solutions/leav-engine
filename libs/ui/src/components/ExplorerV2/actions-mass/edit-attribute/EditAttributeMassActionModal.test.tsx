import userEvent from '@testing-library/user-event';
import {render, screen} from '_ui/_tests/testUtils';
import {EditAttributeMassActionModal} from './EditAttributeMassActionModal';

describe('EditAttributeMassActionModal', () => {
    const onOkButtonClick = vi.fn();
    const onCancelButtonClick = vi.fn();

    const _renderModal = (canEdit: boolean) =>
        render(
            <EditAttributeMassActionModal
                isOpen
                bulkCount={12}
                canEdit={canEdit}
                onOkButtonClick={onOkButtonClick}
                onCancelButtonClick={onCancelButtonClick}
            >
                <div>attribute mapping</div>
            </EditAttributeMassActionModal>,
        );

    const _getEditButton = () => screen.getByRole('button', {name: 'global.edit'});

    beforeEach(() => {
        onOkButtonClick.mockClear();
        onCancelButtonClick.mockClear();
    });

    test('should disable the edit button when there is nothing to change', async () => {
        _renderModal(false);

        expect(_getEditButton()).toBeDisabled();

        await userEvent.click(_getEditButton());

        expect(onOkButtonClick).not.toHaveBeenCalled();
    });

    test('should enable the edit button when a change is pending', async () => {
        _renderModal(true);

        expect(_getEditButton()).toBeEnabled();

        await userEvent.click(_getEditButton());

        expect(onOkButtonClick).toHaveBeenCalledTimes(1);
    });

    test('should always allow cancelling', async () => {
        _renderModal(false);

        await userEvent.click(screen.getByRole('button', {name: 'global.cancel'}));

        expect(onCancelButtonClick).toHaveBeenCalledTimes(1);
    });
});
