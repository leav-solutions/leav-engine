import React from 'react';
import {IFormBuilderStateAndDispatch} from '../../formBuilderReducer/formBuilderReducer';
import {layoutElements} from '../../uiElements';
import ReserveLayoutElement from './ReserveLayoutElement';

function LayoutElementsList({state, dispatch}: IFormBuilderStateAndDispatch): JSX.Element {
    return (
        <>
            {Object.keys(layoutElements).map(key => (
                <ReserveLayoutElement key={key} element={layoutElements[key]} state={state} dispatch={dispatch} />
            ))}
        </>
    );
}

export default LayoutElementsList;
