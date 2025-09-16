// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext} from 'react';
import {LangContext} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {useLocation, useOutletContext} from 'react-router-dom';
import {fullpageRecordSearchParamsName, popupRecordSearchParamsName, sliderRecordSearchParamsName} from '../routes';
import type {IApplicationMatchingContext, PanelLevel} from '../types';
import {LibraryIdCard} from './LibraryIdCard';
import {RecordIdCard} from './RecordIdCard';

export const usePanelHeader = ({level}: {level: PanelLevel}) => {
    const {currentWorkspace, currentFullpagePanel, currentPopupPanel, currentSliderPanel, currentFullpageParentTuple} =
        useOutletContext<IApplicationMatchingContext>();
    const {lang} = useContext(LangContext);
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);

    const recordSearchParamsName = {
        fullpage: fullpageRecordSearchParamsName,
        popup: popupRecordSearchParamsName,
        slider: sliderRecordSearchParamsName
    }[level];

    const whatMode: 'library' | 'record' = searchParams.has(recordSearchParamsName) ? 'record' : 'library';

    let panelName: string | null = null;
    let recordId: string | null = null;
    let libraryId: string | null = null;
    if (whatMode === 'record') {
        recordId = searchParams.get(recordSearchParamsName);
        libraryId = {
            fullpage: currentFullpageParentTuple?.[0]?.libraryId
                ? currentFullpageParentTuple[0].libraryId === '<props>'
                    ? currentWorkspace.entrypoint.libraryId
                    : currentFullpageParentTuple[0].libraryId
                : null,
            popup: currentFullpagePanel?.content?.libraryId
                ? currentFullpagePanel.content.libraryId === '<props>'
                    ? currentWorkspace.entrypoint.libraryId
                    : currentFullpagePanel.content.libraryId
                : null,
            slider: currentFullpagePanel?.content?.libraryId
                ? currentFullpagePanel.content.libraryId === '<props>'
                    ? currentWorkspace.entrypoint.libraryId
                    : currentFullpagePanel.content.libraryId
                : null
        }[level];
    } else {
        panelName = {
            fullpage: currentFullpagePanel?.name ? localizedTranslation(currentFullpagePanel.name, lang) : null,
            popup: currentPopupPanel?.name ? localizedTranslation(currentPopupPanel.name, lang) : null,
            slider: currentSliderPanel?.name ? localizedTranslation(currentSliderPanel.name, lang) : null
        }[level];
        if (panelName === null) {
            libraryId = {
                fullpage: currentFullpagePanel?.content?.libraryId
                    ? currentFullpagePanel.content.libraryId === '<props>'
                        ? currentWorkspace.entrypoint.libraryId
                        : currentFullpagePanel.content.libraryId
                    : null,
                popup: currentPopupPanel?.content?.libraryId
                    ? currentPopupPanel.content?.libraryId === '<props>'
                        ? currentWorkspace.entrypoint.libraryId
                        : currentPopupPanel.content.libraryId
                    : null,
                slider: currentSliderPanel?.content?.libraryId
                    ? currentSliderPanel.content?.libraryId === '<props>'
                        ? currentWorkspace.entrypoint.libraryId
                        : currentSliderPanel.content.libraryId
                    : null
            }[level];
        }
    }

    return {
        recordId,
        PanelHeaderComponent:
            whatMode === 'library' ? (
                <LibraryIdCard libraryId={libraryId} title={panelName} />
            ) : (
                <RecordIdCard libraryId={libraryId} currentRecordId={recordId} />
            )
    };
};
