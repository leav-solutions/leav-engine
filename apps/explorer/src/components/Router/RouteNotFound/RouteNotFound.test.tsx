// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import RouteNotFound from './RouteNotFound';

describe('RouteNotFound', () => {
    test('should render 404 message in header', async () => {
        const comp = mount(<RouteNotFound />);

        expect(comp.find('h1')).toHaveLength(1);
        expect(comp.text()).toContain(404);
    });
});
