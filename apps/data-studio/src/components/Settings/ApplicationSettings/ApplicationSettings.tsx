// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EditApplication, IEditApplicationProps} from '@leav/ui';
import {APPS_BASE_URL} from 'constants/constants';
import {useApplicationContext} from 'context/ApplicationContext';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import AdvancedSettings from './AdvancedSettings';

const Wrapper = styled.div`
    padding: 1rem;
`;

function ApplicationSettings(): JSX.Element {
    const {t} = useTranslation();
    const {currentApp} = useApplicationContext();

    const customTabs: IEditApplicationProps['additionalTabs'] = [
        {
            key: 'advanced_settings',
            label: t('app_settings.advanced_settings'),
            children: <AdvancedSettings />
        }
    ];

    return (
        <Wrapper>
            <EditApplication
                applicationId={currentApp.id}
                appsBaseUrl={APPS_BASE_URL}
                tabContentStyle={{maxHeight: 'calc(100vh - 10rem)', overflowY: 'auto'}}
                additionalTabs={customTabs}
            />
        </Wrapper>
    );
}

export default ApplicationSettings;
