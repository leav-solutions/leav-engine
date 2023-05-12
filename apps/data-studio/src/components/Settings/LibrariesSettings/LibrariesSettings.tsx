// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ErrorDisplay,
    Loading,
    SubmitStateNotifier,
    SubmitStateNotifierStates,
    useSaveApplicationMutation
} from '@leav/ui';
import {useApplicationContext} from 'context/ApplicationContext';
import {useApplicationLibraries} from 'hooks/useApplicationLibraries';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IApplicationSettings} from '_types/types';
import ModeSelector from '../ModeSelector';
import TabContentWrapper from '../TabContentWrapper';
import LibrariesList from './LibrariesList';

const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;

    h2 {
        margin: 0;
    }
`;

const ListWrapper = styled.div`
    max-width: 800px;
    margin: auto;
`;

function LibrariesSettings(): JSX.Element {
    const {t} = useTranslation();
    const {currentApp} = useApplicationContext();
    const {loading, libraries, error} = useApplicationLibraries({onlyAllowed: false});
    const [saveApplication, {loading: saveLoading, error: saveError}] = useSaveApplicationMutation();
    const [submitState, setSubmitState] = useState<SubmitStateNotifierStates>('idle');

    useEffect(() => {
        if (saveLoading) {
            setSubmitState('processing');
            return;
        }

        if (saveError) {
            setSubmitState('error');
            return;
        }
    }, [saveLoading, saveError]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    const _executeSave = async (settings: IApplicationSettings) => {
        const newSettings = {
            ...currentApp.settings,
            ...settings
        };

        await saveApplication({
            optimisticResponse: {
                saveApplication: {
                    ...currentApp,
                    settings: newSettings
                }
            },
            variables: {
                application: {
                    id: currentApp.id,
                    settings: newSettings
                }
            }
        });

        setSubmitState('success');
    };

    const _handleMoveLibrary = async (libraryId: string, from: number, to: number) => {
        const orderBefore = libraries.map(lib => lib.id);
        const orderAfter = [...orderBefore];

        // Move library to the new position
        orderAfter.splice(from, 1);
        orderAfter.splice(to, 0, libraryId);

        _executeSave({
            librariesOrder: orderAfter
        });
    };

    const _handleSelectionModeChange = async (value: 'all' | 'none' | 'custom') => {
        _executeSave({
            libraries: value === 'custom' ? [] : value,
            librariesOrder: value === 'none' ? [] : currentApp.settings?.librariesOrder
        });
    };

    const _handleRemoveLibrary = async (libraryId: string) => {
        if (currentApp.settings?.libraries === 'all' || currentApp.settings?.libraries === 'none') {
            return;
        }

        _executeSave({
            libraries: (currentApp.settings?.libraries ?? []).filter(id => id !== libraryId),
            librariesOrder: (currentApp.settings?.librariesOrder ?? []).filter(id => id !== libraryId)
        });
    };

    const _handleClearLibraries = async () => {
        if (currentApp.settings?.libraries === 'all' || currentApp.settings?.libraries === 'none') {
            return;
        }

        _executeSave({libraries: [], librariesOrder: []});
    };

    const _handleAddLibrary = async (addedLibraries: string[]) => {
        if (!Array.isArray(currentApp.settings?.libraries)) {
            return;
        }

        _executeSave({
            libraries: [...currentApp.settings?.libraries, ...addedLibraries]
        });
    };

    const currentMode = Array.isArray(currentApp.settings?.libraries)
        ? 'custom'
        : currentApp.settings?.libraries ?? 'all';

    return (
        <TabContentWrapper>
            <TitleWrapper>
                <h2>{t('app_settings.libraries')}</h2>
                <SubmitStateNotifier state={submitState} />
            </TitleWrapper>
            <ModeSelector onChange={_handleSelectionModeChange} entityType="libraries" selectedMode={currentMode} />
            <ListWrapper>
                <LibrariesList
                    libraries={libraries}
                    onMoveLibrary={_handleMoveLibrary}
                    onRemoveLibrary={_handleRemoveLibrary}
                    onAddLibraries={_handleAddLibrary}
                    onClearLibraries={_handleClearLibraries}
                />
            </ListWrapper>
        </TabContentWrapper>
    );
}

export default LibrariesSettings;
