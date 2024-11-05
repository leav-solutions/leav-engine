// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render} from 'enzyme';
import ConnectorRect from './ConnectorRect';

describe('ConnectorRect', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <ConnectorRect
                size={1}
                types={['1', '2', '3']}
                colorTypeDictionnary={{float: [255, 0, 0], integer: [0, 255, 0], string: [0, 0, 255]}}
            />
        );

        expect(comp).toMatchSnapshot();
    });
});
