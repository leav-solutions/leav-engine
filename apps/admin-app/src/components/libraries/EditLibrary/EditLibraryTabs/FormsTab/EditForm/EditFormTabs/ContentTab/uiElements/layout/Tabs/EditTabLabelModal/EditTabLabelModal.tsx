// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Input, Modal} from 'semantic-ui-react';
import useLang from '../../../../../../../../../../../../hooks/useLang';
import {FormBuilderActionTypes} from '../../../../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElement} from '../../../../_types';
import {ITabSettings} from '../Tabs';

interface IEditTabLabelModalProps {
    open: boolean;
    onClose: () => void;
    tabsElement: IFormElement;
    tab: ITabSettings;
}

function EditTabLabelModal({open, tabsElement, tab, onClose}: IEditTabLabelModalProps): JSX.Element {
    const {availableLangs} = useLang();
    const {dispatch} = useFormBuilderReducer();

    const _handleChange = (lang: string) => (_, data) => {
        const existingTabs = tabsElement?.settings?.tabs ?? [];
        const tabIndex = existingTabs.findIndex(t => t.id === tab.id);

        if (tabIndex === -1) {
            return;
        }

        const newTabs = [...existingTabs];
        newTabs[tabIndex] = {
            ...newTabs[tabIndex],
            label: {
                ...newTabs[tabIndex].label,
                [lang]: data.value
            }
        };

        const newSettings = {
            ...tabsElement?.settings,
            tabs: newTabs
        };

        dispatch({
            type: FormBuilderActionTypes.SAVE_SETTINGS,
            element: tabsElement,
            settings: newSettings
        });
    };

    const _handleKeyPress = e => {
        if (e.key === 'Enter') {
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose} closeOnEscape closeOnDimmerClick closeIcon size="small" centered basic>
            <Modal.Header />
            <Modal.Content>
                {availableLangs.map((l, i) => (
                    <Input
                        fluid
                        key={l}
                        name={l}
                        label={l}
                        defaultValue={tab?.label?.[l] ?? ''}
                        style={{margin: '1em'}}
                        onChange={_handleChange(l)}
                        onKeyDown={_handleKeyPress}
                    />
                ))}
            </Modal.Content>
        </Modal>
    );
}

export default EditTabLabelModal;
