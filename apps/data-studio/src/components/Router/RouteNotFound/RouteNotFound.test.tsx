// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import RouteNotFound from './RouteNotFound';

describe('RouteNotFound', () => {
    test('should render 404 message in header', async () => {
        render(<RouteNotFound />);

        expect(screen.getByText(/page_not_found/i)).toBeInTheDocument();
    });
});
