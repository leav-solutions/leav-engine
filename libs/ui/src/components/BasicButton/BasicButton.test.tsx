import {render, screen} from '../../_tests/testUtils';
import BasicButton from './BasicButton';

describe('BasicButton', () => {
    test('Render test', async () => {
        render(<BasicButton>My Button</BasicButton>);

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('My Button')).toBeInTheDocument();
    });
});
