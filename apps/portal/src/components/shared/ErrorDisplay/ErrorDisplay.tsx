// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseCircleFilled, MinusCircleFilled} from '@ant-design/icons';
import {Result} from 'antd';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

export enum ErrorDisplayTypes {
    ERROR = 'error',
    PERMISSION_ERROR = 'permission_error'
}

interface IErrorProps {
    message?: string;
    type?: ErrorDisplayTypes;
    actionButton?: ReactNode;
    showActionButton?: boolean;
}

function ErrorDisplay({
    message,
    actionButton,
    showActionButton = true,
    type = ErrorDisplayTypes.ERROR
}: IErrorProps): JSX.Element {
    const {t} = useTranslation();

    const errorByType = {
        [ErrorDisplayTypes.ERROR]: {
            title: t('error.error_occurred'),
            icon: <CloseCircleFilled color="red" />,
            message: '',
            actionButton: null
        },
        [ErrorDisplayTypes.PERMISSION_ERROR]: {
            title: t('error.access_denied'),
            icon: <MinusCircleFilled color="red" />,
            message: t('error.access_denied_details'),
            actionButton: null
        }
    };

    return (
        <Result
            title={errorByType[type].title}
            subTitle={message ?? errorByType[type].message}
            status="error"
            icon={errorByType[type].icon}
            extra={actionButton ?? errorByType[type].actionButton}
        />
    );
}

export default ErrorDisplay;
