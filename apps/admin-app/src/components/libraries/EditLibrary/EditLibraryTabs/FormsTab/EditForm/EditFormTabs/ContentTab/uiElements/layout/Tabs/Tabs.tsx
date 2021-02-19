// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, Menu, Tab} from 'semantic-ui-react';
import {v4 as uuid} from 'uuid';
import {layoutElements} from '../..';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../../../../../utils';
import {FormElementTypes} from '../../../../../../../../../../../_gqlTypes/globalTypes';
import {IKeyValue} from '../../../../../../../../../../../_types/shared';
import {FormBuilderActionTypes} from '../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElement, IFormElementProps, UIElementTypes} from '../../../_types';
import EditTabLabelModal from './EditTabLabelModal';

export interface ITabSettings {
    label?: IKeyValue<string>;
    id: string;
}

export interface ITabsSettings {
    tabs?: ITabSettings[];
}

function Tabs({settings, elementData}: IFormElementProps<ITabsSettings>): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [showEditTabModal, setShowEditTabModal] = useState<boolean>(false);
    const {state, dispatch} = useFormBuilderReducer();

    const _getNewTab = (index?: number): ITabSettings => ({
        label: {fr: t('forms.new_tab_label', {index})},
        id: uuid()
    });

    if (!elementData || !dispatch || !state) {
        return <></>;
    }

    // Adjust active index so that the 'plus' tab is never active
    if (settings?.tabs?.length && activeIndex === settings?.tabs?.length) {
        setActiveIndex(settings?.tabs?.length > 1 ? activeIndex - 1 : 0);
    }

    if (!settings.tabs?.length) {
        dispatch({
            type: FormBuilderActionTypes.SAVE_SETTINGS,
            element: elementData,
            settings: {
                ...elementData?.settings,
                tabs: [_getNewTab()]
            }
        });
    }

    const _handleTabChange = (_, data) => {
        setActiveIndex(data.activeIndex);
    };

    const _handleAddTab = () => {
        if (!dispatch) {
            return;
        }

        const newTabs: ITabSettings[] = [...(elementData?.settings?.tabs ?? []), _getNewTab()];

        dispatch({
            type: FormBuilderActionTypes.SAVE_SETTINGS,
            element: elementData,
            settings: {
                ...elementData?.settings,
                tabs: newTabs
            }
        });
    };

    const _handleDeleteTab = tabId => () => {
        dispatch({
            type: FormBuilderActionTypes.REMOVE_TAB,
            tabId,
            parentElement: elementData
        });
    };

    const _handleShowEditTabModal = () => setShowEditTabModal(true);
    const _handleCloseEditTabModal = () => setShowEditTabModal(false);

    const tabsToDisplay = settings.tabs || [];
    const panes = tabsToDisplay.map(tab => ({
        menuItem: (
            <Menu.Item key={tab.id}>
                {localizedLabel(tab.label ?? null, lang)}
                <Button.Group icon compact basic size="small" style={{marginLeft: '10px'}}>
                    <Button onClick={_handleShowEditTabModal}>
                        <Icon name="edit" />
                    </Button>
                    {tabsToDisplay.length > 1 && (
                        <Button>
                            <Icon name="cancel" onClick={_handleDeleteTab(tab.id)} />
                        </Button>
                    )}
                </Button.Group>
            </Menu.Item>
        ),
        render: () => {
            const containerElement: IFormElement = {
                uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER],
                id: `${elementData.id}/${tab.id}`,
                order: 0,
                containerId: elementData?.id,
                type: FormElementTypes.layout,
                settings: {}
            };

            return (
                <Tab.Pane>
                    <containerElement.uiElement.component.type
                        state={state}
                        dispatch={dispatch}
                        elementData={containerElement}
                    />
                </Tab.Pane>
            );
        }
    }));

    panes.push({
        menuItem: (
            <Menu.Item key="new_tab" onClick={_handleAddTab}>
                <Icon name="plus" />
            </Menu.Item>
        ),
        render: () => <Tab.Pane />
    });

    return (
        <>
            <Tab activeIndex={activeIndex} onTabChange={_handleTabChange} panes={panes} />
            <EditTabLabelModal
                open={showEditTabModal}
                tab={tabsToDisplay[activeIndex]}
                tabsElement={elementData}
                onClose={_handleCloseEditTabModal}
            />
        </>
    );
}

export default Tabs;
