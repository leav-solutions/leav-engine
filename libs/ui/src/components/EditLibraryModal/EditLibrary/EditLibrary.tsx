// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tabs, TabsProps} from 'antd';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
    PermissionsActions,
    PermissionTypes,
    SaveLibraryMutation,
    useGetLibraryByIdQuery,
    useIsAllowedQuery
} from '../../../_gqlTypes';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';
import {EditLibraryAttributes} from './EditLibraryAttributes';
import {EditLibraryInfo} from './EditLibraryInfo';

interface IEditLibraryProps {
    libraryId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<SaveLibraryMutation['saveLibrary']>) => void;
}

const TabContentWrapper = styled.div`
    height: calc(95vh - 15rem);
`;

function EditLibrary({libraryId, onSetSubmitFunction}: IEditLibraryProps): JSX.Element {
    const {t} = useTranslation('shared');
    const isEditing = !!libraryId;

    const {loading, error, data} = useGetLibraryByIdQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            id: libraryId
        },
        skip: !libraryId
    });

    const {loading: permissionsLoading, error: permissionsError, data: permissionsData} = useIsAllowedQuery({
        fetchPolicy: 'cache-and-network',
        variables: {
            type: PermissionTypes.admin,
            actions: isEditing
                ? [PermissionsActions.admin_edit_library, PermissionsActions.admin_delete_library]
                : [PermissionsActions.admin_create_library]
        }
    });

    if (loading) {
        return <Loading />;
    }

    if (error || permissionsError) {
        return <ErrorDisplay message={error?.message || permissionsError?.message} />;
    }

    const libraryData = data?.libraries?.list[0] ?? null;
    const isReadOnly =
        !permissionsLoading &&
        !permissionsError &&
        !(permissionsData?.isAllowed ?? []).find(p => p.name === PermissionsActions.admin_edit_library).allowed;

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

    return <Tabs items={tabs} />;
}

export default EditLibrary;
