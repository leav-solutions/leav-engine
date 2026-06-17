import {KitTabs} from 'aristid-ds';
import {type ComponentProps} from 'react';
import styled, {type CSSObject} from 'styled-components';
import {useGetApplicationByIdQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '../../hooks/useSharedTranslation';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import {EditApplicationInfo} from './EditApplicationInfo';
import {type IEditApplicationProps} from './_types';

const TabContentWrapper = styled.div<{$style?: CSSObject}>`
    ${props => props.$style}
`;

function EditApplication({
    applicationId,
    onSetSubmitFunction,
    tabContentStyle,
    additionalTabs = [],
    activeTab = 'info',
}: IEditApplicationProps): JSX.Element {
    const {t} = useSharedTranslation();
    const isEditing = !!applicationId;

    const {loading, error, data} = useGetApplicationByIdQuery({
        variables: {
            id: applicationId,
        },
        skip: !applicationId,
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

    const tabItems: ComponentProps<typeof KitTabs>['items'] = [
        {
            key: 'info',
            label: t('applications.info'),
            tabContent: <TabContentWrapper style={tabContentStyle}>{appInfoComp}</TabContentWrapper>,
        },
        ...additionalTabs,
    ];

    return <KitTabs items={tabItems} defaultKey={activeTab} />;
}

export default EditApplication;
