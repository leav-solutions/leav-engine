import React from 'react';
import {Form} from 'semantic-ui-react';
import useLang from '../../../../hooks/useLang';
import {localizedLabel} from '../../../../utils';
import {type GET_VIEWS_views_list} from '../../../../_gqlTypes/GET_VIEWS';

interface IViewSelectorFieldProps {
    views: GET_VIEWS_views_list[];
}

function ViewSelectorField({views = [], ...fieldProps}: IViewSelectorFieldProps): JSX.Element {
    const availableLanguages = useLang().lang;
    const options = views.map(v => ({key: v.id, value: v.id, text: localizedLabel(v.label, availableLanguages)}));
    options.unshift({key: '', value: '', text: ''});

    return <Form.Dropdown {...fieldProps} search options={options} />;
}

export default ViewSelectorField;
