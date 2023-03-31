// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tabs, TabsProps} from 'antd';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {useGetApplicationByIdQuery} from '../../_gqlTypes';
import {ErrorDisplay} from '../ErrorDisplay';
import Loading from '../Loading';
import {EditApplicationInfo} from './EditApplicationInfo';
import EditApplicationInstall from './EditApplicationInstall';
import {IEditApplicationProps} from './_types';

const TabContentWrapper = styled.div<{$style?: CSSObject}>`
    ${props => props.$style}
`;

function EditApplication({
    applicationId,
    appsBaseUrl,
    onSetSubmitFunction,
    tabContentStyle,
    additionalTabs = [],
    activeTab = 'info'
}: IEditApplicationProps): JSX.Element {
    const {t} = useTranslation('shared');
    const isEditing = !!applicationId;

    const {loading, error, data} = useGetApplicationByIdQuery({
        variables: {
            id: applicationId
        },
        skip: !applicationId
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const application = data?.applications?.list[0] ?? null;

    const appInfoComp = (
        <EditApplicationInfo
            application={application}
            appsBaseUrl={appsBaseUrl}
            onSetSubmitFunction={onSetSubmitFunction}
        />
    );

    // If creating new application, return the form directly
    if (!isEditing) {
        return appInfoComp;
    }

    const tabs: TabsProps['items'] = [
        {
            key: 'info',
            label: t('applications.info'),
            children: <TabContentWrapper style={tabContentStyle}>{appInfoComp}</TabContentWrapper>
        },
        ...additionalTabs,
        {
            key: 'install',
            label: t('applications.install'),
            children: (
                <TabContentWrapper style={tabContentStyle}>
                    <EditApplicationInstall application={application} />
                </TabContentWrapper>
            )
        }
    ];

    return <Tabs items={tabs} defaultActiveKey={activeTab} />;
}

export default EditApplication;
