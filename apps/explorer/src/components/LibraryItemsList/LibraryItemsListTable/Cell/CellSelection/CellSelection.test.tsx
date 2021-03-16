// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import CellSelection from './CellSelection';

describe('CellSelection', () => {
    test('', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<CellSelection index="0" id="id" library="library" />);
        });

        expect(comp);
    });
});
