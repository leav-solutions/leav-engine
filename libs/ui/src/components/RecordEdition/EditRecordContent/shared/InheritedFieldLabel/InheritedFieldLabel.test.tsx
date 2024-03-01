// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import InheritedFieldLabel from './InheritedFieldLabel';

describe('InheritedFieldLabel', () => {
    test('Display version label', async () => {
        render(
            <InheritedFieldLabel
                version={{
                    lang: {
                        id: '1337',
                        label: 'Français'
                    },
                    region: {
                        id: '42',
                        label: 'Isère'
                    }
                }}
            />
        );

        expect(screen.getByText(/inherited_from/)).toBeInTheDocument();
        expect(screen.getByText(/Français/)).toBeInTheDocument();
        expect(screen.getByText(/Isère/)).toBeInTheDocument();
    });
});
