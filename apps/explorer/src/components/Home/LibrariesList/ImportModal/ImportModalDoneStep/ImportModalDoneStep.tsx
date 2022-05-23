// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Result} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';

function ImportModalDoneStep(): JSX.Element {
    const {t} = useTranslation();
    const {state} = useImportReducerContext();
    const {importError} = state;

    console.log({state});

    return (
        <Result
            status={importError ? 'error' : 'success'}
            title={importError ? t('import.import_failure') : t('import.import_success')}
            subTitle={importError}
        />
    );
}

export default ImportModalDoneStep;
