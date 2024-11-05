// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Result} from 'antd';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useImportReducerContext} from '../importReducer/ImportReducerContext';

interface IImportModalDoneStepProps {
    resultExtraButtons?: JSX.Element[];
}

function ImportModalDoneStep({resultExtraButtons}: IImportModalDoneStepProps): JSX.Element {
    const {t} = useSharedTranslation();

    const {state} = useImportReducerContext();
    const {importError} = state;

    return (
        <Result
            status={importError ? 'error' : 'success'}
            title={importError ? t('import.import_failure') : t('import.import_done')}
            subTitle={importError ? importError : t('import.import_done_description')}
            extra={!importError ? resultExtraButtons : []}
        />
    );
}

export default ImportModalDoneStep;
