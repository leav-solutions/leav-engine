// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseCircleFilled, FrownOutlined, MinusCircleFilled} from '@ant-design/icons';
import {Button, Result} from 'antd';
import {ReactNode} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ErrorDisplayTypes} from '../../constants';

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
    const {t, i18n} = useSharedTranslation();
    const navigate = useNavigate();

    const _handleBackHomeClick = () => navigate('/');

    const BackHomeButton = (
        <Button type="primary" onClick={_handleBackHomeClick}>
            {t('global.go_back_home')}
        </Button>
    );

    const errorByType = {
        [ErrorDisplayTypes.ERROR]: {
            title: i18n.isInitialized ? t('error.error_occurred') : 'An error occurred',
            icon: <CloseCircleFilled color="red" />,
            message: '',
            actionButton: null
        },
        [ErrorDisplayTypes.PERMISSION_ERROR]: {
            title: t('error.access_denied'),
            icon: <MinusCircleFilled color="red" />,
            message: t('error.access_denied_details'),
            actionButton: showActionButton ? BackHomeButton : null
        },
        [ErrorDisplayTypes.PAGE_NOT_FOUND]: {
            title: t('error.page_not_found'),
            icon: <FrownOutlined />,
            message: '',
            actionButton: showActionButton ? BackHomeButton : null
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
