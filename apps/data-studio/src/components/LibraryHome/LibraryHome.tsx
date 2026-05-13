import {type FunctionComponent} from 'react';
import {ErrorDisplay, ErrorDisplayTypes, Explorer, Loading} from '@leav/ui';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import useGetLibraryDetailExtendedQuery from '../../hooks/useGetLibraryDetailExtendedQuery';
import {isLibraryInApp} from '../../utils';
import {useEditRecordModal} from '_ui/components/RecordEdition/EditRecordModal/useEditRecordModal';
import {useApplicationContext} from '../../context/ApplicationContext';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye} from '@fortawesome/free-solid-svg-icons';

interface ILibraryHomeProps {
    library?: string;
}

const ExplorerContainerDivStyled = styled.div`
    --headerSize: 48px;

    padding: calc(var(--general-spacing-l) * 1px);
    padding-bottom: calc(var(--general-spacing-s) * 1px);
    background-color: var(--general-colors-primary-50);
    height: calc(100vh - var(--headerSize));
`;

const LibraryHome: FunctionComponent<ILibraryHomeProps> = ({library}) => {
    const {t} = useTranslation();

    const appData = useApplicationContext();

    const {loading, data, error} = useGetLibraryDetailExtendedQuery({library});

    const {EditRecordModal, openEditRecordModal} = useEditRecordModal();

    const hasAccess = data?.libraries?.list[0]?.permissions.access_library;
    const isInApp = isLibraryInApp(appData.currentApp, library);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!data?.libraries?.list.length) {
        return <ErrorDisplay message={t('lib_detail.not_found', {libraryId: library})} />;
    }

    if (!hasAccess) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    if (!isInApp) {
        return <ErrorDisplay message={t('items_list.not_in_app')} />;
    }

    return (
        <>
            <ExplorerContainerDivStyled>
                <Explorer
                    entrypoint={{
                        type: 'library',
                        libraryId: library,
                    }}
                    showTitle
                    showSearch
                    showFilters
                    showSorts
                    defaultViewSettings={{enableConfigureView: true}}
                    defaultActionsForItem={['remove', 'activate']}
                    defaultPrimaryActions={['create']}
                    defaultMassActions={['export', 'editAttribute', 'deactivate', 'generatePreviews']}
                    itemActions={[
                        {
                            label: t('explorer.edit-item'),
                            icon: <FontAwesomeIcon icon={faEye} />,
                            useItemActionOnRowClick: true,
                            callback: item => {
                                openEditRecordModal({
                                    library: item.libraryId,
                                    record: {
                                        id: item.itemId,
                                        label: item.whoAmI?.label,
                                        subLabel: item.whoAmI?.subLabel,
                                        color: item.whoAmI?.color,
                                        library: {id: item.libraryId},
                                    },
                                    editionFormId: 'edition',
                                });
                            },
                        },
                    ]}
                />
            </ExplorerContainerDivStyled>
            {EditRecordModal}
        </>
    );
};

export default LibraryHome;
