// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEditApplicationContext} from 'context/EditApplicationContext';
import React, {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Header, Icon, Segment} from 'semantic-ui-react';
import styled from 'styled-components';
import {ApplicationInstallStatus} from '_gqlTypes/globalTypes';

const Result = styled(Segment)`
    font-family: Monaco, Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace;
    white-space: pre-wrap;
`;

interface IInstallViewProps {
    onInstall: () => void;
    loading: boolean;
}

const InstallHeader = styled(Header)`
    display: flex;
    justify-content: space-between;
    align-content: center;
    align-items: center;
`;

function InstallView({onInstall, loading}: IInstallViewProps): JSX.Element {
    const {application} = useEditApplicationContext();
    const {t} = useTranslation();
    const isReadOnly = !application.permissions?.admin_application;

    const iconByStatus: {[key in ApplicationInstallStatus]: ReactNode} = {
        [ApplicationInstallStatus.NONE]: <Icon name="question circle outline" color="grey" />,
        [ApplicationInstallStatus.RUNNING]: <Icon name="play circle outline" color="orange" />,
        [ApplicationInstallStatus.SUCCESS]: <Icon name="check circle outline" color="green" />,
        [ApplicationInstallStatus.ERROR]: <Icon name="times circle outline" color="red" />
    };

    const _handleClick = () => onInstall();
    const installStatus = application?.install?.status ?? ApplicationInstallStatus.NONE;

    return (
        <>
            <InstallHeader size="small">
                <div>
                    {t('applications.status_label')}: {t(`applications.statuses.${installStatus}`)}{' '}
                    {iconByStatus[installStatus]}
                </div>
                {!isReadOnly && (
                    <Button primary icon loading={loading} labelPosition="left" onClick={_handleClick}>
                        <Icon name="redo alternate" />
                        {t('applications.reinstall')}
                    </Button>
                )}
            </InstallHeader>
            {!loading && <Result inverted>{application?.install?.lastCallResult}</Result>}
        </>
    );
}

export default InstallView;
