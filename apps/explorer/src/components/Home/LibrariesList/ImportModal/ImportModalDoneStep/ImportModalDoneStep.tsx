// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Result, Typography} from 'antd';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';
import {useAppDispatch, useAppSelector} from 'redux/store';
import {UploadOutlined} from '@ant-design/icons';
import themingVar from 'themingVar';

function ImportModalDoneStep(): JSX.Element {
    const {t} = useTranslation();

    const {state} = useImportReducerContext();
    const {importError} = state;
    const dispatch = useAppDispatch();

    return (
        <Result
            status={importError ? 'error' : 'success'}
            title={importError ? t('import.import_failure') : t('import.import_done')}
            subTitle={importError}
        />
    );
}

export default ImportModalDoneStep;
