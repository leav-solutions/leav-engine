// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTabs} from 'aristid-ds';
import {ComponentProps} from 'react';
import styled, {CSSObject} from 'styled-components';
import {useGetApplicationByIdQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '../../hooks/useSharedTranslation';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import {EditApplicationInfo} from './EditApplicationInfo';
import {IEditApplicationProps} from './_types';

const TabContentWrapper = styled.div<{$style?: CSSObject}>`
    ${props => props.$style}
`;

function EditApplication({
    applicationId,
    onSetSubmitFunction,
    tabContentStyle,
    additionalTabs = [],
    activeTab = 'info'
}: IEditApplicationProps): JSX.Element {
    const {t} = useSharedTranslation();
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

    const appInfoComp = <EditApplicationInfo application={application} onSetSubmitFunction={onSetSubmitFunction} />;

    // If creating new application, return the form directly
    if (!isEditing) {
        return appInfoComp;
    }

    const tabs: ComponentProps<typeof KitTabs>['items'] = [
        {
            key: 'info',
            label: t('applications.info'),
            children: <TabContentWrapper style={tabContentStyle}>{appInfoComp}</TabContentWrapper>
        },
        ...additionalTabs
    ];

    return <KitTabs items={tabs} defaultActiveKey={activeTab} />;
}

export default EditApplication;
