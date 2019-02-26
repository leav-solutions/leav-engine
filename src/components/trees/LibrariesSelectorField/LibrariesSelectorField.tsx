import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {DropdownProps, Form} from 'semantic-ui-react';
import {localizedLabel} from '../../../utils/utils';
import {GET_LIBRARIES_libraries} from '../../../_gqlTypes/GET_LIBRARIES';

interface ILibrariesSelectorFieldProps extends DropdownProps, WithNamespaces {
    loading?: boolean;
    libraries: GET_LIBRARIES_libraries[] | null;
}

function LibrariesSelectorField({loading, libraries, i18n, ...fieldProps}: ILibrariesSelectorFieldProps): JSX.Element {
    const options = !!libraries
        ? libraries.map(l => ({key: l.id, value: l.id, text: localizedLabel(l.label, i18n)}))
        : [];

    // TODO: find a cleaner way to remove props from i18n
    delete fieldProps.t;
    delete fieldProps.tReady;
    delete fieldProps.defaultNS;
    delete fieldProps.i18nOptions;
    delete fieldProps.reportNS;

    return <Form.Dropdown {...fieldProps} search multiple options={options} />;
}

LibrariesSelectorField.defaultProps = {
    loading: false,
    libraries: []
};

export default withNamespaces()(LibrariesSelectorField);
