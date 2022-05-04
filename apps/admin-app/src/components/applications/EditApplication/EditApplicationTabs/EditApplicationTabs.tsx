// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import GridTab from 'components/shared/GridTab';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import InfosTab from './InfosTab';
import PermissionsTab from './PermissionsTab';

function EditApplicationTabs(): JSX.Element {
    const {t} = useTranslation();
    const {application} = useEditApplicationContext();
    const {lang} = useLang();
    const isNewApp = !application;

    const panes = [
        {
            key: 'infos',
            menuItem: t('applications.information'),
            render: () => (
                <Tab.Pane key="info" className="grow">
                    <InfosTab />
                </Tab.Pane>
            )
        }
    ];

    if (!isNewApp) {
        panes.push({
            key: 'permissions',
            menuItem: t('admin.permissions'),
            render: () => (
                <Tab.Pane key="permissions" className="" style={{display: 'grid'}}>
                    <PermissionsTab />
                </Tab.Pane>
            )
        });
    }

    const headerLabel = application?.label ? localizedTranslation(application.label, lang) : t('applications.new');
    return (
        <>
            <Header content={headerLabel} />
            <GridTab menu={{secondary: true, pointing: true}} panes={panes} />
        </>
    );
}

export default EditApplicationTabs;
