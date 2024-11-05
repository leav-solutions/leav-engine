// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import AdvancedSettings from './AdvancedSettings';

describe('AdvancedSettings', () => {
    test('Display showTransparency settings', async () => {
        render(<AdvancedSettings />);

        expect(screen.getByRole('switch', {name: /showTransparency/})).toBeInTheDocument();
    });
});
