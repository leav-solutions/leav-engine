import {useApolloClient} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useLang} from '../../../hook/LangHook';
import {getActiveLibrary} from '../../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getUser} from '../../../queries/cache/user/userQuery';
import {getSysTranslationQueryLanguage} from '../../../utils';
import {AvailableLanguage} from '../../../_types/types';
import Router from '../../Router';

function AppHandler(): JSX.Element {
    const {i18n} = useTranslation();

    // Add lang infos to the cache
    const lang = getSysTranslationQueryLanguage(i18n);
    const availableLangs = process.env.REACT_APP_AVAILABLE_LANG
        ? process.env.REACT_APP_AVAILABLE_LANG.split(',').map(l => AvailableLanguage[l as AvailableLanguage])
        : [];
    const defaultLang = i18n.language ? AvailableLanguage[i18n.language as AvailableLanguage] : AvailableLanguage.en;

    const client = useApolloClient();

    const [, updateLang] = useLang();

    updateLang({lang, availableLangs, defaultLang});

    // Add active library info to the cache
    client.writeQuery({
        query: getActiveLibrary,
        data: {
            activeLib: {
                id: '',
                name: '',
                filter: '',
                gql: {
                    searchableFields: '',
                    query: '',
                    type: ''
                }
            }
        }
    });

    // Add user info to the cache

    // TODO: get real user ID and name
    const userData = {
        id: 1,
        name: 'Admin',
        permissions: {}
    };

    client.writeQuery({
        query: getUser,
        data: {userId: userData.id, userName: userData.name, userPermissions: userData.permissions}
    });

    return <Router />;
}

export default AppHandler;
