// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import {Button, Space} from 'antd';
import styled from 'styled-components';
import themingVar from 'themingVar';

interface IErrorMessageProps {
    error: string | string[];
    onClose: () => void;
}

const ErrorMessageWrapper = styled.div`
    color: ${themingVar['@error-color']};
    font-weight: bold;
`;

const ErrorsList = styled.ul`
    list-style: none;
`;

function ErrorMessage({error, onClose}: IErrorMessageProps): JSX.Element {
    const displayedError = Array.isArray(error) ? (
        <ErrorsList>
            {error.map((e, i) => (
                <li key={i}>{e}</li>
            ))}
        </ErrorsList>
    ) : (
        error
    );

    return (
        <ErrorMessageWrapper>
            <Space size="small" align="start">
                <ExclamationCircleOutlined />
                {displayedError}
                <Button onClick={onClose} size="small" icon={<CloseOutlined />} style={{border: 'none'}} />
            </Space>
        </ErrorMessageWrapper>
    );
}

export default ErrorMessage;
