import React from 'react';
import {render} from '../../../_tests/testUtils';
import AppIcon from './AppIcon';

describe('AppIcon', () => {
    test('Render app icon', async () => {
        const {container} = render(<AppIcon size="big" />);

        const img = container.querySelector('img');
        expect(img).toHaveAttribute('src', '/global-icon/big');
    });
});
