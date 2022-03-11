// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router';
import {Button, Icon, Message, SemanticICONS} from 'semantic-ui-react';

export enum ErrorDisplayTypes {
    ERROR = 'error',
    PERMISSION_ERROR = 'permission_error'
}

interface IErrorDisplayProps {
    message?: string;
    type?: ErrorDisplayTypes;
    actionButton?: JSX.Element;
    showActionButton?: boolean;
}

type IErrorByType = {
    [key in ErrorDisplayTypes]: {
        title: string;
        icon: SemanticICONS;
        message: string;
        actionButton?: ReactNode;
    };
};

function ErrorDisplay({
    message,
    actionButton,
    showActionButton = true,
    type = ErrorDisplayTypes.ERROR
}: IErrorDisplayProps): JSX.Element {
    const {t} = useTranslation();
    const history = useHistory();

    const _handleBackHomeClick = () => history.replace('/');

    const errorByType: IErrorByType = {
        [ErrorDisplayTypes.ERROR]: {
            title: t('errors.error_occurred'),
            icon: 'cancel',
            message: '',
            actionButton: null
        },
        [ErrorDisplayTypes.PERMISSION_ERROR]: {
            title: t('errors.access_denied'),
            icon: 'minus circle',
            message: t('errors.access_denied_details'),
            actionButton: showActionButton ? (
                <Button type="primary" onClick={_handleBackHomeClick}>
                    {t('admin.go_back_home')}
                </Button>
            ) : null
        }
    };

    return (
        <Message negative icon className="error">
            <Icon name={errorByType[type].icon} />
            <Message.Content>
                <Message.Header>{errorByType[type].title}</Message.Header>
                {message ?? errorByType[type].message}
                {actionButton ?? errorByType[type].actionButton}
            </Message.Content>
        </Message>
    );
}

export default ErrorDisplay;
