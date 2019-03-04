import React from 'react';
import {render} from 'enzyme';
import ForbiddenRoute from './ForbiddenRoute';

describe('ForbiddenRoute', () => {
    test('Snapshot test', async () => {
        const comp = render(<ForbiddenRoute />);

        expect(comp).toMatchSnapshot();
    });
});
