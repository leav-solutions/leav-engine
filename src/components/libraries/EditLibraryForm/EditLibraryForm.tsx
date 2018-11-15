import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';
import EditLibraryAttributes from '../EditLibraryAttributes';
import EditLibraryInfosForm from '../EditLibraryInfosForm';

interface IEditLibraryFormProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries | null;
    onSubmit: (formData: any) => void;
}

class EditLibraryForm extends React.Component<IEditLibraryFormProps, any> {
    constructor(props: IEditLibraryFormProps) {
        super(props);

        this.state = {
            ...this.props.library
        };
    }

    public render() {
        const {library, onSubmit} = this.props;
        const {t} = this.props;

        const label =
            library === null
                ? t('libraries.new')
                : library.label !== null
                ? library.label.fr || library.label.en || library.id
                : library.id;

        const panes = [
            {
                key: 'infos',
                menuItem: t('libraries.informations'),
                render: () => (
                    <Tab.Pane key="infos">
                        <EditLibraryInfosForm library={library} onSubmit={onSubmit} />
                    </Tab.Pane>
                )
            },
            {
                key: 'attributes',
                menuItem: t('libraries.attributes'),
                render: () => {
                    return (
                        <Tab.Pane key="attributes">
                            <EditLibraryAttributes library={library} />
                        </Tab.Pane>
                    );
                }
            }
        ];

        return (
            <div>
                <Header>{label}</Header>
                <Tab menu={{secondary: true, pointing: true}} panes={panes} />
            </div>
        );
    }
}

export default withNamespaces()(EditLibraryForm);
