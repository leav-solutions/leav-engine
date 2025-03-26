// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FrownOutlined} from '@ant-design/icons';
import {Result} from 'antd';
import {ErrorInfo, FunctionComponent} from 'react';
import styled from 'styled-components';
import {isDevEnv} from '_ui/_utils/isDevEnv';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const ErrorResult = styled(Result)`
    font-size: 1rem;

    .ant-result-content {
        padding: 1rem;
        background: none;

        details {
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 1rem;
        }
    }
`;

interface IErrorBoundaryContentProps {
    error?: Error;
    errorInfo?: ErrorInfo;
}

const SimpleErrorBoundaryContent: FunctionComponent<IErrorBoundaryContentProps> = ({error, errorInfo}) => {
    const {t} = useSharedTranslation();

    return (
        <ErrorResult status="error" title={t('error.error_occurred')} icon={<FrownOutlined />}>
            {isDevEnv() && (
                <details style={{whiteSpace: 'pre-wrap'}}>
                    {error?.toString()}
                    <br />
                    {errorInfo.componentStack}
                </details>
            )}
        </ErrorResult>
    );
};

export default SimpleErrorBoundaryContent;
