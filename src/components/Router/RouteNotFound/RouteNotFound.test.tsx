import {mount} from 'enzyme';
import React from 'react';
import {Header} from 'semantic-ui-react';
import RouteNotFound from './RouteNotFound';

describe('RouteNotFound', () => {
    test('should render 404 message in header', async () => {
        const comp = mount(<RouteNotFound />);

        expect(comp.find(Header)).toHaveLength(1);
    });
});
