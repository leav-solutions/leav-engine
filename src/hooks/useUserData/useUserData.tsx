import {useContext} from 'react';
import UserContext from '../../components/shared/UserContext';
import {IUserContext} from '../../components/shared/UserContext/UserContext';

function useUserData(): IUserContext {
    const userData = useContext(UserContext);

    if (!userData) {
        throw new Error('useUserData must be used inside a <UserContext.Provider />');
    }

    return userData;
}

export default useUserData;
