// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {filterReducerInitialState} from 'hooks/FiltersStateHook/FilterReducerInitialState';
import {filterStateReducer} from 'hooks/FiltersStateHook/FiltersStateReducer';
import {FilterStateContext} from 'hooks/FiltersStateHook/FilterStateContext';
import {sharedReducerInitialState} from 'hooks/SharedStateHook/SharedReducerInitialState';
import {SharedStateContext} from 'hooks/SharedStateHook/SharedStateContext';
import {sharedStateReducer} from 'hooks/SharedStateHook/SharedStateReducer';
import React, {useEffect, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {useActiveLibrary} from '../../../hooks/ActiveLibHook/ActiveLibHook';
import {useLang} from '../../../hooks/LangHook/LangHook';
import {useUser} from '../../../hooks/UserHook/UserHook';
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

    const [stateFilters, dispatchFilters] = useReducer(filterStateReducer, filterReducerInitialState);
    const [stateShared, dispatchShared] = useReducer(sharedStateReducer, sharedReducerInitialState);

    const [langInfo, updateLang] = useLang();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const [user, updateUser] = useUser();

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
                }
            });
        }
    }, [updateActiveLibrary, activeLibrary]);

    useEffect(() => {
        if (!user) {
            // TODO: get real user ID and name
            const userData = {
                id: '1',
                name: 'Admin',
                permissions: {}
            };

            updateUser({userId: userData.id, userName: userData.name, userPermissions: userData.permissions});
        }
    }, [updateUser, user]);

    return (
        <SharedStateContext.Provider value={{stateShared, dispatchShared}}>
            <FilterStateContext.Provider value={{stateFilters, dispatchFilters}}>
                <Router />
            </FilterStateContext.Provider>
        </SharedStateContext.Provider>
    );
}

export default AppHandler;
