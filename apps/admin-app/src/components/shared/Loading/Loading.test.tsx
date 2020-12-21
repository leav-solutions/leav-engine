// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {create} from 'react-test-renderer';
import Loading from '../../shared/Loading';

describe('Loading', () => {
    test('Snapshot test', async () => {
        const comp = create(<Loading />).toJSON();

        expect(comp).toMatchSnapshot();
    });

    test('Display dimmer', () => {
        const comp = shallow(<Loading withDimmer />);

        expect(comp.find('Dimmer').length).toBe(1);
    });
});
