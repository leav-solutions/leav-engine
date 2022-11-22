// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import FieldFooter from './FieldFooter';

describe('FieldFooter', () => {
    test('Render test', async () => {
        render(
            <FieldFooter>
                <div>some child</div>
            </FieldFooter>
        );

        expect(screen.getByText('some child')).toBeInTheDocument();
    });
});
