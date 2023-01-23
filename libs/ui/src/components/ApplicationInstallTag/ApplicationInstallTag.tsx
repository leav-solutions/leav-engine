// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined} from '@ant-design/icons';
import {Tag} from 'antd';
import {SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {ApplicationInstallStatus, ApplicationType, GetApplicationByIdQuery} from '../../_gqlTypes';

interface IApplicationInstallTagProps {
    application: Pick<GetApplicationByIdQuery['applications']['list'][number], 'type' | 'install'>;
    displaySuccessStatus?: boolean;
    style?: React.CSSProperties;
    onClick?: (e: SyntheticEvent) => void;
}

function ApplicationInstallTag({
    application,
    displaySuccessStatus = false,
    style,
    onClick
}: IApplicationInstallTagProps): JSX.Element {
    const {t} = useTranslation('shared');

    if (application.type === ApplicationType.external) {
        return null;
    }

    let installTagProps: {icon: JSX.Element; color: string; label: string} = null;
    switch (application.install?.status) {
        case ApplicationInstallStatus.NONE:
            installTagProps = {
                icon: <ClockCircleOutlined />,
                color: 'warning',
                label: t('applications.install_waiting')
            };
            break;
        case ApplicationInstallStatus.RUNNING:
            installTagProps = {
                icon: <SyncOutlined spin />,
                color: 'processing',
                label: t('applications.install_processing')
            };
            break;
        case ApplicationInstallStatus.ERROR:
            installTagProps = {
                icon: <CloseCircleOutlined />,
                color: 'error',
                label: t('applications.install_error')
            };
            break;
        case ApplicationInstallStatus.SUCCESS:
            installTagProps = displaySuccessStatus
                ? {
                      icon: <CheckCircleOutlined />,
                      color: 'success',
                      label: t('applications.install_success')
                  }
                : null;
            break;
    }

    return installTagProps ? (
        <Tag
            icon={installTagProps.icon}
            color={installTagProps.color}
            style={{cursor: onClick ? 'pointer' : 'inherit', ...style}}
            onClick={onClick}
        >
            {installTagProps.label}
        </Tag>
    ) : null;
}

export default ApplicationInstallTag;
