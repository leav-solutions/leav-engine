// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {ApolloProvider} from '@apollo/react-common';
// import {
//     defaultDataIdFromObject,
//     InMemoryCache,
//     IntrospectionFragmentMatcher,
//     IntrospectionResultData
// } from 'apollo-cache-inmemory';
// import {ApolloClient} from 'apollo-client';
import {useQuery} from '@apollo/client';
import {getMe} from 'queries/users/me';
import React, {useState} from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {useTranslation} from 'react-i18next';
import {Message} from 'semantic-ui-react';
import * as yup from 'yup';
import {IS_ALLOWED, IS_ALLOWEDVariables} from '_gqlTypes/IS_ALLOWED';
import {ME} from '_gqlTypes/ME';
import {isAllowedQuery} from '../../../queries/permissions/isAllowedQuery';
import {getSysTranslationQueryLanguage, permsArrayToObject} from '../../../utils/utils';
import {AvailableLanguage, PermissionsActions, PermissionTypes} from '../../../_gqlTypes/globalTypes';
import LangContext from '../../shared/LangContext';
import Loading from '../../shared/Loading';
import UserContext from '../../shared/UserContext';
import {IUserContext} from '../../shared/UserContext/UserContext';
import Home from '../Home';
import MessagesDisplay from '../MessagesDisplay';

const App = (): JSX.Element => {
    const {t, i18n} = useTranslation();
    const {loading, error, data} = useQuery<IS_ALLOWED, IS_ALLOWEDVariables>(isAllowedQuery, {
        variables: {
            type: PermissionTypes.app,
            actions: Object.values(PermissionsActions).filter(a => !!a.match(/^app_/))
        }
    });
    const {data: meData, loading: meLoading, error: meError} = useQuery<ME>(getMe);
    const [lang, setLang] = useState<AvailableLanguage[]>(getSysTranslationQueryLanguage(i18n));

    // Load yup messages translations
    yup.setLocale({
        string: {matches: t('admin.validation_errors.matches')},
        array: {
            min: t('admin.validation_errors.min')
        },
        mixed: {
            required: t('admin.validation_errors.required')
        }
    });

    if (loading || meLoading) {
        return <Loading />;
    }

    if (error || meError || (!loading && !data?.isAllowed) || (!meLoading && !meData?.me)) {
        return (
            <Message negative style={{margin: '2em'}}>
                {error?.message ?? meError?.message ?? t('errors.INTERNAL_ERROR')}
            </Message>
        );
    }

    const userData: IUserContext = {
        id: meData.me.whoAmI.id,
        whoAmI: meData.me.whoAmI,
        permissions: permsArrayToObject(data.isAllowed)
    };

    // const lang = getSysTranslationQueryLanguage(i18n);
    const availableLangs = process.env.REACT_APP_AVAILABLE_LANG
        ? process.env.REACT_APP_AVAILABLE_LANG.split(',').map(l => AvailableLanguage[l])
        : [];

    const defaultLang = process.env.REACT_APP_DEFAULT_LANG
        ? AvailableLanguage[process.env.REACT_APP_DEFAULT_LANG]
        : AvailableLanguage.en;

    return (
        <DndProvider backend={HTML5Backend}>
            <LangContext.Provider value={{lang, availableLangs, defaultLang, setLang}}>
                <UserContext.Provider value={userData}>
                    <div className="App height100">
                        <MessagesDisplay />
                        <Home />
                    </div>
                </UserContext.Provider>
            </LangContext.Provider>
        </DndProvider>
    );
};

export default App;
