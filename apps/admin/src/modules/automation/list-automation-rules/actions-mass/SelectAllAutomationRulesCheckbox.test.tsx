import userEvent from '@testing-library/user-event';
import {render, screen} from '../../../../_tests/testUtils';
import {SelectAllAutomationRulesCheckbox} from './SelectAllAutomationRulesCheckbox';

describe('SelectAllAutomationRulesCheckbox', () => {
    test('a partial selection is rendered as mixed', () => {
        render(
            <SelectAllAutomationRulesCheckbox
                total={5}
                selectedCount={2}
                loading={false}
                onSelectAll={vi.fn()}
                onClearSelection={vi.fn()}
            />,
        );

        expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
    });

    test('a full selection is checked, and a click clears it', async () => {
        const user = userEvent.setup();
        const onClearSelection = vi.fn();

        render(
            <SelectAllAutomationRulesCheckbox
                total={5}
                selectedCount={5}
                loading={false}
                onSelectAll={vi.fn()}
                onClearSelection={onClearSelection}
            />,
        );

        expect(screen.getByRole('checkbox')).toBeChecked();

        await user.click(screen.getByRole('checkbox'));

        expect(onClearSelection).toHaveBeenCalledTimes(1);
    });

    test('an empty selection is unchecked, and a click selects all', async () => {
        const user = userEvent.setup();
        const onSelectAll = vi.fn();

        render(
            <SelectAllAutomationRulesCheckbox
                total={5}
                selectedCount={0}
                loading={false}
                onSelectAll={onSelectAll}
                onClearSelection={vi.fn()}
            />,
        );

        expect(screen.getByRole('checkbox')).not.toBeChecked();

        await user.click(screen.getByRole('checkbox'));

        expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    test('clicking the elements count label toggles the checkbox, not just the box itself', async () => {
        const user = userEvent.setup();
        const onSelectAll = vi.fn();

        render(
            <SelectAllAutomationRulesCheckbox
                total={5}
                selectedCount={0}
                loading={false}
                onSelectAll={onSelectAll}
                onClearSelection={vi.fn()}
            />,
        );

        // TotalResult is rendered as the checkbox's label content: clicking its text must behave
        // exactly like clicking the box, since KitCheckbox wraps its children in a <label>.
        await user.click(screen.getByText('5'));

        expect(onSelectAll).toHaveBeenCalledTimes(1);
    });

    test('total === 0 disables the checkbox', () => {
        render(
            <SelectAllAutomationRulesCheckbox
                total={0}
                selectedCount={0}
                loading={false}
                onSelectAll={vi.fn()}
                onClearSelection={vi.fn()}
            />,
        );

        expect(screen.getByRole('checkbox')).toBeDisabled();
    });
});
