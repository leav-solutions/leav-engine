import {render, screen} from '../../../_tests/testUtils';
import {mockRecord} from '../../../__mocks__/common/record';
import UserMenu from './UserMenu';

describe('UserMenu', () => {
    test('should show username', async () => {
        render(<UserMenu />);

        // Checking label coming from the mocked user context, defined in testUtils.tsx
        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
    });
});
