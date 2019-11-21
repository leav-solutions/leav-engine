import React from 'react';
import {useTranslation} from 'react-i18next';
import {Header, Tab} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {IFormError} from '../../../_types/errors';
import EditTreeInfosForm from '../EditTreeInfosForm';
import TreeStructure from '../TreeStructure';

interface IEditTreeFormProps {
    tree: GET_TREES_trees_list | null;
    onSubmit: (formData: any) => void;
    readOnly: boolean;
    errors?: IFormError;
    onCheckIdExists: (val: string) => Promise<boolean>;
}

/* tslint:disable-next-line:variable-name */
const EditTreeForm = ({tree, onSubmit, readOnly, errors, onCheckIdExists}: IEditTreeFormProps): JSX.Element => {
    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const label = tree === null ? t('trees.new') : localizedLabel(tree.label, availableLanguages);

    const panes = [
        {
            key: 'infos',
            menuItem: t('trees.informations'),
            render: () => (
                <Tab.Pane key="infos" className="grow flex-col">
                    <EditTreeInfosForm
                        tree={tree}
                        onSubmit={onSubmit}
                        readOnly={readOnly}
                        errors={errors}
                        onCheckIdExists={onCheckIdExists}
                    />
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
                    <div className="flex-col height100">
                        <TreeStructure tree={tree} readOnly={readOnly} withFakeRoot fakeRootLabel={label} />
                    </div>
                </Tab.Pane>
            )
        });
    }

    return (
        <>
            <Header className="no-grow">{label}</Header>
            <Tab menu={{secondary: true, pointing: true}} panes={panes} className="grow flex-col" />
        </>
    );
};

export default EditTreeForm;
