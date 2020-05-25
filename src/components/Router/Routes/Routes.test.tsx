import {mount} from 'enzyme';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import Home from '../../Home';
import RouteNotFound from '../RouteNotFound';
import Routes from './Routes';

describe('Routes', () => {
    test('default url call Home', async () => {
        const comp = mount(
            <MemoryRouter initialEntries={['/']}>
                <Routes />
            </MemoryRouter>
        );

        expect(comp.find(Home)).toHaveLength(1);
    });

    test('404 call notFound', async () => {
        const comp = mount(
            <MemoryRouter initialEntries={['/fakeUrl']}>
                <Routes />
            </MemoryRouter>
        );

        expect(comp.find(RouteNotFound)).toHaveLength(1);
    });
});
