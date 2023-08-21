// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tabs, TabsProps, Spin} from 'antd';
import styled from 'styled-components';
import {useSharedTranslation} from '../../../hooks/useSharedTranslation';
import {LibraryBehavior, SaveLibraryMutation, useGetLibraryByIdQuery} from '../../../_gqlTypes';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';
import {EditLibraryAttributes} from './EditLibraryAttributes';
import {EditLibraryInfo} from './EditLibraryInfo';
import {EditLibraryPreviewsSettings} from './EditLibraryPreviewsSettings';
import {EditLibraryIndexation} from './EditLibraryIndexation';
import {LoadingOutlined} from '@ant-design/icons';

interface IEditLibraryProps {
    libraryId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<SaveLibraryMutation['saveLibrary']>) => void;
    readOnly?: boolean;
    indexationTask?: string;
}

const TabContentWrapper = styled.div`
    height: calc(95vh - 15rem);
    overflow-y: auto;
`;

function EditLibrary({
    libraryId,
    onSetSubmitFunction,
    readOnly: isReadOnly,
    indexationTask
}: IEditLibraryProps): JSX.Element {
    const {t} = useSharedTranslation();
    const isEditing = !!libraryId;

    const {loading, error, data} = useGetLibraryByIdQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            id: libraryId
        },
        skip: !libraryId
    });

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const libraryData = data?.libraries?.list[0] ?? null;
    const libraryInfoComp = (
        <EditLibraryInfo library={libraryData} onSetSubmitFunction={onSetSubmitFunction} readOnly={isReadOnly} />
    );

    // If creating new library, return the form directly
    if (!isEditing) {
        return libraryInfoComp;
    }

    if (!libraryData) {
        return <ErrorDisplay message={t('libraries.unknown_library')} />;
    }

    const tabs: TabsProps['items'] = [
        {
            key: 'info',
            label: t('libraries.info'),
            children: <TabContentWrapper>{libraryInfoComp}</TabContentWrapper>
        },
        {
            key: 'attributes',
            label: t('libraries.attributes'),
            children: (
                <TabContentWrapper>
                    <EditLibraryAttributes library={libraryData} readOnly={isReadOnly} />
                </TabContentWrapper>
            )
        },
        {
            key: 'Indexation',
            label: (
                <span>
                    {!!indexationTask && <LoadingOutlined spin />}
                    {t('libraries.indexation')}
                </span>
            ),
            children: (
                <TabContentWrapper>
                    {
                        <EditLibraryIndexation
                            library={libraryData}
                            indexationTask={indexationTask}
                            readOnly={isReadOnly}
                        />
                    }
                </TabContentWrapper>
            )
        }
    ];

    if (isEditing && libraryData.behavior === LibraryBehavior.files) {
        tabs.push({
            key: 'previews_settings',
            label: t('libraries.previews_settings.title'),
            children: (
                <TabContentWrapper>
                    <EditLibraryPreviewsSettings library={libraryData} readOnly={isReadOnly} />
                </TabContentWrapper>
            )
        });
    }

    return <Tabs items={tabs} />;
}

export default EditLibrary;
