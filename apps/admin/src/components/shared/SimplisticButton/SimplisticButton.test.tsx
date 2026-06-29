import userEvent from '@testing-library/user-event';
import {render, screen} from '../../../_tests/testUtils';
import SimplisticButton from './SimplisticButton';

describe('SimplisticButton', () => {
    test('Render test', async () => {
        const _handleClick = vi.fn();
        render(
            <SimplisticButton onClick={_handleClick}>
                <div>Some child</div>
            </SimplisticButton>,
        );

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Some child')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button'));
        expect(_handleClick).toHaveBeenCalledTimes(1);
    });
});
