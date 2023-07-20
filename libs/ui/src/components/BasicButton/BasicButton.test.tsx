// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '../../_tests/testUtils';
import BasicButton from './BasicButton';

describe('BasicButton', () => {
    test('Render test', async () => {
        render(<BasicButton>My Button</BasicButton>);

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('My Button')).toBeInTheDocument();
    });
});
