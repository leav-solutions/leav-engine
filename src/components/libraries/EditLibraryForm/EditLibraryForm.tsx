import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {IFormError} from '../../../_types/errors';
import EditLibraryAttributes from '../EditLibraryAttributes';
import EditLibraryInfosForm from '../EditLibraryInfosForm';
import EditLibraryPermissions from '../EditLibraryPermissions';

interface IEditLibraryFormProps {
    library: GET_LIBRARIES_libraries_list | null;
    onSubmit: (formData: any) => void;
    onPermsSettingsSubmit: (formData: any) => void;
    readOnly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
}

/* tslint:disable-next-line:variable-name */
const EditLibraryForm = ({
    library,
    onSubmit,
    onPermsSettingsSubmit,
    readOnly,
    errors,
    onCheckIdExists
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
            }
        ]);
    }

    return (
        <>
            <Header className="no-grow">{label}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col height100" />
        </>
    );
};

export default EditLibraryForm;
