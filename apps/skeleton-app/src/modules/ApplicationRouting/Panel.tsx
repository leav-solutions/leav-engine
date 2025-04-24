// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useEffect, useState} from 'react';
import {generatePath, Navigate, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {EditRecordPage, Explorer} from '@leav/ui';
import {FaPlus} from 'react-icons/all';
import type {IWorkspace, Panel} from './types';
import {recordSearchParamsName, routes} from './routes';
import {useTranslation} from 'react-i18next';
import {SIDEBAR_CONTENT_ID} from '../../constants';

export const PanelComponent: FunctionComponent = () => {
    const {t} = useTranslation();
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {currentPanel, currentWorkspace} = useOutletContext<{currentPanel: Panel; currentWorkspace: IWorkspace}>();

    const navigate = useNavigate();

    const [sidebarContainer, setSidebarContainer] = useState<HTMLElement>();
    useEffect(() => {
        const element = document.getElementById(SIDEBAR_CONTENT_ID);
        if (element) {
            setSidebarContainer(element);
        }
    }, []);

    if ('content' in currentPanel) {
        const commonFormProps: Partial<ComponentProps<typeof EditRecordPage>> = {
            showRefreshButton: false,
            showHeader: false,
            showSidebar: false,
            sidebarContainer
        };
        if (currentPanel.content.type === 'creationForm') {
            return (
                <EditRecordPage
                    {...commonFormProps}
                    record={null}
                    creationFormId={currentPanel.content.formId}
                    library={currentWorkspace.entrypoint.libraryId}
                />
            );
        }
        if (currentPanel.content.type === 'editionForm') {
            return (
                <EditRecordPage
                    {...commonFormProps}
                    record={{
                        id: searchParams.get(recordSearchParamsName),
                        library: {
                            id: currentWorkspace.entrypoint.libraryId
                        }
                    }}
                    editionFormId={currentPanel.content.formId}
                    library={currentWorkspace.entrypoint.libraryId}
                />
            );
        }
        if (currentPanel.content.type === 'custom') {
            // TODO: give interaction from iframe to main app to change pages
            return <iframe src={currentPanel.content.iframeSource} />;
        }
        if (currentPanel.content.type === 'explorer') {
            const itemActions: ComponentProps<typeof Explorer>['itemActions'] = currentPanel.content.actions.map(
                action => ({
                    icon: <FaPlus />,
                    label: t('skeleton.explore'),
                    callback: item => {
                        const query = new URLSearchParams({[recordSearchParamsName]: item.itemId});
                        navigate(generatePath(routes.panel, {panelId: action.what.id}) + '?' + query.toString());
                    }
                })
            );

            if ('libraryId' in currentPanel.content) {
                if (currentPanel.content.libraryId === '<props>') {
                    return (
                        <Explorer
                            entrypoint={{
                                type: 'library',
                                libraryId: currentWorkspace.entrypoint.libraryId
                            }}
                            itemActions={itemActions}
                        />
                    );
                }
                return (
                    <Explorer
                        entrypoint={{type: 'library', libraryId: currentPanel.content.libraryId}}
                        itemActions={itemActions}
                    />
                );
            }
            return (
                <Explorer
                    entrypoint={{
                        type: 'link',
                        linkAttributeId: currentPanel.content.attributeSource,
                        parentLibraryId: currentWorkspace.entrypoint.libraryId,
                        parentRecordId: searchParams.get(recordSearchParamsName)
                    }}
                    itemActions={itemActions}
                />
            );
        }
    }

    if ('children' in currentPanel) {
        return (
            <Navigate to={generatePath(routes.panel, {panelId: currentPanel.children.at(0)?.id}) + search} replace />
        );
    }

    return null; // TODO: this case should not happen
};
