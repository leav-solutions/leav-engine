// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '../../_tests/testUtils';
import SubmitStateNotifier from './SubmitStateNotifier';

describe('SubmitStateNotifier', () => {
    test('Render test', async () => {
        render(<SubmitStateNotifier state="processing" />);

        expect(screen.getByRole('img')).toBeInTheDocument();
    });
});
