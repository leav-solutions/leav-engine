// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {DropdownProps, Form} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import {localizedLabel} from '../../../utils/utils';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';

interface ILibrariesSelectorFieldProps extends DropdownProps {
    loading?: boolean;
    libraries: GET_LIBRARIES_libraries_list[] | null;
}

const LibrariesSelectorField = ({loading, libraries, ...fieldProps}: ILibrariesSelectorFieldProps): JSX.Element => {
    const availableLanguages = useLang().lang;
    const options = !!libraries
        ? libraries.map(l => ({key: l.id, value: l.id, text: localizedLabel(l.label, availableLanguages)}))
        : [];

    // TODO: find a cleaner way to remove props from i18n
    delete fieldProps.t;
    delete fieldProps.tReady;
    delete fieldProps.defaultNS;
    delete fieldProps.i18nOptions;
    delete fieldProps.reportNS;

    return <Form.Dropdown {...fieldProps} search options={options} />;
};

LibrariesSelectorField.defaultProps = {
    loading: false,
    libraries: []
};

export default LibrariesSelectorField;
