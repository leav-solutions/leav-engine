// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {getLibsQuery} from 'queries/libraries/getLibrariesQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '_gqlTypes/GET_LIBRARIES';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import ErrorDisplay from '../ErrorDisplay';
import Loading from '../Loading';
import RecordSelector from '../RecordSelector';

interface IFileSelectorProps {
    onChange: (selectedFile: RecordIdentity_whoAmI) => void;
    value: RecordIdentity_whoAmI;
    label: string;
    disabled?: boolean;
}

function FileSelector({label, value, onChange, disabled}: IFileSelectorProps): JSX.Element {
    const {t} = useTranslation();

    const {loading, error, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
        variables: {
            behavior: [LibraryBehavior.files]
        }
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const filesLibraries = data?.libraries?.list ?? [];

    if (!filesLibraries.length) {
        return <ErrorDisplay message={t('file_selector.no_files_libraries')} />;
    }

    return (
        <RecordSelector
            label={label}
            value={value}
            onChange={onChange}
            disabled={disabled}
            libraries={filesLibraries.map(l => l.id)}
        />
    );
}

export default FileSelector;
