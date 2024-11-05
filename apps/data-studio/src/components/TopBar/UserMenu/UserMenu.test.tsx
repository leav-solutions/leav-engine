// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import UserMenu from './UserMenu';

describe('UserMenu', () => {
    test('should show username', async () => {
        render(<UserMenu />);

        // Checking label coming from the mocked user context, defined in testUtils.tsx
        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
    });
});
