import {UserContext} from '_ui/contexts/UserContext';
import {type IUserContext} from '_ui/contexts/UserContext/types';
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
                color: '#000000',
            },
        },
        setUserData: () => undefined,
    };

    return <UserContext.Provider value={mockUserCtx}>{children}</UserContext.Provider>;
}

export default MockedUserContextProvider;
