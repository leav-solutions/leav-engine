import userEvent from '@testing-library/user-event';
import {render, screen} from '../../../_tests/testUtils';
import {DuplicateAutomationRuleButton} from './DuplicateAutomationRuleButton';

describe('DuplicateAutomationRuleButton', () => {
    test('calls onClick without bubbling up to the clickable row', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        const onRowClick = vi.fn();

        render(
            <div onClick={onRowClick}>
                <DuplicateAutomationRuleButton onClick={onClick} />
            </div>,
        );

        await user.click(screen.getByRole('button'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onRowClick).not.toHaveBeenCalled();
    });
});
