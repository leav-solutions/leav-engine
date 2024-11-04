// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '../../_tests/testUtils';
import FieldsGroup from './FieldsGroup';

describe('FieldsGroup', () => {
    test('Render test', async () => {
        render(
            <FieldsGroup label="My Label">
                <div>CHILD</div>
            </FieldsGroup>
        );

        expect(screen.getByRole('group', {name: 'My Label'})).toBeInTheDocument();
        expect(screen.getByText('CHILD')).toBeInTheDocument();
    });
});
