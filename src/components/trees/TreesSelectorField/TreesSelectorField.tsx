import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {DropdownProps, Form} from 'semantic-ui-react';
import {localizedLabel} from '../../../utils/utils';
import {GET_TREES_trees} from '../../../_gqlTypes/GET_TREES';
import Loading from '../../shared/Loading';

interface IAttributesSelectorFieldProps extends DropdownProps, WithNamespaces {
    loading?: boolean;
    trees: GET_TREES_trees[] | null;
}

function TreesSelectorField({loading, trees, i18n, ...fieldProps}: IAttributesSelectorFieldProps): JSX.Element {
    const options = !!trees ? trees.map(a => ({key: a.id, value: a.id, text: localizedLabel(a.label, i18n)})) : [];

    delete fieldProps.t;
    delete fieldProps.tReady;
    delete fieldProps.defaultNS;
    delete fieldProps.i18nOptions;
    delete fieldProps.reportNS;

    return loading ? <Loading /> : <Form.Dropdown {...fieldProps} search options={options} />;
}

export default withNamespaces()(TreesSelectorField);
