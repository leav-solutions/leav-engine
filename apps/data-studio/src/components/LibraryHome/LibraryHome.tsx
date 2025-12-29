// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {
    ErrorDisplay,
    ErrorDisplayTypes,
    Explorer,
    type IFilter,
    type ISearchSelection,
    LibraryItemsList,
    Loading,
    useLang,
} from '@leav/ui';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useActiveLibrary} from 'hooks/useActiveLibrary';
import useGetLibraryDetailExtendedQuery from 'hooks/useGetLibraryDetailExtendedQuery';
import {setInfoBase} from 'reduxStore/infos';
import {setSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {explorerLinkQueryParamName, explorerLibraryQueryParamName, isLibraryInApp, localizedTranslation} from 'utils';
import {type IBaseInfo, InfoType, SharedStateSelectionType, WorkspacePanels} from '_types/types';
import {useEditRecordModal} from '_ui/components/RecordEdition/EditRecordModal/useEditRecordModal';
import {useApplicationContext} from 'context/ApplicationContext';
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
    const {lang} = useLang();
    const {t} = useTranslation();

    const [params] = useSearchParams();

    const appData = useApplicationContext();
    const dispatch = useAppDispatch();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const {activePanel, selection} = useAppSelector(state => state);

    const {loading, data, error} = useGetLibraryDetailExtendedQuery({library});

    const {EditRecordModal, openEditRecordModal} = useEditRecordModal();

    const hasAccess = data?.libraries?.list[0]?.permissions.access_library;
    const isInApp = isLibraryInApp(appData.currentApp, library);

    useEffect(() => {
        // Update infos about current lib (active library, info message)
        if (
            loading ||
            error ||
            !data?.libraries?.list.length ||
            activePanel !== WorkspacePanels.LIBRARY ||
            !hasAccess
        ) {
            return;
        }

        const currentLibrary = data.libraries.list[0];
        const currentLibLabel = localizedTranslation(currentLibrary.label, lang);

        if (library !== activeLibrary?.id) {
            const {attributes} = currentLibrary;

            updateActiveLibrary({
                id: library,
                name: currentLibLabel,
                behavior: currentLibrary.behavior,
                attributes,
                trees: currentLibrary.linkedTrees,
                permissions: currentLibrary.permissions,
            });
        }

        // Base Notification
        const baseInfo: IBaseInfo = {
            content: t('info.active-lib', {
                lib: currentLibLabel,
                appLabel: localizedTranslation(appData.currentApp.label, lang),
                interpolation: {escapeValue: false},
            }),
            type: InfoType.BASIC,
        };

        dispatch(setInfoBase(baseInfo));
    }, [activeLibrary, data, dispatch, error, lang, library, loading, t, updateActiveLibrary, activePanel, hasAccess]);

    useEffect(() => {
        if (!library) {
            return;
        }

        // Empty selection when changing library
        dispatch(
            setSelection({
                ...selection.selection,
                selected: selection.selection.selected.filter(record => record.library === library),
            }),
        );
    }, [library]);

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

    const _handleSelectChange = (newSelection: ISearchSelection, filters: IFilter[]) => {
        dispatch(
            setSelection({
                ...selection.selection,
                type: SharedStateSelectionType.SEARCH,
                selected: newSelection.selected.filter(record => record.library === library),
                allSelected: newSelection.allSelected,
                filters,
            }),
        );
    };

    return (
        <>
            {params.has(explorerLibraryQueryParamName) ? (
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
                        defaultMassActions={['export', 'editAttribute', 'deactivate']}
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
                        massActions={
                            [
                                // Example :
                                // {
                                //     icon: null,
                                //     label: 'test',
                                //     callback: console.log
                                // }
                            ]
                        }
                        primaryActions={
                            [
                                // Example :
                                // {
                                //     icon: <FaBeer />,
                                //     label: 'Additional action 1',
                                //     callback: () => console.info('Clicked action 1')
                                // }
                            ]
                        }
                    />
                </ExplorerContainerDivStyled>
            ) : params.has(explorerLinkQueryParamName) ? (
                <ExplorerContainerDivStyled>
                    <Explorer
                        showTitle
                        showSearch
                        defaultViewSettings={{enableConfigureView: true}}
                        showFilters
                        showSorts
                        entrypoint={{
                            type: 'link',
                            parentLibraryId: 'sebastien_s_librairy',
                            parentRecordId: '600359434',
                            linkAttributeId: 'multiple_link',
                        }}
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
            ) : (
                <LibraryItemsList
                    selectionMode={false}
                    library={data.libraries.list[0]}
                    key={library}
                    onSelectChange={_handleSelectChange}
                />
            )}
            {EditRecordModal}
        </>
    );
};

export default LibraryHome;
