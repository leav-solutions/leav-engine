// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FrownOutlined} from '@ant-design/icons';
import {ConfigProvider, Result, Space, theme} from 'antd';
import {ErrorInfo, ReactNode} from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AntdThemeToken, customTheme, themeVars} from '../../../antdTheme';

interface IErrorBoundaryContentProps {
    error?: Error;
    errorInfo?: ErrorInfo;
    recoveryButtons?: ReactNode[];
    showRecoveryButtons?: boolean;
}

const ErrorResult = styled(Result)<{$themeToken: AntdThemeToken}>`
    font-size: 1rem;

    .ant-result-content {
        padding: 1rem;
        background: none;

        details {
            border: 1px solid ${themeVars.borderColor};
            border-radius: ${p => p.$themeToken.borderRadius}px;
            padding: 1rem;
        }
    }
`;

const ButtonsWrapper = styled(Space)`
    && {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
    }
`;

function ErrorBoundaryContent({error, errorInfo, recoveryButtons}: IErrorBoundaryContentProps): JSX.Element {
    const {token} = theme.useToken();
    const {t} = useSharedTranslation();

    return (
        <ConfigProvider theme={customTheme}>
            <ErrorResult status="error" title={t('error.error_occurred')} icon={<FrownOutlined />} $themeToken={token}>
                {!!recoveryButtons?.length && <ButtonsWrapper>{recoveryButtons}</ButtonsWrapper>}
                <details style={{whiteSpace: 'pre-wrap'}}>
                    {error && error.toString()}
                    <br />
                    {errorInfo.componentStack}
                </details>
            </ErrorResult>
        </ConfigProvider>
    );
}

export default ErrorBoundaryContent;
