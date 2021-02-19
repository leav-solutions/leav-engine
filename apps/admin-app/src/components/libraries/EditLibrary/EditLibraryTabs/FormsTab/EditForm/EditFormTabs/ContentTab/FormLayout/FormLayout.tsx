// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Sidebar} from 'semantic-ui-react';
import {FormElementTypes} from '../../../../../../../../../_gqlTypes/globalTypes';
import {defaultContainerId} from '../formBuilderReducer/formBuilderReducer';
import {useFormBuilderReducer} from '../formBuilderReducer/hook/useFormBuilderReducer';
import {layoutElements} from '../uiElements';
import {IFormElement, UIElementTypes} from '../_types';
import SettingsEdition from './SettingsEdition';

function FormLayout(): JSX.Element {
    const {state, dispatch} = useFormBuilderReducer();
    const {openSettings, elementInSettings} = state;

    const rootContainer: IFormElement = {
        id: defaultContainerId,
        order: 0,
        containerId: defaultContainerId,
        type: FormElementTypes.layout,
        uiElement: layoutElements[UIElementTypes.FIELDS_CONTAINER]
    };

    // Render layout
    return (
        <Sidebar.Pushable>
            <rootContainer.uiElement.component.type elementData={rootContainer} state={state} dispatch={dispatch} />
            {openSettings && (
                <Sidebar
                    animation="overlay"
                    direction="right"
                    width="wide"
                    visible={openSettings}
                    style={{background: '#DDDDDD', textAlign: 'center'}}
                >
                    {!!elementInSettings && <SettingsEdition state={state} dispatch={dispatch} />}
                </Sidebar>
            )}
        </Sidebar.Pushable>
    );
}

export default FormLayout;
