import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import useLang from '../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../utils';
import {GET_FORM_forms_list} from '../../../../../../../_gqlTypes/GET_FORM';
import ContentTab from './ContentTab';
import InfosTab from './InfosTab';

interface IEditFormTabsProps {
    form: GET_FORM_forms_list | null;
    library: string;
    readOnly?: boolean;
}

function EditFormTabs({form, library}: IEditFormTabsProps): JSX.Element {
    const {t} = useTranslation();
    const {lang} = useLang();
    const isCreationMode = form === null;

    const label = isCreationMode ? t('forms.new') : localizedLabel(form?.label, lang);

    const panes = [
        {
            key: 'infos',
            mustBeDisplayed: true,
            menuItem: t('forms.informations'),
            render: () => <InfosTab library={library} form={form} />
        },
        {
            key: 'content',
            mustBeDisplayed: !!form,
            menuItem: t('forms.content'),
            render: () => <ContentTab library={library} form={form!} />
        }
    ].filter(p => p.mustBeDisplayed);

    return (
        <>
            <Header className="no-grow">{label}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col height100" />
        </>
    );
}

export default EditFormTabs;
