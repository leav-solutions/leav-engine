// Copyright LEAV Solutions 2017
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
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import useGetLibraryDetailExtendedQuery from 'hooks/useGetLibraryDetailExtendedQuery/useGetLibraryDetailExtendedQuery';
import {FunctionComponent, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {setInfoBase} from 'reduxStore/infos';
import {setSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {explorerQueryParamName, isLibraryInApp, localizedTranslation} from 'utils';
import {IBaseInfo, InfoType, SharedStateSelectionType, WorkspacePanels} from '_types/types';
import {useSearchParams} from 'react-router-dom';
import {KitIcon} from 'aristid-ds';
import {FaAccessibleIcon, FaBeer, FaJs, FaXbox} from 'react-icons/all';

export interface ILibraryHomeProps {
    library?: string;
}

interface IActiveAction {
    key: string;
    modalComp: FunctionComponent;
    modalProps: any;
}

const LibraryHome: FunctionComponent<ILibraryHomeProps> = ({library}) => {
    const {lang} = useLang();
    const {t} = useTranslation();

    const [params] = useSearchParams();

    const appData = useApplicationContext();
    const dispatch = useAppDispatch();
    const [activeLibrary, updateActiveLibrary] = useActiveLibrary();
    const {activePanel, selection} = useAppSelector(state => state);
    const [activeAction, setActiveAction] = useState<IActiveAction | null | undefined>();

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

    const _handleCloseModal = () => setActiveAction(null);

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

    return (
        <>
            {params.has(explorerQueryParamName) ? (
                <Explorer
                    library={library}
                    defaultActionsForItem={['deactivate']}
                    itemActions={[
                        {
                            label: 'Test 1',
                            icon: <FaBeer />,
                            callback: item => {
                                // eslint-disable-next-line no-restricted-syntax
                                console.log(1, item);
                            }
                        },
                        {
                            label: 'Test 2',
                            icon: <FaAccessibleIcon />,
                            callback: item => {
                                // eslint-disable-next-line no-restricted-syntax
                                console.log(2, item);
                            }
                        },
                        {
                            label: 'Test 3',
                            icon: <FaXbox />,
                            callback: item => {
                                // eslint-disable-next-line no-restricted-syntax
                                console.log(3, item);
                            }
                        },
                        {
                            label: 'Test 4',
                            icon: <FaJs />,
                            callback: item => {
                                // eslint-disable-next-line no-restricted-syntax
                                console.log(4, item);
                            }
                        }
                    ]}
                />
            ) : (
                <>
                    <LibraryItemsList
                        selectionMode={false}
                        library={data.libraries.list[0]}
                        key={library}
                        onSelectChange={_handleSelectChange}
                    />
                    {activeAction && (
                        <activeAction.modalComp
                            key={activeAction.key}
                            open
                            onClose={_handleCloseModal}
                            {...activeAction.modalProps}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default LibraryHome;
