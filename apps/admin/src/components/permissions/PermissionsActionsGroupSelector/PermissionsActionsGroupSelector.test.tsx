import userEvent from '@testing-library/user-event';
import {PermissionsActions, PermissionTypes} from '../../../_gqlTypes';
import {render, screen} from '../../../_tests/testUtils';
import PermissionsActionsGroupSelector from './PermissionsActionsGroupSelector';

describe('ActionsGroupSelector', () => {
    test('Render test', async () => {
        const onSelect = jest.fn();
        render(
            <PermissionsActionsGroupSelector
                actions={{
                    firstGroup: [PermissionsActions.access_attribute],
                    secondGroup: [PermissionsActions.access_attribute],
                }}
                onSelect={onSelect}
                selectedGroup={null}
                type={PermissionTypes.admin}
            />,
        );

        expect(screen.getByText(/firstGroup/)).toBeInTheDocument();
        expect(screen.getByText(/secondGroup/)).toBeInTheDocument();

        await userEvent.click(screen.getByText(/firstGroup/));

        expect(onSelect).toHaveBeenCalled();
    });
});
