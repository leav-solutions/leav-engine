// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tabs, TabsProps} from 'antd';
import styled from 'styled-components';
import {useSharedTranslation} from '../../../hooks/useSharedTranslation';
import {LibraryBehavior, SaveLibraryMutation, useGetLibraryByIdQuery} from '../../../_gqlTypes';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';
import {EditLibraryAttributes} from './EditLibraryAttributes';
import {EditLibraryInfo} from './EditLibraryInfo';
import {EditLibraryPreviewsSettings} from './EditLibraryPreviewsSettings';

interface IEditLibraryProps {
    libraryId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<SaveLibraryMutation['saveLibrary']>) => void;
    readOnly?: boolean;
}

const TabContentWrapper = styled.div`
    height: calc(95vh - 15rem);
    overflow-y: auto;
`;

function EditLibrary({libraryId, onSetSubmitFunction, readOnly: isReadOnly}: IEditLibraryProps): JSX.Element {
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
