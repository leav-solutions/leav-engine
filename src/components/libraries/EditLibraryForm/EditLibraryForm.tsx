import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';
import EditLibraryAttributes from '../EditLibraryAttributes';
import EditLibraryInfosForm from '../EditLibraryInfosForm';
import EditLibraryPermissions from '../EditLibraryPermissions';

interface IEditLibraryFormProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries | null;
    onSubmit: (formData: any) => void;
    onPermsSettingsSubmit: (formData: any) => void;
    readOnly: boolean;
}

class EditLibraryForm extends React.Component<IEditLibraryFormProps, any> {
    constructor(props: IEditLibraryFormProps) {
        super(props);

        this.state = {
            ...this.props.library
        };
    }

    public render() {
        const {library, onSubmit, onPermsSettingsSubmit, readOnly} = this.props;
        const {t} = this.props;

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
                        <EditLibraryInfosForm library={library} onSubmit={onSubmit} readonly={readOnly} />
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
            <React.Fragment>
                <Header className="no-grow">{label}</Header>
                <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col height100" />
            </React.Fragment>
        );
    }
}

export default withNamespaces()(EditLibraryForm);
