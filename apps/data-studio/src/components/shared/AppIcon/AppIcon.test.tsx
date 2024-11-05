// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import AppIcon from './AppIcon';

describe('AppIcon', () => {
    test('Render app icon', async () => {
        render(<AppIcon size="big" />);

        expect(screen.getByRole('img')).toHaveAttribute('src', '/global-icon/big');
    });
});
