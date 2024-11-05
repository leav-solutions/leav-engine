// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as leavUi from '@leav/ui';
import {render, screen} from '_tests/testUtils';
import ApplicationSettings from './ApplicationSettings';

describe('ApplicationSettings', () => {
    jest.spyOn(leavUi, 'EditApplication').mockImplementation(() => <div>EditApplication</div>);

    test('Render test', async () => {
        render(<ApplicationSettings />);

        expect(screen.getByText('EditApplication')).toBeInTheDocument();
    });
});
