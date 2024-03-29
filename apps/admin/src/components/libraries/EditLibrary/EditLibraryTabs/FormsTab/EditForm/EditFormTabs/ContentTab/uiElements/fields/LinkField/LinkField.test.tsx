// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import LinkField from './LinkField';
import {render, screen} from '../../../../../../../../../../../_tests/testUtils';

describe('LinkField', () => {
    it('should display input with specified label', async () => {
        const label = 'toto';
        render(<LinkField settings={{label}} />);

        expect(screen.getByText(label)).toBeVisible();
        expect(screen.getByText(label)).not.toHaveClass('required');
    });

    it('should display input with required class if specified', async () => {
        const label = 'tata';
        render(<LinkField settings={{label, required: true}} />);

        expect(screen.getByText(label)).toHaveClass('required');
    });
});
