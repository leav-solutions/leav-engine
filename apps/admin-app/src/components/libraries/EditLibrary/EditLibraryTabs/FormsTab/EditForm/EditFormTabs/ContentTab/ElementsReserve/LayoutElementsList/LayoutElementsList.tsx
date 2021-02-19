// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
