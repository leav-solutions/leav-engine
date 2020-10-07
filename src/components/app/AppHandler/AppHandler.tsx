import {useApolloClient} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {getActiveLibrary} from '../../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLangAll} from '../../../queries/cache/lang/getLangQuery';
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

    client.writeQuery({
        query: getLangAll,
        data: {lang, availableLangs, defaultLang}
    });

    // Add active library info to the cache
    client.writeQuery({
        query: getActiveLibrary,
        data: {
            activeLib: {
                id: '',
                name: '',
                filter: '',
                gql: {
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
