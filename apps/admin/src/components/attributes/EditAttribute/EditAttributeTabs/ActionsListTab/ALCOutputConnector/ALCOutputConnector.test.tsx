// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render} from 'enzyme';
import ALCOutputConnector from './ALCOutputConnector';

describe('ALCOutputConnector', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ALCOutputConnector
                connectionState="connected"
                connColor={[]}
                size={100}
                types={['']}
                colorTypeDictionnary={{int: [255, 255, 255]}}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
