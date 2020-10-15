import {History, Location} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab, TabProps} from 'semantic-ui-react';
import useUserData from '../../../../hooks/useUserData';
import {GET_LIBRARIES_libraries_list} from '../../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../../_gqlTypes/globalTypes';
import AttributesTab from './AttributesTab';
import FormsTab from './FormsTab';
import InfosTab from './InfosTab';
import NavigatorTab from './NavigatorTab';
import PermissionsTab from './PermissionsTab';

interface IEditLibraryTabsProps {
    library: GET_LIBRARIES_libraries_list | null;
    readOnly: boolean;
    history: History;
    location?: Location;
}

/* tslint:disable-next-line:variable-name */
const EditLibraryTabs = ({library, readOnly, history, location}: IEditLibraryTabsProps): JSX.Element => {
    const {t} = useTranslation();
    const {permissions} = useUserData();
    const isCreationMode = library === null;

    const label = isCreationMode ? t('libraries.new') : library!.label?.fr || library!.label?.en || library!.id;

    const panes = [
        {
            key: 'infos',
            mustBeDisplayed: true,
            menuItem: t('libraries.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <InfosTab library={library} readonly={readOnly} history={history} />
                </Tab.Pane>
            )
        },
        {
            key: 'permissions',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('libraries.permissions'),
            render: () => {
                return (
                    <Tab.Pane key="permissions" className="grow flex-col height100">
                        <PermissionsTab library={library as GET_LIBRARIES_libraries_list} readonly={readOnly} />
                    </Tab.Pane>
                );
            }
        },
        {
            key: 'attributes',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('libraries.attributes'),
            render: () => {
                return (
                    <Tab.Pane key="attributes" className="grow">
                        <AttributesTab library={library} readOnly={readOnly} />
                    </Tab.Pane>
                );
            }
        },
        {
            key: 'forms',
            mustBeDisplayed: !isCreationMode && permissions[PermissionsActions.app_access_forms],
            menuItem: t('forms.title'),
            render: () => {
                return (
                    <Tab.Pane key="forms" className="height100" style={{padding: '0', border: '0px none'}}>
                        <FormsTab libraryId={library!.id} history={history} />
                    </Tab.Pane>
                );
            }
        },
        {
            key: 'navigator',
            mustBeDisplayed: !isCreationMode,
            menuItem: t('navigator.title'),
            render: () => {
                return (
                    <Tab.Pane key="navigator" className="height100" style={{padding: '0', border: '0px none'}}>
                        <NavigatorTab library={library} />
                    </Tab.Pane>
                );
            }
        }
    ].filter(p => p.mustBeDisplayed);

    const tabName = location ? location.hash.replace('#', '') : undefined;
    const [activeIndex, setActiveIndex] = useState<number | undefined>(
        tabName ? panes.findIndex(p => tabName === p.key) : 0
    );

    const _handleOnTabChange = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: TabProps) => {
        if (data.panes && data.activeIndex !== undefined) {
            setActiveIndex(parseInt(data.activeIndex.toString(), 0));
            history?.push(`#${data.panes[data.activeIndex].key}`);
        }
    };

    return (
        <>
            <Header className="no-grow">{label}</Header>
            <Tab
                activeIndex={activeIndex}
                onTabChange={_handleOnTabChange}
                menu={{secondary: true, pointing: true}}
                panes={panes}
                className="grow flex-col height100"
            />
        </>
    );
};

export default EditLibraryTabs;
