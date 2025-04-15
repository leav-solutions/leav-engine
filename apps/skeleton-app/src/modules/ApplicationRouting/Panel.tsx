// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {Navigate, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import type {IWorkspace, Panel} from './types';
import {Explorer} from '@leav/ui';
import {FaPlus} from 'react-icons/all';
import {IItemData} from '_ui/components/Explorer/_types';

export const PanelComponent: FunctionComponent = () => {
    const {search} = useLocation();
    const {currentPanel, currentWorkspace} = useOutletContext<{currentPanel: Panel; currentWorkspace: IWorkspace}>();

    const navigate = useNavigate();

    if ('content' in currentPanel) {
        if (currentPanel.content.type === 'form') {
            return <span>TODO form</span>;
        }
        if (currentPanel.content.type === 'custom') {
            // TODO: give interaction from iframe to main app to change pages
            return <iframe src={currentPanel.content.iframeSource} />;
        }
        if (currentPanel.content.type === 'explorer') {
            if ('libraryId' in currentPanel.content) {
                if (currentPanel.content.libraryId === '<props>') {
                    return (
                        <Explorer
                            entrypoint={{
                                type: 'library',
                                libraryId: currentWorkspace.entrypoint.libraryId
                            }}
                            itemActions={currentPanel.content.actions.map(action => ({
                                icon: <FaPlus />,
                                label: 'explore',
                                callback: (item: IItemData) => {
                                    navigate(`/${action.what.id}?recordId=${item.itemId}`);
                                }
                            }))}
                        />
                    );
                }
                return (
                    <Explorer
                        entrypoint={{type: 'library', libraryId: currentPanel.content.libraryId}}
                        itemActions={currentPanel.content.actions.map(action => ({
                            icon: <FaPlus />,
                            label: 'explore',
                            callback: (item: IItemData) => {
                                navigate(`/${action.what.id}?recordId=${item.itemId}`);
                            }
                        }))}
                    />
                );
            }
            return <span>TODO heritage</span>;
        }
    }

    if ('children' in currentPanel) {
        return <Navigate to={'/' + currentPanel.children.at(0)?.id + search} replace />;
    }

    return null; // TODO: this case should not happen
};
