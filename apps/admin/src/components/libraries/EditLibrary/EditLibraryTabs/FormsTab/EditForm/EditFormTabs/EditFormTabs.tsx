// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import useLang from '../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../utils';
import {useEditFormContext} from '../hooks/useEditFormContext';
import ContentTab from './ContentTab';
import InfosTab from './InfosTab';

function EditFormTabs(): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {form} = useEditFormContext();

    const isCreationMode = form === null;

    const label = isCreationMode ? t('forms.new') : localizedLabel(form?.label ?? null, lang);

    const panes = [
        {
            key: 'infos',
            mustBeDisplayed: true,
            menuItem: t('forms.informations'),
            render: () => <InfosTab />
        },
        {
            key: 'content',
            mustBeDisplayed: !!form,
            menuItem: t('forms.content'),
            render: () => <ContentTab />
        }
    ].filter(p => p.mustBeDisplayed);

    return (
        <>
            <Header className="no-grow" data-testid="header">
                {label}
            </Header>
            <Tab
                menu={{secondary: true, pointing: true}}
                panes={panes}
                className="grow flex-col height100"
                renderActiveOnly
            />
        </>
    );
}

export default EditFormTabs;
