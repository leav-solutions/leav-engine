import * as React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import {localizedLabel} from 'src/utils/utils';
import {GET_TREES_trees} from 'src/_gqlTypes/GET_TREES';
import EditTreeInfosForm from '../EditTreeInfosForm';

interface IEditTreeFormProps extends WithNamespaces {
    tree: GET_TREES_trees | null;
    onSubmit: (formData: any) => void;
}

function EditTreeForm({tree, onSubmit, t, i18n: i18next}: IEditTreeFormProps): JSX.Element {
    const label = tree === null ? t('trees.new') : localizedLabel(tree.label, i18next);

    const panes = [
        {
            key: 'infos',
            menuItem: t('trees.informations'),
            render: () => (
                <Tab.Pane key="infos">
                    <EditTreeInfosForm tree={tree} onSubmit={onSubmit} />
                </Tab.Pane>
            )
        },
        {
            key: 'structure',
            menuItem: t('trees.structure'),
            render: () => <Tab.Pane key="structure">CONTENU</Tab.Pane>
        }
    ];

    return (
        <React.Fragment>
            <Header>{label}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} />
        </React.Fragment>
    );
}

export default withNamespaces()(EditTreeForm);
