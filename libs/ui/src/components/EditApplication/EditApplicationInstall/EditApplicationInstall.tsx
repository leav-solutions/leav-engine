// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReloadOutlined} from '@ant-design/icons';
import {Button, Collapse, message, Space} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {themeVars} from '../../../antdTheme';
import {ApplicationInstallStatus, GetApplicationByIdQuery, useInstallApplicationMutation} from '../../../_gqlTypes';
import {ApplicationInstallTag} from '../../ApplicationInstallTag';

interface IEditApplicationInstallProps {
    application: GetApplicationByIdQuery['applications']['list'][number];
}

const TagWrapper = styled.div`
    text-align: center;
    margin: 1rem;
`;

const InstallDetails = styled.div`
    overflow: auto;
    white-space: pre;
    font-family: monospace;
    font-size: 0.9em;
    background-color: ${themeVars.invertedDefaultBg};
    color: ${themeVars.invertedDefaultTextColor};
    padding: 0.5rem;
    border-radius: ${props => props.theme?.antd?.borderRadius ?? 5}px;
`;

function EditApplicationInstall({application}: IEditApplicationInstallProps): JSX.Element {
    const [messageApi, contextHolder] = message.useMessage();
    const {t} = useTranslation('shared');

    const [installApplication, {loading}] = useInstallApplicationMutation({
        variables: {id: application?.id},
        onCompleted: () => {
            messageApi.success(t('applications.re_install_success'));
        }
    });

    const _handleInstallApp = async () => {
        await installApplication();
    };

    return (
        <>
            {contextHolder}
            <Space style={{width: '100%', justifyContent: 'center'}}>
                <TagWrapper>
                    <ApplicationInstallTag
                        application={application}
                        displaySuccessStatus
                        style={{margin: 'auto', fontSize: '1.1em', lineHeight: '1.4em'}}
                    />
                </TagWrapper>
                {application?.install?.status !== ApplicationInstallStatus.RUNNING && (
                    <Button size="small" loading={loading} icon={<ReloadOutlined />} onClick={_handleInstallApp}>
                        {t('applications.re_install')}
                    </Button>
                )}
            </Space>
            {!!application?.install?.lastCallResult && (
                <Collapse defaultActiveKey="install">
                    <Collapse.Panel header={t('applications.install_details')} key="install">
                        <InstallDetails>{application?.install?.lastCallResult}</InstallDetails>
                    </Collapse.Panel>
                </Collapse>
            )}
        </>
    );
}

export default EditApplicationInstall;
