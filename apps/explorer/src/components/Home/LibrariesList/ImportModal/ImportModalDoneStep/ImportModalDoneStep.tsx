// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Result, Button} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';

interface IImportModalDoneStepProps {
    onOpenPanelClick: () => void;
}

function ImportModalDoneStep({onOpenPanelClick}: IImportModalDoneStepProps): JSX.Element {
    const {t} = useTranslation();

    const {state} = useImportReducerContext();
    const {importError} = state;

    const _handleOpenPanelClick = () => {
        onOpenPanelClick();
    };

    return (
        <Result
            status={importError ? 'error' : 'success'}
            title={importError ? t('import.import_failure') : t('import.import_done')}
            subTitle={importError ? importError : t('import.import_done_description')}
            extra={[
                <Button type="primary" onClick={_handleOpenPanelClick}>
                    {t('import.import_done_open_notifications')}
                </Button>
            ]}
        />
    );
}

export default ImportModalDoneStep;
