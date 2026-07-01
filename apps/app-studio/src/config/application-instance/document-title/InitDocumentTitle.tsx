import {type FunctionComponent, type PropsWithChildren, useContext, useEffect} from 'react';
import {localizedTranslation} from '@leav/utils';
import {LangContext} from '@leav/ui';
import {useGetApplicationDataByEndpointQuery} from '../../../__generated__';
import {APP_ENDPOINT} from '../../../constants';

export const InitDocumentTitle: FunctionComponent<PropsWithChildren> = ({children}) => {
    const {lang} = useContext(LangContext);

    const {data: applicationData} = useGetApplicationDataByEndpointQuery({
        variables: {endpoint: APP_ENDPOINT},
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
