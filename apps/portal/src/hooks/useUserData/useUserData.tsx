// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import UserContext from 'context/UserContext';
import {useContext} from 'react';
import {ME_me} from '_gqlTypes/ME';

function useUserData(): ME_me {
    const userData = useContext(UserContext);

    if (!userData) {
        throw new Error('useUserData must be used inside a <UserContext.Provider />');
    }

    return userData;
}

export default useUserData;
