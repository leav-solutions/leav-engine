// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Space} from 'antd';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
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
    const {t} = useSharedTranslation();
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
