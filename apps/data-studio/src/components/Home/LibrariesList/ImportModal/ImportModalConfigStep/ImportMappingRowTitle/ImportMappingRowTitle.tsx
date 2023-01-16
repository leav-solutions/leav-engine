// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {themeVars} from '@leav/ui';
import {Space} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useImportReducerContext} from '../../importReducer/ImportReducerContext';
import {ISheet, SheetSettingsError} from '../../_types';

interface IImportMappingRowTitleProps {
    sheet: ISheet;
}

const ErrorsWrapper = styled(Space)`
    font-weight: bold;
    margin: 0.5em 0;
    color: ${themeVars.errorColor};
`;

function ImportMappingRowTitle({sheet}: IImportMappingRowTitleProps): JSX.Element {
    const {state} = useImportReducerContext();
    const {t} = useTranslation();
    const settingsError = state?.settingsError?.[sheet.name] ?? [];
    const checkedErrors = [SheetSettingsError.MAPPING, SheetSettingsError.KEY, SheetSettingsError.KEY_TO];

    return (
        <Space direction="vertical">
            {t('import.mapping')}
            <ErrorsWrapper direction="vertical" size="small">
                {checkedErrors.map(err => (settingsError.includes(err) ? t(`import.settings_errors.${err}`) : null))}
            </ErrorsWrapper>
        </Space>
    );
}

export default ImportMappingRowTitle;
