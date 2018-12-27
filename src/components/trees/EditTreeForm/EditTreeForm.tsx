import * as React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import {localizedLabel} from 'src/utils/utils';
import {GET_TREES_trees} from 'src/_gqlTypes/GET_TREES';
import EditTreeInfosForm from '../EditTreeInfosForm';
import TreeStructure from '../TreeStructure';

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
                <Tab.Pane key="infos" className="grow flex-col">
                    <EditTreeInfosForm tree={tree} onSubmit={onSubmit} />
                </Tab.Pane>
            )
        }
    ];

    if (tree !== null) {
        panes.push({
            key: 'structure',
            menuItem: t('trees.structure'),
            render: () => (
                <Tab.Pane key="structure" className="grow">
                    <div className="flex-col" style={{height: '100%'}}>
                        <TreeStructure treeId={tree.id} />
                    </div>
                </Tab.Pane>
            )
        });
    }

    return (
        <React.Fragment>
            <Header className="no-grow">{label}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col" />
        </React.Fragment>
    );
}

export default withNamespaces()(EditTreeForm);
