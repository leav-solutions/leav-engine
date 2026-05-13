import {useContext} from 'react';
import {UserContext} from '_ui/contexts/UserContext';

export const useUser = () => {
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error('useUser must be used inside a <UserContext.Provider />');
    }

    return userContext;
};
