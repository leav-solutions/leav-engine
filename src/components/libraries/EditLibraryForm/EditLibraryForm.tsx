import {History, Location} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab, TabProps} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {IFormError} from '../../../_types/errors';
import EditLibraryAttributes from '../EditLibraryAttributes';
import EditLibraryInfosForm from '../EditLibraryInfosForm';
import EditLibraryPermissions from '../EditLibraryPermissions';
import EditableNavigator from './EditableNavigator';

interface IEditLibraryFormProps {
    library: GET_LIBRARIES_libraries_list | null;
    onSubmit: (formData: any) => void;
    onPermsSettingsSubmit: (formData: any) => void;
    readOnly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
    history?: History;
    location?: Location;
}

/* tslint:disable-next-line:variable-name */
const EditLibraryForm = ({
    library,
    onSubmit,
    onPermsSettingsSubmit,
    readOnly,
    errors,
    onCheckIdExists,
    history,
    location
}: IEditLibraryFormProps): JSX.Element => {
    const {t} = useTranslation();
    const label =
        library === null
            ? t('libraries.new')
            : library.label !== null
            ? library.label.fr || library.label.en || library.id
            : library.id;

    let panes = [
        {
            key: 'infos',
            menuItem: t('libraries.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow">
                    <EditLibraryInfosForm
                        library={library}
                        onSubmit={onSubmit}
                        readonly={readOnly}
                        errors={errors}
                        onCheckIdExists={onCheckIdExists}
                    />
                </Tab.Pane>
            )
        }
    ];

    if (library !== null) {
        panes = panes.concat([
            {
                key: 'permissions',
                menuItem: t('libraries.permissions'),
                render: () => {
                    return (
                        <Tab.Pane key="permissions" className="grow flex-col height100">
                            <EditLibraryPermissions
                                library={library}
                                onSubmitSettings={onPermsSettingsSubmit}
                                readOnly={readOnly}
                            />
                        </Tab.Pane>
                    );
                }
            },
            {
                key: 'attributes',
                menuItem: t('libraries.attributes'),
                render: () => {
                    return (
                        <Tab.Pane key="attributes" className="grow">
                            <EditLibraryAttributes library={library} readOnly={readOnly} />
                        </Tab.Pane>
                    );
                }
            },
            {
                key: 'navigator',
                menuItem: t('navigator.title'),
                render: () => {
                    return (
                        <Tab.Pane key="navigator" className="height100" style={{padding: '0', border: '0px none'}}>
                            <EditableNavigator library={library} />
                        </Tab.Pane>
                    );
                }
            }
        ]);
    }

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

export default EditLibraryForm;
