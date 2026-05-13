import {render, screen} from '../../_tests/testUtils';
import FieldsGroup from './FieldsGroup';

describe('FieldsGroup', () => {
    test('Render test', async () => {
        render(
            <FieldsGroup label="My Label">
                <div>CHILD</div>
            </FieldsGroup>,
        );

        expect(screen.getByRole('group', {name: 'My Label'})).toBeInTheDocument();
        expect(screen.getByText('CHILD')).toBeInTheDocument();
    });
});
