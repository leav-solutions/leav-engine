// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tabs, TabsProps} from 'antd';
import {useTranslation} from 'react-i18next';
import {SaveLibraryMutation, useGetLibraryByIdQuery} from '../../../_gqlTypes';
import {ErrorDisplay} from '../../ErrorDisplay';
import {Loading} from '../../Loading';
import {EditLibraryAttributes} from './EditLibraryAttributes';
import {EditLibraryInfo} from './EditLibraryInfo';

interface IEditLibraryProps {
    libraryId?: string;
    onSetSubmitFunction?: (submitFunction: () => Promise<SaveLibraryMutation['saveLibrary']>) => void;
}

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

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const libraryData = data?.libraries?.list[0] ?? null;

    const libraryInfoComp = <EditLibraryInfo library={libraryData} onSetSubmitFunction={onSetSubmitFunction} />;

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
            children: libraryInfoComp
        },
        {
            key: 'attributes',
            label: t('libraries.attributes'),
            children: <EditLibraryAttributes library={libraryData} />
        }
    ];

    return <Tabs items={tabs} />;
}

export default EditLibrary;
