// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay, ErrorDisplayTypes, Loading, useLang} from '@leav/ui';
import LibraryItemsList from 'components/LibraryItemsList';
import {useApplicationContext} from 'context/ApplicationContext';
import {useActiveLibrary} from 'hooks/ActiveLibHook/ActiveLibHook';
import useGetLibraryDetailExtendedQuery from 'hooks/useGetLibraryDetailExtendedQuery/useGetLibraryDetailExtendedQuery';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {setInfoBase} from 'reduxStore/infos';
import {setSelection} from 'reduxStore/selection';
import {useAppDispatch, useAppSelector} from 'reduxStore/store';
import {isLibraryInApp, localizedTranslation} from 'utils';
import {IBaseInfo, InfoType, WorkspacePanels} from '_types/types';

export interface ILibraryHomeProps {
    library?: string;
}

function LibraryHome({library}: ILibraryHomeProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
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
        // Empty selection when changing library
        dispatch(
            setSelection({
                ...selection.selection,
                selected: selection.selection.selected.filter(record => record.library === library)
            })
        );
    }, []);

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

    return <LibraryItemsList selectionMode={false} library={data.libraries.list[0]} key={library} />;
}

export default LibraryHome;
