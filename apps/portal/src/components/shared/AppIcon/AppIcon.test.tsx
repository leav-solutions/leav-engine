import {render, screen} from '../../../_tests/testUtils';
import AppIcon from './AppIcon';

describe('AppIcon', () => {
    test('Render app icon', async () => {
        render(<AppIcon size="big" />);

        expect(screen.getByRole('img')).toHaveAttribute('src', '/global-icon/big');
    });
});
