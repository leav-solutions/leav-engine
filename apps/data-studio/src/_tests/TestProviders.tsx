import {type InMemoryCacheConfig} from '@apollo/client';
import {type MockedResponse} from '@apollo/client/testing';
import {type ILangContext, type IUserContext, LangContext, UserContext} from '@leav/ui';
import ApplicationContext from '../context/ApplicationContext';
import {type IApplicationContext} from '../context/ApplicationContext/_types';
import {type PropsWithChildren} from 'react';
import {type RootState} from '../reduxStore/store';
import {type GET_APPLICATION_BY_ENDPOINT_applications_list} from '../_gqlTypes/GET_APPLICATION_BY_ENDPOINT';
import {type GET_GLOBAL_SETTINGS_globalSettings} from '../_gqlTypes/GET_GLOBAL_SETTINGS';
import {mockApplicationDetails} from '../__mocks__/common/applications';
import MockStore from '../__mocks__/common/mockRedux/mockStore';
import {mockRecord} from '../__mocks__/common/record';
import MockedProviderWithFragments from '../__mocks__/MockedProviderWithFragments';

interface IProvidersProps {
    apolloMocks?: readonly MockedResponse[];
    storeState?: Partial<RootState>;
    cacheSettings?: InMemoryCacheConfig;
    currentApp?: GET_APPLICATION_BY_ENDPOINT_applications_list;
    globalSettings?: GET_GLOBAL_SETTINGS_globalSettings;
}

export const TestProviders = ({
    children,
    apolloMocks,
    storeState,
    cacheSettings,
    currentApp,
    globalSettings,
}: PropsWithChildren<IProvidersProps>) => {
    const appContextData: IApplicationContext = {
        currentApp: currentApp ?? mockApplicationDetails,
        globalSettings: {
            name: 'My App',
            icon: null,
            ...globalSettings,
        },
    };

    const mockLang: ILangContext = {
        lang: ['fr'],
        availableLangs: ['en', 'fr'],
        defaultLang: 'fr',
        setLang: vi.fn(),
    };

    const mockUserContext: IUserContext = {
        userData: {
            userId: '123',
            userWhoAmI: {
                ...mockRecord,
            },
        },
        setUserData: vi.fn(),
    };

    return (
        <MockedProviderWithFragments mocks={apolloMocks} cacheSettings={cacheSettings}>
            <MockStore state={storeState}>
                <LangContext.Provider value={mockLang}>
                    <UserContext.Provider value={mockUserContext}>
                        <ApplicationContext.Provider value={appContextData}>
                            {children ?? <></>}
                        </ApplicationContext.Provider>
                    </UserContext.Provider>
                </LangContext.Provider>
            </MockStore>
        </MockedProviderWithFragments>
    );
};
