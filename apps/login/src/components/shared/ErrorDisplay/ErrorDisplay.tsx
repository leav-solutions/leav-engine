// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseCircleFilled} from '@ant-design/icons';
import {Result} from 'antd';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface IErrorProps {
    message?: string;
    actionButton?: ReactNode;
}

function ErrorDisplay({message, actionButton}: IErrorProps): JSX.Element {
    const {t} = useTranslation();

    const error = {
        title: t('error.error_occurred'),
        icon: <CloseCircleFilled color="red" />,
        message: '',
        actionButton: null
    };

    return (
        <Result
            title={error.title}
            subTitle={message ?? error.message}
            status="error"
            icon={error.icon}
            extra={actionButton ?? error.actionButton}
        />
    );
}

export default ErrorDisplay;
