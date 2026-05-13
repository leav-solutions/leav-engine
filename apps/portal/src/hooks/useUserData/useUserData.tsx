import UserContext from '../../context/UserContext';
import {useContext} from 'react';
import {type ME_me} from '../../_gqlTypes/ME';

function useUserData(): ME_me {
    const userData = useContext(UserContext);

    if (!userData) {
        throw new Error('useUserData must be used inside a <UserContext.Provider />');
    }

    return userData;
}

export default useUserData;
