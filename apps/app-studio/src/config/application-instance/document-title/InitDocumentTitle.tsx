// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useContext, useEffect} from 'react';
import {localizedTranslation} from '@leav/utils';
import {APP_ENDPOINT, LangContext} from '@leav/ui';
import {useGetApplicationInstanceDataByEndpointQuery} from '../../../__generated__';

export const InitDocumentTitle: FunctionComponent = ({children}) => {
    const {lang} = useContext(LangContext);

    const {data: applicationData} = useGetApplicationInstanceDataByEndpointQuery({
        variables: {endpoint: APP_ENDPOINT}
    });

    const currentApp = applicationData?.applications?.list[0];

    useEffect(() => {
        if (!currentApp?.label) {
            return;
        }

        document.title = localizedTranslation(currentApp.label, lang);
    }, [currentApp?.label]);

    return <>{children}</>;
};
