// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ErrorDisplay,
    ErrorDisplayTypes,
    Explorer,
    IFilter,
    ISearchSelection,
    LibraryItemsList,
    Loading,
    useLang
} from '@leav/ui';
import {useApplicationContext} from 'context/ApplicationContext';
import {useActiveLibrary} from 'hooks/useActiveLibrary';
import useGetLibraryDetailExtendedQuery from 'hooks/useGetLibraryDetailExtendedQuery';
import {FunctionComponent, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setInfoBase} from 'reduxStore/infos';
import {setSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {explorerLinkQueryParamName, explorerLibraryQueryParamName, isLibraryInApp, localizedTranslation} from 'utils';
import {IBaseInfo, InfoType, SharedStateSelectionType, WorkspacePanels} from '_types/types';
import {useSearchParams} from 'react-router-dom';
import {FaBeer} from 'react-icons/all';
import styled from 'styled-components';

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
                permissions: currentLibrary.permissions
            });
        }

        // Base Notification
        const baseInfo: IBaseInfo = {
            content: t('info.active-lib', {
                lib: currentLibLabel,
                appLabel: localizedTranslation(appData.currentApp.label, lang),
                interpolation: {escapeValue: false}
            }),
            type: InfoType.basic
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
                selected: selection.selection.selected.filter(record => record.library === library)
            })
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
                type: SharedStateSelectionType.search,
                selected: newSelection.selected.filter(record => record.library === library),
                allSelected: newSelection.allSelected,
                filters
            })
        );
    };

    return params.has(explorerLibraryQueryParamName) ? (
        <ExplorerContainerDivStyled>
            <Explorer
                entrypoint={{
                    type: 'library',
                    libraryId: library
                }}
                enableConfigureView
                showFiltersAndSorts
                defaultActionsForItem={['edit', 'remove']}
                defaultPrimaryActions={['create']}
                defaultMassActions={['deactivate']}
                itemActions={[
                    {
                        label: 'Test 1',
                        icon: <FaBeer />,
                        callback: item => console.info(1, item)
                    }
                ]}
                massActions={[
                    {
                        icon: null,
                        label: 'test',
                        callback: console.log
                    }
                ]}
                primaryActions={[
                    {
                        icon: <FaBeer />,
                        label: 'Additional action 1',
                        callback: () => console.info('Clicked action 1')
                    }
                ]}
            />
        </ExplorerContainerDivStyled>
    ) : params.has(explorerLinkQueryParamName) ? (
        <ExplorerContainerDivStyled>
            <Explorer
                enableConfigureView
                showFiltersAndSorts
                entrypoint={{
                    type: 'link',
                    parentLibraryId: 'sebastien_s_librairy',
                    parentRecordId: '600359434',
                    linkAttributeId: 'multiple_link'
                }}
            />
        </ExplorerContainerDivStyled>
    ) : (
        <LibraryItemsList
            selectionMode={false}
            library={data.libraries.list[0]}
            key={library}
            onSelectChange={_handleSelectChange}
        />
    );
};

export default LibraryHome;
