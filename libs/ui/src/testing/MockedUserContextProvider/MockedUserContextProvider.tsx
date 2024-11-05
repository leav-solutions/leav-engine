// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {UserContext} from '_ui/contexts/UserContext';
import {IUserContext} from '_ui/contexts/UserContext/types';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import {mockRecord} from '_ui/__mocks__/common/record';

function MockedUserContextProvider({children}) {
    const mockUserCtx: IUserContext = {
        userData: {
            userId: '123',
            userWhoAmI: {
                ...mockRecord,
                label: 'Test User',
                id: '123',
                library: {...mockLibrarySimple},
                color: '#000000'
            }
        },
        setUserData: jest.fn()
    };

    return <UserContext.Provider value={mockUserCtx}>{children}</UserContext.Provider>;
}

export default MockedUserContextProvider;
