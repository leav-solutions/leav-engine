// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_tests/testUtils';
import {mockRecord} from '__mocks__/common/record';
import UserMenu from './UserMenu';

const userId = 'testUserId';
const userName = 'testUserName';
jest.mock('../../../hooks/UserHook/UserHook', () => {
    return {
        useUser: () => [
            {
                id: userId,
                userWhoAmI: {...mockRecord}
            },
            jest.fn()
        ]
    };
});

describe('UserMenu', () => {
    test('should show username', async () => {
        await act(async () => {
            render(<UserMenu />);
        });

        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
    });
});
