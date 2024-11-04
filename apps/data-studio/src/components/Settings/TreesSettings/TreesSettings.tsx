// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ErrorDisplay,
    Loading,
    SubmitStateNotifier,
    SubmitStateNotifierStates,
    useSaveApplicationMutation
} from '@leav/ui';
import {IApplicationSettings} from '_types/types';
import {useApplicationContext} from 'context/ApplicationContext';
import {useApplicationTrees} from 'hooks/useApplicationTrees';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import ModeSelector from '../ModeSelector';
import TabContentWrapper from '../TabContentWrapper';
import TreesList from './TreesList';

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

function TreesSettings(): JSX.Element {
    const {t} = useTranslation();
    const {currentApp} = useApplicationContext();
    const {loading, trees, error} = useApplicationTrees({onlyAllowed: false});
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

    const _handleMoveTree = async (libraryId: string, from: number, to: number) => {
        const orderBefore = trees.map(lib => lib.id);
        const orderAfter = [...orderBefore];

        // Move library to the new position
        orderAfter.splice(from, 1);
        orderAfter.splice(to, 0, libraryId);

        _executeSave({
            treesOrder: orderAfter
        });
    };

    const _handleSelectionModeChange = async (value: 'all' | 'none' | 'custom') => {
        _executeSave({
            trees: value === 'custom' ? [] : value,
            treesOrder: value === 'none' ? [] : currentApp.settings?.treesOrder
        });
    };

    const _handleRemoveTree = async (libraryId: string) => {
        if (currentApp.settings?.trees === 'all' || currentApp.settings?.trees === 'none') {
            return;
        }

        _executeSave({
            trees: (currentApp.settings?.trees ?? []).filter(id => id !== libraryId),
            treesOrder: (currentApp.settings?.treesOrder ?? []).filter(id => id !== libraryId)
        });
    };

    const _handleClearTrees = async () => {
        if (currentApp.settings?.trees === 'all' || currentApp.settings?.trees === 'none') {
            return;
        }

        _executeSave({
            trees: [],
            treesOrder: []
        });
    };

    const _handleAddTree = async (addedTrees: string[]) => {
        if (!Array.isArray(currentApp.settings?.trees)) {
            return;
        }

        _executeSave({
            trees: [...currentApp.settings?.trees, ...addedTrees]
        });
    };

    const currentMode = Array.isArray(currentApp.settings?.trees) ? 'custom' : currentApp.settings?.trees ?? 'all';

    return (
        <TabContentWrapper>
            <TitleWrapper>
                <h2>{t('app_settings.trees')}</h2>
                <SubmitStateNotifier state={submitState} />
            </TitleWrapper>
            <ModeSelector onChange={_handleSelectionModeChange} entityType="trees" selectedMode={currentMode} />
            <ListWrapper>
                <TreesList
                    trees={trees}
                    onMoveTree={_handleMoveTree}
                    onRemoveTree={_handleRemoveTree}
                    onAddTrees={_handleAddTree}
                    onClearTrees={_handleClearTrees}
                />
            </ListWrapper>
        </TabContentWrapper>
    );
}

export default TreesSettings;
