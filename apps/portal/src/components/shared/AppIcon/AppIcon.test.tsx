import {render, screen} from '../../../_tests/testUtils';
import AppIcon from './AppIcon';

describe('AppIcon', () => {
    test('Render app icon', async () => {
        render(<AppIcon size="big" />);

        // The icon is decorative (alt=""), so its ARIA role is `presentation`, not `img`
        expect(screen.getByRole('presentation')).toHaveAttribute('src', '/global-icon/big');
    });
});
