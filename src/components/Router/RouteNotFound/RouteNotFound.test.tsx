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
