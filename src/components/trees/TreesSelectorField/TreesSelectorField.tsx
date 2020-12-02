// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {DropdownProps, Form} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import Loading from '../../shared/Loading';

interface IAttributesSelectorFieldProps extends DropdownProps {
    loading?: boolean;
    trees: GET_TREES_trees_list[] | null;
}

const TreesSelectorField = ({loading, trees, ...fieldProps}: IAttributesSelectorFieldProps): JSX.Element => {
    const availableLanguages = useLang().lang;
    const options = !!trees
        ? trees.map(a => ({key: a.id, value: a.id, text: localizedLabel(a.label, availableLanguages)}))
        : [];

    delete fieldProps.t;
    delete fieldProps.tReady;
    delete fieldProps.defaultNS;
    delete fieldProps.i18nOptions;
    delete fieldProps.reportNS;

    return loading ? <Loading /> : <Form.Dropdown {...fieldProps} search options={options} />;
};

export default TreesSelectorField;
