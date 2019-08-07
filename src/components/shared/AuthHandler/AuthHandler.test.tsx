import React from 'react';
import {render} from 'enzyme';
import AuthHandler from './AuthHandler';

describe('AuthHandler', () => {
    test('Snapshot test', async () => {
        const comp = render(<AuthHandler url={process.env.REACT_APP_AUTH_URL || ''} />);

        expect(comp).toMatchSnapshot();
    });
});
