import React from 'react';
import {Sidebar} from 'semantic-ui-react';
import {FormElementTypes} from '../../../../../../../../../_gqlTypes/globalTypes';
import {defaultContainerId, IFormBuilderStateAndDispatch} from '../formBuilderReducer/formBuilderReducer';
import {layoutElements} from '../uiElements';
import {IFormElement, UIElementTypes} from '../_types';
import SettingsEdition from './SettingsEdition';

function FormLayout({state, dispatch}: IFormBuilderStateAndDispatch): JSX.Element {
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
