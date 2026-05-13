import React from 'react';
import {layoutElements} from '../../uiElements';
import ReserveLayoutElement from './ReserveLayoutElement';

function LayoutElementsList(): JSX.Element {
    return (
        <>
            {Object.keys(layoutElements).map(key => (
                <ReserveLayoutElement key={key} element={layoutElements[key]} />
            ))}
        </>
    );
}

export default LayoutElementsList;
