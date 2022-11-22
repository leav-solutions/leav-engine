// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FrownOutlined, HomeOutlined, ReloadOutlined} from '@ant-design/icons';
import {Button, Result, Space} from 'antd';
import React, {ErrorInfo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';

interface IErrorBoundaryContentProps {
    error?: Error;
    errorInfo?: ErrorInfo;
    showRecoveryButtons?: boolean;
}

const ErrorResult = styled(Result)`
    font-size: 1rem;

    .ant-result-content {
        padding: 1rem;
        background: none;

        details {
            border: 1px solid ${themingVar['@border-color-base']};
            border-radius: ${themingVar['@border-radius-base']};
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

function ErrorBoundaryContent({error, errorInfo, showRecoveryButtons = true}: IErrorBoundaryContentProps): JSX.Element {
    const {t} = useTranslation();
    const homeUrl = `/${process.env.REACT_APP_ENDPOINT ?? ''}`;
    const _handleRefresh = () => {
        window.location.reload();
    };

    const _handleGoBack = () => {
        window.location.replace(homeUrl);
    };

    return (
        <ErrorResult status="error" title={t('error.error_occurred')} icon={<FrownOutlined />}>
            {showRecoveryButtons && (
                <ButtonsWrapper>
                    <Button onClick={_handleRefresh} type="primary" icon={<ReloadOutlined />}>
                        {t('global.refresh_page')}
                    </Button>
                    <Button onClick={_handleGoBack} type="primary" icon={<HomeOutlined />}>
                        {t('global.go_back_home')}
                    </Button>
                </ButtonsWrapper>
            )}
            <details title="toto" style={{whiteSpace: 'pre-wrap'}}>
                {error && error.toString()}
                <br />
                {errorInfo.componentStack}
            </details>
        </ErrorResult>
    );
}

export default ErrorBoundaryContent;
