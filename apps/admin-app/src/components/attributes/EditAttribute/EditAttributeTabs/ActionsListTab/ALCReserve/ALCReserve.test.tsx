// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render} from 'enzyme';
import ALCReserve from './ALCReserve';

function numPlaceHolder() {
    return -1;
}

function placeHolder() {
    return undefined;
}

describe('ALCReserve', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ALCReserve
                actions={[]}
                setCurrentIndex={numPlaceHolder}
                colorTypeDictionnary={{int: []}}
                addActionToList={placeHolder}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
