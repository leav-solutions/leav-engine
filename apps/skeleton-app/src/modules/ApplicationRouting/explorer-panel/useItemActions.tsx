// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer} from '@leav/ui';
import {ComponentProps} from 'react';
import {useNavigate, generatePath, useOutletContext} from 'react-router-dom';
import {recordSearchParamsName, routes} from '../routes';
import {FaPlus} from 'react-icons/fa';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '@leav/ui';
import {EditRecordModalInPopupPanelProps} from './popup-panel/usePopupPanelForm';
import {AddPanel, IApplicationMatchingContext} from '../types';
import {ExplorerInPopupPanelProps} from './popup-panel/usePopupPanelExplorer';
import {PanelCustomInPopupPanelProps} from './popup-panel/usePopupPanelCustom';
import {EditRecordPageInSliderPanelProps} from './slider-panel/useSliderPanelForm';
import {ExplorerInSliderPanelProps} from './slider-panel/useSliderPanelExplorer';
import {PanelCustomInSliderPanelProps} from './slider-panel/useSliderPanelCustom';
import {ItemActions} from '../types';

export const useItemActions = ({
    actions,
    addPanel,
    openPopupPanelForm,
    openPopupPanelExplorer,
    openPopupPanelCustom,
    openSliderPanelForm,
    openSliderPanelExplorer,
    openSliderPanelCustom
}: {
    actions: ItemActions;
    addPanel: AddPanel;
    openPopupPanelForm: (data: EditRecordModalInPopupPanelProps) => void;
    openPopupPanelExplorer: (data: ExplorerInPopupPanelProps) => void;
    openPopupPanelCustom: (data: PanelCustomInPopupPanelProps) => void;
    openSliderPanelForm: (data: EditRecordPageInSliderPanelProps) => void;
    openSliderPanelExplorer: (data: ExplorerInSliderPanelProps) => void;
    openSliderPanelCustom: (data: PanelCustomInSliderPanelProps) => void;
}) => {
    const navigate = useNavigate();
    const {lang} = useLang();
    const {currentWorkspace} = useOutletContext<Omit<IApplicationMatchingContext, 'currentParentTuple'>>();

    const itemActions: ComponentProps<typeof Explorer>['itemActions'] = actions.map(action => ({
        icon: <FaPlus />,
        label: localizedTranslation(action.what.name, lang),
        callback: item => {
            const query = new URLSearchParams({[recordSearchParamsName]: item.itemId});

            switch (action.where) {
                case 'popup':
                    if ('content' in action.what) {
                        if (action.what.content.type === 'creationForm') {
                            openPopupPanelForm({
                                open: true,
                                record: null,
                                creationFormId: action.what.content.formId,
                                library: currentWorkspace.entrypoint.libraryId,
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                onClose: () => {} //TODO: find why mandatory
                            });
                            break;
                        }

                        if (action.what.content.type === 'editionForm') {
                            openPopupPanelForm({
                                open: true,
                                record: {
                                    id: query.get(recordSearchParamsName),
                                    library: {
                                        id: currentWorkspace.entrypoint.libraryId
                                    }
                                },
                                editionFormId: action.what.content.formId,
                                library: currentWorkspace.entrypoint.libraryId,
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                onClose: () => {} //TODO: find why mandatory
                            });
                            break;
                        }

                        if (action.what.content.type === 'explorer') {
                            if ('libraryId' in action.what.content) {
                                let libraryId = action.what.content.libraryId;

                                if (libraryId === '<props>') {
                                    libraryId = currentWorkspace.entrypoint.libraryId;
                                }

                                openPopupPanelExplorer({
                                    open: true,
                                    libraryId,
                                    viewId: action.what.content.viewId,
                                    explorerProps: action.what.content.explorerProps,
                                    actions: action.what.content.actions,
                                    addPanel
                                });
                                break;
                            }

                            openPopupPanelExplorer({
                                open: true,
                                libraryId: currentWorkspace.entrypoint.libraryId,
                                attributeSource: action.what.content.attributeSource,
                                viewId: action.what.content.viewId,
                                explorerProps: action.what.content.explorerProps,
                                actions: action.what.content.actions,
                                recordId: item.itemId,
                                addPanel
                            });
                            break;
                        }

                        if (action.what.content.type === 'custom') {
                            openPopupPanelCustom({
                                open: true,
                                source: action.what.content.iframeSource,
                                search: query.toString(),
                                title: action.what.id,
                                addPanel
                            });
                        }
                    }
                    break;
                case 'slider':
                    if ('content' in action.what) {
                        if (action.what.content.type === 'creationForm') {
                            openSliderPanelForm({
                                open: true,
                                record: null,
                                creationFormId: action.what.content.formId,
                                library: currentWorkspace.entrypoint.libraryId,
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                onClose: () => {} //TODO: find why mandatory
                            });
                            break;
                        }

                        if (action.what.content.type === 'editionForm') {
                            openSliderPanelForm({
                                open: true,
                                record: {
                                    id: query.get(recordSearchParamsName),
                                    library: {
                                        id: currentWorkspace.entrypoint.libraryId
                                    }
                                },
                                editionFormId: action.what.content.formId,
                                library: currentWorkspace.entrypoint.libraryId,
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                onClose: () => {} //TODO: find why mandatory
                            });
                        }

                        if (action.what.content.type === 'explorer') {
                            if ('libraryId' in action.what.content) {
                                let libraryId = action.what.content.libraryId;

                                if (libraryId === '<props>') {
                                    libraryId = currentWorkspace.entrypoint.libraryId;
                                }

                                openSliderPanelExplorer({
                                    open: true,
                                    libraryId,
                                    viewId: action.what.content.viewId,
                                    explorerProps: action.what.content.explorerProps,
                                    actions: action.what.content.actions,
                                    addPanel
                                });
                                break;
                            }

                            openSliderPanelExplorer({
                                open: true,
                                libraryId: currentWorkspace.entrypoint.libraryId,
                                attributeSource: action.what.content.attributeSource,
                                viewId: action.what.content.viewId,
                                explorerProps: action.what.content.explorerProps,
                                actions: action.what.content.actions,
                                recordId: item.itemId,
                                addPanel
                            });
                            break;
                        }

                        if (action.what.content.type === 'custom') {
                            openSliderPanelCustom({
                                open: true,
                                source: action.what.content.iframeSource,
                                search: query.toString(),
                                title: action.what.id,
                                addPanel
                            });
                        }
                    }

                    break;
                case 'fullpage':
                default:
                    navigate(generatePath(routes.panel, {panelId: action.what.id}) + '?' + query.toString());
                    break;
            }
        }
    }));

    // console.log('itemActions', actions, itemActions);

    return {itemActions};
};
