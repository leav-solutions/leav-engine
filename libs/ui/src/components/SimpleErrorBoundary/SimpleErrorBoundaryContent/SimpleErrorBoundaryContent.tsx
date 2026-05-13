import {FrownOutlined} from '@ant-design/icons';
import {Result} from 'antd';
import {type ErrorInfo, type FunctionComponent} from 'react';
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
