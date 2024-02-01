// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FrownOutlined} from '@ant-design/icons';
import {Result} from 'antd';
import {ErrorInfo} from 'react';
import styled from 'styled-components';

interface IErrorBoundaryContentProps {
    error?: Error;
    errorInfo?: ErrorInfo;
}

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

function SimpleErrorBoundaryContent({error, errorInfo}: IErrorBoundaryContentProps): JSX.Element {
    return (
        <ErrorResult status="error" title="An error occurred" icon={<FrownOutlined />}>
            <details style={{whiteSpace: 'pre-wrap'}}>
                {error && error.toString()}
                <br />
                {errorInfo.componentStack}
            </details>
        </ErrorResult>
    );
}

export default SimpleErrorBoundaryContent;
