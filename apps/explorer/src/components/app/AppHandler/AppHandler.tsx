// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {getMe} from '../../../graphQL/queries/userData/me';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {useUser} from '../../../hooks/UserHook/UserHook';
import {getSysTranslationQueryLanguage} from '../../../utils';
import {ME} from '../../../_gqlTypes/ME';
import {AvailableLanguage} from '../../../_types/types';
import Router from '../../Router';

function AppHandler(): JSX.Element {
    const {i18n} = useTranslation();

    // Add lang infos to the cache
    const lang = getSysTranslationQueryLanguage(i18n);
    const availableLangs = process.env.REACT_APP_AVAILABLE_LANG
        ? process.env.REACT_APP_AVAILABLE_LANG.split(',').map(l => AvailableLanguage[l as AvailableLanguage])
        : [];

    // Depending on browser, user language might be "fr" or "fr-FR".
    // We don't handle sub-language, thus extract first part only (eg. 'fr')
    const defaultLang = AvailableLanguage?.[i18n.language.split('-')[0]] ?? AvailableLanguage.en;

    const [langInfo, updateLang] = useLang();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const [user, updateUser] = useUser();
    const {data: userData, loading: meLoading, error: meError} = useQuery<ME>(getMe);

    useEffect(() => {
        if (!langInfo.lang.length) {
            updateLang({lang, availableLangs, defaultLang});
        }
    }, [updateLang, langInfo.lang, lang, availableLangs, defaultLang]);

    useEffect(() => {
        if (!activeLibrary) {
            updateActiveLibrary({
                id: '',
                name: '',
                filter: '',
                gql: {
                    searchableFields: '',
                    query: '',
                    type: ''
                },
                trees: []
            });
        }
    }, [updateActiveLibrary, activeLibrary]);

    useEffect(() => {
        if (!user && userData && !meLoading) {
            updateUser({
                userId: userData.me.id,
                userName: userData.me.whoAmI.label || userData.me.login,
                userPermissions: {}
            }); // FIXME: permissions ??
        }
    }, [updateUser, user, meLoading, userData]);

    if (meError) {
        return <ErrorDisplay message={meError.message} />;
    }

    return <Router />;
}

export default AppHandler;
