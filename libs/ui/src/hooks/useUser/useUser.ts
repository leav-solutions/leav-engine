// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext} from 'react';
import {UserContext} from '_ui/contexts/UserContext';

export const useUser = () => {
    const userContext = useContext(UserContext);

    if (!userContext) {
        throw new Error('useUser must be used inside a <UserContext.Provider />');
    }

    return userContext;
};
