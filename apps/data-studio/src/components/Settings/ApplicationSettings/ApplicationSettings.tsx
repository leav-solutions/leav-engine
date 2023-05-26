// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EditApplication, IEditApplicationProps} from '@leav/ui';
import {useApplicationContext} from 'context/ApplicationContext';
import {useTranslation} from 'react-i18next';
import TabContentWrapper from '../TabContentWrapper';
import AdvancedSettings from './AdvancedSettings';

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
        <TabContentWrapper>
            <EditApplication
                applicationId={currentApp.id}
                tabContentStyle={{maxHeight: 'calc(100vh - 10rem)', overflowY: 'auto'}}
                additionalTabs={customTabs}
            />
        </TabContentWrapper>
    );
}

export default ApplicationSettings;
