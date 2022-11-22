// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient, useMutation} from '@apollo/client';
import {saveUserData} from 'graphQL/mutations/userData/saveUserData';
import {useTranslation} from 'react-i18next';
import {SAVE_USER_DATA, SAVE_USER_DATAVariables} from '_gqlTypes/SAVE_USER_DATA';

export interface IUseSaveUserDataHook {
    saveUserData: (variables: SAVE_USER_DATAVariables) => Promise<void>;
}

export default function useSaveUserDataMutation(): IUseSaveUserDataHook {
    const {cache} = useApolloClient();
    const [executeSaveUserData] = useMutation<SAVE_USER_DATA, SAVE_USER_DATAVariables>(saveUserData);
    const {t} = useTranslation();

    return {
        saveUserData: async variables => {
            const res = await executeSaveUserData({
                variables
            });
        }
    };
}
